import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class AddMaterialDto {
  @IsString()
  @IsNotEmpty()
  supplierName!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @Type(() => Number)
  @IsNumber()
  quantity!: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @Type(() => Number)
  @IsNumber()
  unitPrice!: number;
}

@ApiTags('materials')
@Controller('projects/:projectId/phases/:phaseId/materials')
export class MaterialsController {
  constructor(private readonly materials: MaterialsService) {}

  @Post()
  async add(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('phaseId', ParseIntPipe) phaseId: number,
    @Body() dto: AddMaterialDto,
  ) {
    return this.materials.addItem(projectId, phaseId, dto);
  }

  @Get()
  async list(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('phaseId', ParseIntPipe) phaseId: number,
  ) {
    return this.materials.list(projectId, phaseId);
  }
}

