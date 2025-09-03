import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async suppliersPayments(projectId: number, phaseId?: number) {
    const where: any = { projectId, direction: 'out' };
    if (phaseId) where.phaseId = phaseId;
    const rows = await this.prisma.treasuryTransaction.groupBy({
      by: ['supplierId'],
      where,
      _sum: { amount: true },
    });
    const suppliers = await this.prisma.supplier.findMany({
      where: { id: { in: rows.map((r) => r.supplierId!).filter(Boolean) } },
    });
    const idToName = new Map(suppliers.map((s) => [s.id, s.name] as const));
    return rows.map((r) => ({
      supplierId: r.supplierId,
      supplierName: r.supplierId ? idToName.get(r.supplierId) : null,
      paid: Number(r._sum.amount || 0),
    }));
  }

  async treasurySummary(projectId: number) {
    const [inSum, outSum] = await Promise.all([
      this.prisma.treasuryTransaction.aggregate({ where: { projectId, direction: 'in' }, _sum: { amount: true } }),
      this.prisma.treasuryTransaction.aggregate({ where: { projectId, direction: 'out' }, _sum: { amount: true } }),
    ]);
    const incoming = Number(inSum._sum.amount || 0);
    const outgoing = Number(outSum._sum.amount || 0);
    return {
      incoming,
      outgoing,
      balance: incoming - outgoing,
    };
  }

  async settlementsReport(projectId: number, phaseId: number) {
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

