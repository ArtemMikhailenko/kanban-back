// src/projects/guards/project-owner.guard.ts (виправлена версія)
import { Injectable, CanActivate, ExecutionContext, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../schemas/project.schema';

@Injectable()
export class ProjectOwnerGuard implements CanActivate {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Отримуємо projectId з запиту
    let projectId: string | undefined = undefined;

    
    if (request.body && request.body.projectId) {
      projectId = request.body.projectId;
    } else if (request.params && request.params.id) {
      // Перевіряємо, чи це ID проекту або ID колонки/задачі
      try {
        const project = await this.projectModel.findById(request.params.id).exec();
        if (project) {
          projectId = request.params.id;
        }
      } catch (error) {
        // Це не ID проекту, ігноруємо помилку
      }
    }
    
    // Якщо не знайшли projectId, пропускаємо запит
    if (!projectId) {
      // Для колонок і задач projectId може бути в тілі запиту
      return true;
    }
    
    // Знаходимо проект
    const project = await this.projectModel.findById(projectId).exec();
    
    if (!project) {
      throw new NotFoundException(`Проект з ID ${projectId} не знайдено`);
    }
    
    // Перевіряємо, чи користувач є власником проекту
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException('У вас немає доступу до цього проекту');
    }
    
    return true;
  }
}