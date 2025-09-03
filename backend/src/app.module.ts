import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PhasesModule } from './phases/phases.module';
import { MaterialsModule } from './materials/materials.module';
import { TreasuryModule } from './treasury/treasury.module';
import { SettlementsModule } from './settlements/settlements.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ProjectsModule,
    SuppliersModule,
    PhasesModule,
    MaterialsModule,
    TreasuryModule,
    SettlementsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
