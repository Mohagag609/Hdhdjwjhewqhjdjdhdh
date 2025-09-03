import { PrismaService } from '../prisma/prisma.service';
export declare class SettlementsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    run(projectId: number, phaseId: number): Promise<{
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
