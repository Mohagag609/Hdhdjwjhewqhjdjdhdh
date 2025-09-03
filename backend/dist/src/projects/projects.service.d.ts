import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class ProjectsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        name: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        name: string;
        startDate: Date | null;
        endDate: Date | null;
        createdAt: Date;
        id: number;
    }>;
    findOne(projectId: number): Promise<{
        phases: {
            name: string;
            createdAt: Date;
            id: number;
            projectId: number;
            plannedAmount: Prisma.Decimal | null;
        }[];
        partners: ({
            partner: {
                name: string;
                createdAt: Date;
                id: number;
            };
        } & {
            projectId: number;
            partnerId: number;
            percentage: Prisma.Decimal;
        })[];
    } & {
        name: string;
        startDate: Date | null;
        endDate: Date | null;
        createdAt: Date;
        id: number;
    }>;
    list(): Promise<{
        name: string;
        startDate: Date | null;
        endDate: Date | null;
        createdAt: Date;
        id: number;
    }[]>;
    setPartners(projectId: number, items: Array<{
        name: string;
        percentage: number;
    }>): Promise<({
        partner: {
            name: string;
            createdAt: Date;
            id: number;
        };
    } & {
        projectId: number;
        partnerId: number;
        percentage: Prisma.Decimal;
    })[]>;
}
