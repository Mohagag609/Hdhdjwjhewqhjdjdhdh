import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class TreasuryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getBalance(projectId: number): Promise<Prisma.Decimal>;
    list(projectId: number): Promise<({
        partner: {
            id: number;
            name: string;
            createdAt: Date;
        } | null;
        supplier: {
            id: number;
            name: string;
            createdAt: Date;
        } | null;
        phase: {
            projectId: number;
            id: number;
            name: string;
            createdAt: Date;
            plannedAmount: Prisma.Decimal | null;
        } | null;
        material: {
            projectId: number;
            id: number;
            supplierId: number;
            phaseId: number;
            name: string;
            createdAt: Date;
            quantity: Prisma.Decimal;
            unit: string | null;
            unitPrice: Prisma.Decimal;
            total: Prisma.Decimal;
        } | null;
    } & {
        projectId: number;
        direction: import("@prisma/client").$Enums.Direction;
        amount: Prisma.Decimal;
        id: number;
        partnerId: number | null;
        supplierId: number | null;
        phaseId: number | null;
        materialItemId: number | null;
        txDate: Date;
        reference: string | null;
        method: string | null;
        notes: string | null;
    })[]>;
    receipt(projectId: number, dto: {
        partnerId?: number;
        partnerName?: string;
        amount: number;
        date?: string;
        method?: string;
        reference?: string;
    }): Promise<{
        projectId: number;
        direction: import("@prisma/client").$Enums.Direction;
        amount: Prisma.Decimal;
        id: number;
        partnerId: number | null;
        supplierId: number | null;
        phaseId: number | null;
        materialItemId: number | null;
        txDate: Date;
        reference: string | null;
        method: string | null;
        notes: string | null;
    }>;
    payment(projectId: number, dto: {
        supplierId?: number;
        supplierName?: string;
        amount: number;
        phaseId?: number;
        materialItemId?: number;
        date?: string;
        method?: string;
        reference?: string;
    }): Promise<{
        projectId: number;
        direction: import("@prisma/client").$Enums.Direction;
        amount: Prisma.Decimal;
        id: number;
        partnerId: number | null;
        supplierId: number | null;
        phaseId: number | null;
        materialItemId: number | null;
        txDate: Date;
        reference: string | null;
        method: string | null;
        notes: string | null;
    }>;
}
