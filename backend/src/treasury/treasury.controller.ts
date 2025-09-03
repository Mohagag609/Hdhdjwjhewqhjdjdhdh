import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { TreasuryService } from './treasury.service';
import { ApiTags } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class ReceiptDto {
  @Type(() => Number)
  @IsNumber()
  partnerId!: number;

  @Type(() => Number)
  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  method?: string;

  @IsOptional()
  reference?: string;
}

class PaymentDto {
  @Type(() => Number)
  @IsNumber()
  supplierId!: number;

  @Type(() => Number)
  @IsNumber()
  amount!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  phaseId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  materialItemId?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  method?: string;

  @IsOptional()
  reference?: string;
}

@ApiTags('treasury')
@Controller('projects/:projectId/treasury')
export class TreasuryController {
  constructor(private readonly treasury: TreasuryService) {}

  @Get('balance')
  async balance(@Param('projectId', ParseIntPipe) projectId: number) {
    const val = await this.treasury.getBalance(projectId);
    return { treasuryBalance: val.toNumber() };
  }

  @Get('transactions')
  async list(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.treasury.list(projectId);
  }

  @Post('receipts')
  async receipt(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: ReceiptDto,
  ) {
    return this.treasury.receipt(projectId, dto);
  }

  @Post('payments')
  async payment(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: PaymentDto,
  ) {
    return this.treasury.payment(projectId, dto);
  }
}

