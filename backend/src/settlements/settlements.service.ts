import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, SettlementStatus } from '@prisma/client';

@Injectable()
export class SettlementsService {
  constructor(private readonly prisma: PrismaService) {}

  async run(projectId: number, phaseId: number) {
    // ensure project and phase exist
    const phase = await this.prisma.phase.findFirst({ where: { id: phaseId, projectId } });
    if (!phase) throw new NotFoundException('Phase not found in project');

    // cost of phase
    const phaseAgg = await this.prisma.materialItem.aggregate({
      where: { projectId, phaseId },
      _sum: { total: true },
    });
    const phaseCost = new Prisma.Decimal(phaseAgg._sum.total ?? 0);

    // partners with percentages
    const partners = await this.prisma.projectPartner.findMany({
      where: { projectId },
      include: { partner: true },
    });

    // contributed by partner (until now). Optionally filter by date range or tx linking to phase.
    const contributions = await this.prisma.treasuryTransaction.groupBy({
      by: ['partnerId'],
      where: { projectId, direction: 'in' },
      _sum: { amount: true },
    });
    const partnerIdToPaid: Record<number, Prisma.Decimal> = {};
    for (const c of contributions) {
      if (c.partnerId != null) partnerIdToPaid[c.partnerId] = new Prisma.Decimal(c._sum.amount ?? 0);
    }

    const results = [] as Array<{
      partnerId: number;
      partnerName: string;
      amountDue: Prisma.Decimal;
      amountPaidToDate: Prisma.Decimal;
      delta: Prisma.Decimal;
      status: SettlementStatus;
    }>;

    for (const pp of partners) {
      const amountDue = phaseCost.mul(pp.percentage).div(100);
      const paid = partnerIdToPaid[pp.partnerId] ?? new Prisma.Decimal(0);
      const delta = amountDue.sub(paid);
      const status: SettlementStatus = delta.gt(0)
        ? 'needs_to_pay'
        : delta.lt(0)
        ? 'needs_refund'
        : 'settled';
      results.push({
        partnerId: pp.partnerId,
        partnerName: pp.partner.name,
        amountDue,
        amountPaidToDate: paid,
        delta,
        status,
      });
    }

    // persist snapshot
    await this.prisma.$transaction(async (tx) => {
      for (const r of results) {
        await tx.partnerPhaseSettlement.upsert({
          where: {
            projectId_phaseId_partnerId: {
              projectId,
              phaseId,
              partnerId: r.partnerId,
            },
          },
          create: {
            projectId,
            phaseId,
            partnerId: r.partnerId,
            amountDue: r.amountDue,
            amountPaidToDate: r.amountPaidToDate,
            delta: r.delta,
            status: r.status,
          },
          update: {
            amountDue: r.amountDue,
            amountPaidToDate: r.amountPaidToDate,
            delta: r.delta,
            status: r.status,
          },
        });
      }
    });

    return results.map((r) => ({
      partnerId: r.partnerId,
      partnerName: r.partnerName,
      amountDue: r.amountDue.toNumber(),
      amountPaidToDate: r.amountPaidToDate.toNumber(),
      delta: r.delta.toNumber(),
      settlementStatus: r.status,
    }));
  }

  async list(projectId: number, phaseId: number) {
    const rows = await this.prisma.partnerPhaseSettlement.findMany({
      where: { projectId, phaseId },
      include: { partner: true },
      orderBy: { partnerId: 'asc' },
    });
    return rows.map((r) => ({
      partnerId: r.partnerId,
      partnerName: r.partner.name,
      amountDue: Number(r.amountDue),
      amountPaidToDate: Number(r.amountPaidToDate),
      delta: Number(r.delta),
      settlementStatus: r.status,
    }));
  }
}

