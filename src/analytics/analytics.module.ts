// src/analytics/analytics.module.ts (виправлена версія)
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Task, TaskSchema } from '../tasks/schemas/task.schema';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';
import { Column, ColumnSchema } from '../columns/schemas/column.schema';
import { ProjectOwnerGuard } from '../projects/guards/project-owner.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Column.name, schema: ColumnSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, ProjectOwnerGuard],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}