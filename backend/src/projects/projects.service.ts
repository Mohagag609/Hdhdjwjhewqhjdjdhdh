import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; startDate?: Date; endDate?: Date }) {
    return this.prisma.project.create({ data });
  }

  async findOne(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        partners: { include: { partner: true } },
        phases: true,
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async list() {
    return this.prisma.project.findMany({ orderBy: { id: 'desc' } });
  }

  async setPartners(projectId: number, items: Array<{ name: string; percentage: number }>) {
    if (!items.length) throw new BadRequestException('Partners list cannot be empty');
    const total = items.reduce((s, it) => s + Number(it.percentage || 0), 0);
    if (Math.abs(total - 100) > 0.01) {
      throw new BadRequestException('Partners percentages must sum to 100');
    }

    // ensure project exists
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    // upsert partners and project_partners within a transaction
    await this.prisma.$transaction(async (tx) => {
      // clear existing
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
            percentage: new Prisma.Decimal(it.percentage),
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
}

