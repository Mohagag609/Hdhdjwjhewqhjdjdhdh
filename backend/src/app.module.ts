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
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    // Serve the built frontend from backend/public at /app
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/app',
    }),
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
