// src/projects/projects.module.ts (виправлена версія)
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project, ProjectSchema } from './schemas/project.schema';
import { ColumnsModule } from '../columns/columns.module';
import { ProjectOwnerGuard } from './guards/project-owner.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    forwardRef(() => ColumnsModule), // Використовуємо forwardRef для уникнення циклічної залежності
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectOwnerGuard], // Додаємо ProjectOwnerGuard як провайдер
  exports: [ProjectsService, MongooseModule], // Експортуємо MongooseModule для доступу до моделі Project
})
export class ProjectsModule {}