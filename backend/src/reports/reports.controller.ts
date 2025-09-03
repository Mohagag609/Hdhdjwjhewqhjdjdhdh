import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('reports')
@Controller('projects/:projectId/reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('suppliers')
  async suppliers(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query('phaseId') phaseId?: string,
  ) {
    return this.reports.suppliersPayments(projectId, phaseId ? Number(phaseId) : undefined);
  }

  @Get('treasury')
  async treasury(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.reports.treasurySummary(projectId);
  }

  @Get('settlements')
  async settlements(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query('phaseId') phaseId: string,
  ) {
    return this.reports.settlementsReport(projectId, Number(phaseId));
  }
}

