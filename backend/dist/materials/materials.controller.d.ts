import { MaterialsService } from './materials.service';
declare class AddMaterialDto {
    supplierName: string;
    name: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
}
export declare class MaterialsController {
    private readonly materials;
    constructor(materials: MaterialsService);
    add(projectId: number, phaseId: number, dto: AddMaterialDto): Promise<{
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
    }>;
    list(projectId: number, phaseId: number): Promise<({
        supplier: {
            name: string;
            createdAt: Date;
            id: number;
        };
    } & {
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
    })[]>;
}
export {};
