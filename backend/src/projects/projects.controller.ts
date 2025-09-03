import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ApiTags } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

class PartnerPercentageDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage!: number;
}

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Post()
  async create(@Body() dto: CreateProjectDto) {
    return this.projects.create({
      name: dto.name,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });
  }

  @Get()
  async list() {
    return this.projects.list();
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    return this.projects.findOne(id);
  }

  @Get(':id/partners')
  async getPartners(@Param('id', ParseIntPipe) id: number) {
    const rows = await this.projects.findOne(id);
    return rows.partners.map((pp) => ({
      partnerId: pp.partnerId,
      partnerName: pp.partner.name,
      percentage: Number(pp.percentage),
    }));
  }

  @Post(':id/partners')
  async setPartners(
    @Param('id', ParseIntPipe) id: number,
    @Body() items: PartnerPercentageDto[],
  ) {
    return this.projects.setPartners(id, items);
  }
}

