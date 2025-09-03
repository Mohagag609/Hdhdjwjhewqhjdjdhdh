import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class PhasesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(projectId: number, data: {
        name: string;
        plannedAmount?: number;
    }): Promise<{
        name: string;
        createdAt: Date;
        id: number;
        projectId: number;
        plannedAmount: Prisma.Decimal | null;
    }>;
    list(projectId: number): Promise<{
        name: string;
        createdAt: Date;
        id: number;
        projectId: number;
        plannedAmount: Prisma.Decimal | null;
    }[]>;
}
