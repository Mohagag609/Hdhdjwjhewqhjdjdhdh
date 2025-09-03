import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class TreasuryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getBalance(projectId: number): Promise<Prisma.Decimal>;
    list(projectId: number): Promise<({
        phase: {
            name: string;
            createdAt: Date;
            id: number;
            projectId: number;
            plannedAmount: Prisma.Decimal | null;
        } | null;
        partner: {
            name: string;
            createdAt: Date;
            id: number;
        } | null;
        supplier: {
            name: string;
            createdAt: Date;
            id: number;
        } | null;
        material: {
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
        } | null;
    } & {
        id: number;
        projectId: number;
        partnerId: number | null;
        phaseId: number | null;
        supplierId: number | null;
        direction: import("@prisma/client").$Enums.Direction;
        amount: Prisma.Decimal;
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
        id: number;
        projectId: number;
        partnerId: number | null;
        phaseId: number | null;
        supplierId: number | null;
        direction: import("@prisma/client").$Enums.Direction;
        amount: Prisma.Decimal;
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
        id: number;
        projectId: number;
        partnerId: number | null;
        phaseId: number | null;
        supplierId: number | null;
        direction: import("@prisma/client").$Enums.Direction;
        amount: Prisma.Decimal;
        materialItemId: number | null;
        txDate: Date;
        reference: string | null;
        method: string | null;
        notes: string | null;
    }>;
}
