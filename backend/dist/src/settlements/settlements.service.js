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
exports.SettlementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let SettlementsService = class SettlementsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async run(projectId, phaseId) {
        const phase = await this.prisma.phase.findFirst({ where: { id: phaseId, projectId } });
        if (!phase)
            throw new common_1.NotFoundException('Phase not found in project');
        const phaseAgg = await this.prisma.materialItem.aggregate({
            where: { projectId, phaseId },
            _sum: { total: true },
        });
        const phaseCost = new client_1.Prisma.Decimal(phaseAgg._sum.total ?? 0);
        const partners = await this.prisma.projectPartner.findMany({
            where: { projectId },
            include: { partner: true },
        });
        const contributions = await this.prisma.treasuryTransaction.groupBy({
            by: ['partnerId'],
            where: { projectId, direction: 'in' },
            _sum: { amount: true },
        });
        const partnerIdToPaid = {};
        for (const c of contributions) {
            if (c.partnerId != null)
                partnerIdToPaid[c.partnerId] = new client_1.Prisma.Decimal(c._sum.amount ?? 0);
        }
        const results = [];
        for (const pp of partners) {
            const amountDue = phaseCost.mul(pp.percentage).div(100);
            const paid = partnerIdToPaid[pp.partnerId] ?? new client_1.Prisma.Decimal(0);
            const delta = amountDue.sub(paid);
            const status = delta.gt(0)
                ? 'needs_to_pay'
                : delta.lt(0)
                    ? 'needs_refund'
                    : 'settled';
            results.push({
                partnerId: pp.partnerId,
                partnerName: pp.partner.name,
                amountDue,
                amountPaidToDate: paid,
                delta,
                status,
            });
        }
        await this.prisma.$transaction(async (tx) => {
            for (const r of results) {
                await tx.partnerPhaseSettlement.upsert({
                    where: {
                        projectId_phaseId_partnerId: {
                            projectId,
                            phaseId,
                            partnerId: r.partnerId,
                        },
                    },
                    create: {
                        projectId,
                        phaseId,
                        partnerId: r.partnerId,
                        amountDue: r.amountDue,
                        amountPaidToDate: r.amountPaidToDate,
                        delta: r.delta,
                        status: r.status,
                    },
                    update: {
                        amountDue: r.amountDue,
                        amountPaidToDate: r.amountPaidToDate,
                        delta: r.delta,
                        status: r.status,
                    },
                });
            }
        });
        return results.map((r) => ({
            partnerId: r.partnerId,
            partnerName: r.partnerName,
            amountDue: r.amountDue.toNumber(),
            amountPaidToDate: r.amountPaidToDate.toNumber(),
            delta: r.delta.toNumber(),
            settlementStatus: r.status,
        }));
    }
    async list(projectId, phaseId) {
        const rows = await this.prisma.partnerPhaseSettlement.findMany({
            where: { projectId, phaseId },
            include: { partner: true },
            orderBy: { partnerId: 'asc' },
        });
        return rows.map((r) => ({
            partnerId: r.partnerId,
            partnerName: r.partner.name,
            amountDue: Number(r.amountDue),
            amountPaidToDate: Number(r.amountPaidToDate),
            delta: Number(r.delta),
            settlementStatus: r.status,
        }));
    }
};
exports.SettlementsService = SettlementsService;
exports.SettlementsService = SettlementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettlementsService);
//# sourceMappingURL=settlements.service.js.map