import { Body, Controller, Get, Post } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

@ApiTags('suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliers: SuppliersService) {}

  @Post()
  async create(@Body() dto: CreateSupplierDto) {
    return this.suppliers.create(dto.name);
  }

  @Get()
  async list() {
    return this.suppliers.list();
  }
}

