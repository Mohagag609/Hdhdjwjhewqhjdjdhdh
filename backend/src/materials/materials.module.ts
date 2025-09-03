import { Module } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SuppliersModule } from '../suppliers/suppliers.module';

@Module({
  imports: [PrismaModule, SuppliersModule],
  controllers: [MaterialsController],
  providers: [MaterialsService],
})
export class MaterialsModule {}

