import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { ApiTags } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class RunSettlementDto {
  @Type(() => Number)
  @IsNumber()
  phaseId!: number;
}

@ApiTags('settlements')
@Controller('projects/:projectId/settlements')
export class SettlementsController {
  constructor(private readonly settlements: SettlementsService) {}

  @Post('run')
  async run(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: RunSettlementDto,
  ) {
    return this.settlements.run(projectId, dto.phaseId);
  }

  @Get(':phaseId')
  async list(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('phaseId', ParseIntPipe) phaseId: number,
  ) {
    return this.settlements.list(projectId, phaseId);
  }
}

