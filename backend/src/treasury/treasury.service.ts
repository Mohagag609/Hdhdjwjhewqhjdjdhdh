import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Direction, Prisma } from '@prisma/client';

@Injectable()
export class TreasuryService {
  constructor(private readonly prisma: PrismaService) {}

  async getBalance(projectId: number) {
    const [inSum, outSum] = await Promise.all([
      this.prisma.treasuryTransaction.aggregate({
        where: { projectId, direction: 'in' },
        _sum: { amount: true },
      }),
      this.prisma.treasuryTransaction.aggregate({
        where: { projectId, direction: 'out' },
        _sum: { amount: true },
      }),
    ]);
    const inVal = new Prisma.Decimal(inSum._sum.amount ?? 0);
    const outVal = new Prisma.Decimal(outSum._sum.amount ?? 0);
    return inVal.sub(outVal);
  }

  async list(projectId: number) {
    return this.prisma.treasuryTransaction.findMany({
      where: { projectId },
      orderBy: { id: 'desc' },
      include: { partner: true, supplier: true, phase: true, material: true },
    });
  }

  async receipt(projectId: number, dto: {
    partnerId: number;
    amount: number;
    date?: string;
    method?: string;
    reference?: string;
  }) {
    // ensure partner and project
    const [project, partner] = await Promise.all([
      this.prisma.project.findUnique({ where: { id: projectId } }),
      this.prisma.partner.findUnique({ where: { id: dto.partnerId } }),
    ]);
    if (!project) throw new NotFoundException('Project not found');
    if (!partner) throw new NotFoundException('Partner not found');
    if (dto.amount <= 0) throw new BadRequestException('Amount must be > 0');

    return this.prisma.treasuryTransaction.create({
      data: {
        projectId,
        direction: Direction.in,
        amount: new Prisma.Decimal(dto.amount),
        txDate: dto.date ? new Date(dto.date) : undefined,
        method: dto.method,
        reference: dto.reference,
        partnerId: partner.id,
      },
    });
  }

  async payment(projectId: number, dto: {
    supplierId: number;
    amount: number;
    phaseId?: number;
    materialItemId?: number;
    date?: string;
    method?: string;
    reference?: string;
  }) {
    // ensure supplier and project and optional refs
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const supplier = await this.prisma.supplier.findUnique({ where: { id: dto.supplierId } });
    if (!supplier) throw new NotFoundException('Supplier not found');

    if (dto.phaseId) {
      const phase = await this.prisma.phase.findFirst({ where: { id: dto.phaseId, projectId } });
      if (!phase) throw new NotFoundException('Phase not found in project');
    }
    if (dto.materialItemId) {
      const mi = await this.prisma.materialItem.findFirst({ where: { id: dto.materialItemId, projectId } });
      if (!mi) throw new NotFoundException('Material item not found in project');
    }
    if (dto.amount <= 0) throw new BadRequestException('Amount must be > 0');

    const balance = await this.getBalance(projectId);
    if (balance.sub(dto.amount).lt(0)) {
      throw new BadRequestException('Insufficient treasury balance');
    }

    return this.prisma.treasuryTransaction.create({
      data: {
        projectId,
        direction: Direction.out,
        amount: new Prisma.Decimal(dto.amount),
        txDate: dto.date ? new Date(dto.date) : undefined,
        method: dto.method,
        reference: dto.reference,
        supplierId: dto.supplierId,
        phaseId: dto.phaseId,
        materialItemId: dto.materialItemId,
      },
    });
  }
}

