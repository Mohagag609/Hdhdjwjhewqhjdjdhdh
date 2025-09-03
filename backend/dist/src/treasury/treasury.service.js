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
exports.TreasuryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TreasuryService = class TreasuryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBalance(projectId) {
        const [inSum, outSum] = await Promise.all([
            this.prisma.treasuryTransaction.aggregate({
                where: { projectId, direction: 'in' },
                _sum: { amount: true },
            }),
            this.prisma.treasuryTransaction.aggregate({
                where: { projectId, direction: 'out' },
                _sum: { amount: true },
            }),
        ]);
        const inVal = new client_1.Prisma.Decimal(inSum._sum.amount ?? 0);
        const outVal = new client_1.Prisma.Decimal(outSum._sum.amount ?? 0);
        return inVal.sub(outVal);
    }
    async list(projectId) {
        return this.prisma.treasuryTransaction.findMany({
            where: { projectId },
            orderBy: { id: 'desc' },
            include: { partner: true, supplier: true, phase: true, material: true },
        });
    }
    async receipt(projectId, dto) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        let partnerId = dto.partnerId;
        if (!partnerId && dto.partnerName) {
            const p = await this.prisma.partner.findFirst({ where: { name: dto.partnerName } });
            if (!p)
                throw new common_1.NotFoundException('Partner not found');
            partnerId = p.id;
        }
        if (!partnerId)
            throw new common_1.NotFoundException('Partner not specified');
        if (dto.amount <= 0)
            throw new common_1.BadRequestException('Amount must be > 0');
        return this.prisma.treasuryTransaction.create({
            data: {
                projectId,
                direction: client_1.Direction.in,
                amount: new client_1.Prisma.Decimal(dto.amount),
                txDate: dto.date ? new Date(dto.date) : undefined,
                method: dto.method,
                reference: dto.reference,
                partnerId,
            },
        });
    }
    async payment(projectId, dto) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        let supplierId = dto.supplierId;
        if (!supplierId && dto.supplierName) {
            const s = await this.prisma.supplier.findFirst({ where: { name: dto.supplierName } });
            if (!s)
                throw new common_1.NotFoundException('Supplier not found');
            supplierId = s.id;
        }
        if (!supplierId)
            throw new common_1.NotFoundException('Supplier not specified');
        if (dto.phaseId) {
            const phase = await this.prisma.phase.findFirst({ where: { id: dto.phaseId, projectId } });
            if (!phase)
                throw new common_1.NotFoundException('Phase not found in project');
        }
        if (dto.materialItemId) {
            const mi = await this.prisma.materialItem.findFirst({ where: { id: dto.materialItemId, projectId } });
            if (!mi)
                throw new common_1.NotFoundException('Material item not found in project');
        }
        if (dto.amount <= 0)
            throw new common_1.BadRequestException('Amount must be > 0');
        const balance = await this.getBalance(projectId);
        if (balance.sub(dto.amount).lt(0)) {
            throw new common_1.BadRequestException('Insufficient treasury balance');
        }
        return this.prisma.treasuryTransaction.create({
            data: {
                projectId,
                direction: client_1.Direction.out,
                amount: new client_1.Prisma.Decimal(dto.amount),
                txDate: dto.date ? new Date(dto.date) : undefined,
                method: dto.method,
                reference: dto.reference,
                supplierId,
                phaseId: dto.phaseId,
                materialItemId: dto.materialItemId,
            },
        });
    }
};
exports.TreasuryService = TreasuryService;
exports.TreasuryService = TreasuryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TreasuryService);
//# sourceMappingURL=treasury.service.js.map