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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ProjectsService = class ProjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.project.create({ data });
    }
    async findOne(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                partners: { include: { partner: true } },
                phases: true,
            },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        return project;
    }
    async list() {
        return this.prisma.project.findMany({ orderBy: { id: 'desc' } });
    }
    async setPartners(projectId, items) {
        if (!items.length)
            throw new common_1.BadRequestException('Partners list cannot be empty');
        const total = items.reduce((s, it) => s + Number(it.percentage || 0), 0);
        if (Math.abs(total - 100) > 0.01) {
            throw new common_1.BadRequestException('Partners percentages must sum to 100');
        }
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        await this.prisma.$transaction(async (tx) => {
            await tx.projectPartner.deleteMany({ where: { projectId } });
            for (const it of items) {
                const partner = await tx.partner.upsert({
                    where: { name: it.name },
                    update: {},
                    create: { name: it.name },
                });
                await tx.projectPartner.create({
                    data: {
                        projectId,
                        partnerId: partner.id,
                        percentage: new client_1.Prisma.Decimal(it.percentage),
                    },
                });
            }
        });
        return this.prisma.projectPartner.findMany({
            where: { projectId },
            include: { partner: true },
            orderBy: { partnerId: 'asc' },
        });
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map