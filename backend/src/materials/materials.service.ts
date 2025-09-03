import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { SuppliersService } from '../suppliers/suppliers.service';

@Injectable()
export class MaterialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly suppliers: SuppliersService,
  ) {}

  async addItem(projectId: number, phaseId: number, dto: {
    supplierName: string;
    name: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
  }) {
    // ensure project & phase exist
    const phase = await this.prisma.phase.findFirst({ where: { id: phaseId, projectId } });
    if (!phase) throw new NotFoundException('Phase not found in project');

    if (dto.quantity <= 0 || dto.unitPrice < 0) {
      throw new BadRequestException('Invalid quantity or unitPrice');
    }

    const supplier = await this.suppliers.ensureByName(dto.supplierName);

    const quantity = new Prisma.Decimal(dto.quantity);
    const unitPrice = new Prisma.Decimal(dto.unitPrice);
    const total = quantity.mul(unitPrice);

    return this.prisma.materialItem.create({
      data: {
        projectId,
        phaseId,
        supplierId: supplier.id,
        name: dto.name,
        quantity,
        unit: dto.unit,
        unitPrice,
        total,
      },
    });
  }

  async list(projectId: number, phaseId: number) {
    return this.prisma.materialItem.findMany({
      where: { projectId, phaseId },
      include: { supplier: true },
      orderBy: { id: 'asc' },
    });
  }
}

