import { TreasuryService } from './treasury.service';
declare class ReceiptDto {
    partnerId?: number;
    partnerName?: string;
    amount: number;
    date?: string;
    method?: string;
    reference?: string;
}
declare class PaymentDto {
    supplierId?: number;
    supplierName?: string;
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
            plannedAmount: import("@prisma/client/runtime/library").Decimal | null;
        } | null;
        material: {
            projectId: number;
            id: number;
            supplierId: number;
            phaseId: number;
            name: string;
            createdAt: Date;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            total: import("@prisma/client/runtime/library").Decimal;
        } | null;
    } & {
        projectId: number;
        direction: import("@prisma/client").$Enums.Direction;
        amount: import("@prisma/client/runtime/library").Decimal;
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
    receipt(projectId: number, dto: ReceiptDto): Promise<{
        projectId: number;
        direction: import("@prisma/client").$Enums.Direction;
        amount: import("@prisma/client/runtime/library").Decimal;
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
    payment(projectId: number, dto: PaymentDto): Promise<{
        projectId: number;
        direction: import("@prisma/client").$Enums.Direction;
        amount: import("@prisma/client/runtime/library").Decimal;
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
export {};
