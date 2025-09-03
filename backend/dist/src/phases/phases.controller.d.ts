import { PhasesService } from './phases.service';
declare class CreatePhaseDto {
    name: string;
    plannedAmount?: number;
}
export declare class PhasesController {
    private readonly phases;
    constructor(phases: PhasesService);
    create(projectId: number, dto: CreatePhaseDto): Promise<{
        name: string;
        createdAt: Date;
        id: number;
        projectId: number;
        plannedAmount: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    list(projectId: number): Promise<{
        name: string;
        createdAt: Date;
        id: number;
        projectId: number;
        plannedAmount: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
}
export {};
