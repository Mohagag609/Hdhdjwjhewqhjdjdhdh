import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    suppliersPayments(projectId: number, phaseId?: number): Promise<{
        supplierId: number | null;
        supplierName: string | null | undefined;
        paid: number;
    }[]>;
    treasurySummary(projectId: number): Promise<{
        incoming: number;
        outgoing: number;
        balance: number;
    }>;
    settlementsReport(projectId: number, phaseId: number): Promise<{
        partnerId: number;
        partnerName: string;
        amountDue: number;
        amountPaidToDate: number;
        delta: number;
        settlementStatus: import("@prisma/client").$Enums.SettlementStatus;
    }[]>;
}
