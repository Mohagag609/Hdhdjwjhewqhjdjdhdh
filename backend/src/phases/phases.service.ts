import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PhasesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(projectId: number, data: { name: string; plannedAmount?: number }) {
    // ensure project exists
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.phase.create({
      data: {
        projectId,
        name: data.name,
        plannedAmount: data.plannedAmount != null ? new Prisma.Decimal(data.plannedAmount) : undefined,
      },
    });
  }

  async list(projectId: number) {
    return this.prisma.phase.findMany({ where: { projectId }, orderBy: { id: 'asc' } });
  }
}

