// src/tasks/tasks.module.ts (виправлена версія)
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task, TaskSchema } from './schemas/task.schema';
import { ColumnsModule } from '../columns/columns.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProjectsModule } from '../projects/projects.module';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';
import { ProjectOwnerGuard } from '../projects/guards/project-owner.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Project.name, schema: ProjectSchema }, // Додаємо схему проекту
    ]),
    forwardRef(() => ColumnsModule),
    forwardRef(() => ProjectsModule), // Додаємо проектний модуль
    NotificationsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, ProjectOwnerGuard], // Додаємо ProjectOwnerGuard
  exports: [TasksService],
})
export class TasksModule {}