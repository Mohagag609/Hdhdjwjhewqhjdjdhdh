import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reports;
    constructor(reports: ReportsService);
    suppliers(projectId: number, phaseId?: string): Promise<{
        supplierId: number | null;
        supplierName: string | null | undefined;
        paid: number;
    }[]>;
    treasury(projectId: number): Promise<{
        incoming: number;
        outgoing: number;
        balance: number;
    }>;
    settlements(projectId: number, phaseId: string): Promise<{
        partnerId: number;
        partnerName: string;
        amountDue: number;
        amountPaidToDate: number;
        delta: number;
        settlementStatus: import("@prisma/client").$Enums.SettlementStatus;
    }[]>;
}
