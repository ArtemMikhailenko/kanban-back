// src/columns/columns.module.ts (виправлена версія)
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';
import { Column, ColumnSchema } from './schemas/column.schema';
import { TasksModule } from '../tasks/tasks.module';
import { ProjectsModule } from '../projects/projects.module';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';
import { ProjectOwnerGuard } from '../projects/guards/project-owner.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Column.name, schema: ColumnSchema },
      { name: Project.name, schema: ProjectSchema }, // Додано схему проекту
    ]),
    forwardRef(() => TasksModule),
    forwardRef(() => ProjectsModule), // Додано проектний модуль
  ],
  controllers: [ColumnsController],
  providers: [ColumnsService, ProjectOwnerGuard], // Додано ProjectOwnerGuard як провайдер
  exports: [ColumnsService],
})
export class ColumnsModule {}