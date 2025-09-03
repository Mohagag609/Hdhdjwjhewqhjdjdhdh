import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { PhasesService } from './phases.service';
import { ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class CreatePhaseDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  plannedAmount?: number;
}

@ApiTags('phases')
@Controller('projects/:projectId/phases')
export class PhasesController {
  constructor(private readonly phases: PhasesService) {}

  @Post()
  async create(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreatePhaseDto,
  ) {
    return this.phases.create(projectId, dto);
  }

  @Get()
  async list(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.phases.list(projectId);
  }
}

