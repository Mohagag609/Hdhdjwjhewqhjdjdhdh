import { SuppliersService } from './suppliers.service';
declare class CreateSupplierDto {
    name: string;
}
export declare class SuppliersController {
    private readonly suppliers;
    constructor(suppliers: SuppliersService);
    create(dto: CreateSupplierDto): Promise<{
        name: string;
        createdAt: Date;
        id: number;
    }>;
    list(): Promise<{
        name: string;
        createdAt: Date;
        id: number;
    }[]>;
}
export {};
