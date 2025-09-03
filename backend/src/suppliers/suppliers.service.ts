import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string) {
    return this.prisma.supplier.create({ data: { name } });
  }

  async list() {
    return this.prisma.supplier.findMany({ orderBy: { id: 'desc' } });
  }

  async ensureByName(name: string) {
    const existing = await this.prisma.supplier.findUnique({ where: { name } });
    if (existing) return existing;
    return this.create(name);
  }
}

