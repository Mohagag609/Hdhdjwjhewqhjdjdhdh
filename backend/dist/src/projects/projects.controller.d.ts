import { ProjectsService } from './projects.service';
declare class CreateProjectDto {
    name: string;
    startDate?: string;
    endDate?: string;
}
declare class PartnerPercentageDto {
    name: string;
    percentage: number;
}
export declare class ProjectsController {
    private readonly projects;
    constructor(projects: ProjectsService);
    create(dto: CreateProjectDto): Promise<{
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
    get(id: number): Promise<{
        phases: {
            name: string;
            createdAt: Date;
            id: number;
            projectId: number;
            plannedAmount: import("@prisma/client/runtime/library").Decimal | null;
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
            percentage: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        name: string;
        startDate: Date | null;
        endDate: Date | null;
        createdAt: Date;
        id: number;
    }>;
    getPartners(id: number): Promise<{
        partnerId: number;
        partnerName: string;
        percentage: number;
    }[]>;
    setPartners(id: number, items: PartnerPercentageDto[]): Promise<({
        partner: {
            name: string;
            createdAt: Date;
            id: number;
        };
    } & {
        projectId: number;
        partnerId: number;
        percentage: import("@prisma/client/runtime/library").Decimal;
    })[]>;
}
export {};
