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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async suppliersPayments(projectId, phaseId) {
        const where = { projectId, direction: 'out' };
        if (phaseId)
            where.phaseId = phaseId;
        const rows = await this.prisma.treasuryTransaction.groupBy({
            by: ['supplierId'],
            where,
            _sum: { amount: true },
        });
        const suppliers = await this.prisma.supplier.findMany({
            where: { id: { in: rows.map((r) => r.supplierId).filter(Boolean) } },
        });
        const idToName = new Map(suppliers.map((s) => [s.id, s.name]));
        return rows.map((r) => ({
            supplierId: r.supplierId,
            supplierName: r.supplierId ? idToName.get(r.supplierId) : null,
            paid: Number(r._sum.amount || 0),
        }));
    }
    async treasurySummary(projectId) {
        const [inSum, outSum] = await Promise.all([
            this.prisma.treasuryTransaction.aggregate({ where: { projectId, direction: 'in' }, _sum: { amount: true } }),
            this.prisma.treasuryTransaction.aggregate({ where: { projectId, direction: 'out' }, _sum: { amount: true } }),
        ]);
        const incoming = Number(inSum._sum.amount || 0);
        const outgoing = Number(outSum._sum.amount || 0);
        return {
            incoming,
            outgoing,
            balance: incoming - outgoing,
        };
    }
    async settlementsReport(projectId, phaseId) {
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
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map