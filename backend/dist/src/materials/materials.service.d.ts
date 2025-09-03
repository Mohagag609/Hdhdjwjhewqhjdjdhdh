import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { SuppliersService } from '../suppliers/suppliers.service';
export declare class MaterialsService {
    private readonly prisma;
    private readonly suppliers;
    constructor(prisma: PrismaService, suppliers: SuppliersService);
    addItem(projectId: number, phaseId: number, dto: {
        supplierName: string;
        name: string;
        quantity: number;
        unit?: string;
        unitPrice: number;
    }): Promise<{
        name: string;
        createdAt: Date;
        id: number;
        projectId: number;
        quantity: Prisma.Decimal;
        unit: string | null;
        unitPrice: Prisma.Decimal;
        total: Prisma.Decimal;
        phaseId: number;
        supplierId: number;
    }>;
    list(projectId: number, phaseId: number): Promise<({
        supplier: {
            name: string;
            createdAt: Date;
            id: number;
        };
    } & {
        name: string;
        createdAt: Date;
        id: number;
        projectId: number;
        quantity: Prisma.Decimal;
        unit: string | null;
        unitPrice: Prisma.Decimal;
        total: Prisma.Decimal;
        phaseId: number;
        supplierId: number;
    })[]>;
}
