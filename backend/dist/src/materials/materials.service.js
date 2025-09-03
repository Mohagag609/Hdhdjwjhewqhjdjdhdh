"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const suppliers_service_1 = require("../suppliers/suppliers.service");
let MaterialsService = class MaterialsService {
    prisma;
    suppliers;
    constructor(prisma, suppliers) {
        this.prisma = prisma;
        this.suppliers = suppliers;
    }
    async addItem(projectId, phaseId, dto) {
        const phase = await this.prisma.phase.findFirst({ where: { id: phaseId, projectId } });
        if (!phase)
            throw new common_1.NotFoundException('Phase not found in project');
        if (dto.quantity <= 0 || dto.unitPrice < 0) {
            throw new common_1.BadRequestException('Invalid quantity or unitPrice');
        }
        const supplier = await this.suppliers.ensureByName(dto.supplierName);
        const quantity = new client_1.Prisma.Decimal(dto.quantity);
        const unitPrice = new client_1.Prisma.Decimal(dto.unitPrice);
        const total = quantity.mul(unitPrice);
        return this.prisma.materialItem.create({
            data: {
                projectId,
                phaseId,
                supplierId: supplier.id,
                name: dto.name,
                quantity,
                unit: dto.unit,
                unitPrice,
                total,
            },
        });
    }
    async list(projectId, phaseId) {
        return this.prisma.materialItem.findMany({
            where: { projectId, phaseId },
            include: { supplier: true },
            orderBy: { id: 'asc' },
        });
    }
};
exports.MaterialsService = MaterialsService;
exports.MaterialsService = MaterialsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        suppliers_service_1.SuppliersService])
], MaterialsService);
//# sourceMappingURL=materials.service.js.map