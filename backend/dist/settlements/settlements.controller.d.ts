import { SettlementsService } from './settlements.service';
declare class RunSettlementDto {
    phaseId: number;
}
export declare class SettlementsController {
    private readonly settlements;
    constructor(settlements: SettlementsService);
    run(projectId: number, dto: RunSettlementDto): Promise<{
        partnerId: number;
        partnerName: string;
        amountDue: number;
        amountPaidToDate: number;
        delta: number;
        settlementStatus: import("@prisma/client").$Enums.SettlementStatus;
    }[]>;
    list(projectId: number, phaseId: number): Promise<{
        partnerId: number;
        partnerName: string;
        amountDue: number;
        amountPaidToDate: number;
        delta: number;
        settlementStatus: import("@prisma/client").$Enums.SettlementStatus;
    }[]>;
}
export {};
