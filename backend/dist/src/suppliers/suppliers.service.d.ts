import { PrismaService } from '../prisma/prisma.service';
export declare class SuppliersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(name: string): Promise<{
        name: string;
        createdAt: Date;
        id: number;
    }>;
    list(): Promise<{
        name: string;
        createdAt: Date;
        id: number;
    }[]>;
    ensureByName(name: string): Promise<{
        name: string;
        createdAt: Date;
        id: number;
    }>;
}
