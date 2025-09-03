import { TreasuryService } from './treasury.service';
declare class ReceiptDto {
    partnerId: number;
    amount: number;
    date?: string;
    method?: string;
    reference?: string;
}
declare class PaymentDto {
    supplierId: number;
    amount: number;
    phaseId?: number;
    materialItemId?: number;
    date?: string;
    method?: string;
    reference?: string;
}
export declare class TreasuryController {
    private readonly treasury;
    constructor(treasury: TreasuryService);
    balance(projectId: number): Promise<{
        treasuryBalance: number;
    }>;
    list(projectId: number): Promise<({
        partner: {
            name: string;
            createdAt: Date;
            id: number;
        } | null;
        phase: {
            name: string;
            createdAt: Date;
            id: number;
            projectId: number;
            plannedAmount: import("@prisma/client/runtime/library").Decimal | null;
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
            quantity: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            total: import("@prisma/client/runtime/library").Decimal;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        txDate: Date;
        reference: string | null;
        method: string | null;
        notes: string | null;
        materialItemId: number | null;
    })[]>;
    receipt(projectId: number, dto: ReceiptDto): Promise<{
        id: number;
        projectId: number;
        partnerId: number | null;
        phaseId: number | null;
        supplierId: number | null;
        direction: import("@prisma/client").$Enums.Direction;
        amount: import("@prisma/client/runtime/library").Decimal;
        txDate: Date;
        reference: string | null;
        method: string | null;
        notes: string | null;
        materialItemId: number | null;
    }>;
    payment(projectId: number, dto: PaymentDto): Promise<{
        id: number;
        projectId: number;
        partnerId: number | null;
        phaseId: number | null;
        supplierId: number | null;
        direction: import("@prisma/client").$Enums.Direction;
        amount: import("@prisma/client/runtime/library").Decimal;
        txDate: Date;
        reference: string | null;
        method: string | null;
        notes: string | null;
        materialItemId: number | null;
    }>;
}
export {};
