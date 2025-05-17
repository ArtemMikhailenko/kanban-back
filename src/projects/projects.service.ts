// src/projects/projects.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ColumnsService } from '../columns/columns.service';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    private columnsService: ColumnsService,
  ) {}

  async create(createProjectDto: CreateProjectDto, user: UserDocument): Promise<ProjectDocument> {
    // Створюємо новий проект
    const newProject = new this.projectModel({
      ...createProjectDto,
      owner: user._id,
      columnOrder: [],
    });
    
    const savedProject = await newProject.save();
    
    // Створюємо стандартні колонки для проекту
    const defaultColumns = [
      { title: 'Задачі', projectId: savedProject._id },
      { title: 'В роботі', projectId: savedProject._id },
      { title: 'Готово', projectId: savedProject._id },
    ];
    
    // Додаємо колонки та оновлюємо порядок колонок в проекті
    const columnIds: string[] = [];

    for (const columnData of defaultColumns) {
      const column = await this.columnsService.create(columnData);
      columnIds.push(column._id.toString());
    }
    
    // Оновлюємо порядок колонок
    savedProject.columnOrder = columnIds;
    
    return savedProject.save();
  }

  async findAll(user: UserDocument): Promise<ProjectDocument[]> {
    return this.projectModel.find({ owner: user._id }).exec();
  }

  async findOne(id: string, user: UserDocument): Promise<ProjectDocument> {
    const project = await this.projectModel.findById(id).exec();
    
    if (!project) {
      throw new NotFoundException(`Проект з ID ${id} не знайдено`);
    }
    
    // Перевіряємо, чи користувач є власником проекту
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException('У вас немає доступу до цього проекту');
    }
    
    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    user: UserDocument
  ): Promise<ProjectDocument> {
    // Перевіряємо, чи існує проєкт і чи має користувач доступ
    await this.findOne(id, user);
  
    // Оновлюємо документ і повертаємо нову версію
    const updatedProject = await this.projectModel
      .findByIdAndUpdate(
        id,
        {
          ...updateProjectDto,
          updatedAt: new Date(),
        },
        { new: true }
      )
      .exec();
  
    // Якщо з якоїсь причини не знайшлося (TypeScript вимагає обробити null)
    if (!updatedProject) {
      throw new NotFoundException(`Проєкт з ID ${id} не знайдено під час оновлення`);
    }
  
    return updatedProject;
  }
  

  async remove(id: string, user: UserDocument): Promise<void> {
    // Перевіряємо, чи проект існує і чи користувач має права на нього
    const project = await this.findOne(id, user);
    
    // Видаляємо всі колонки проекту
    for (const columnId of project.columnOrder) {
      await this.columnsService.remove(columnId);
    }
    
    // Видаляємо проект
    await this.projectModel.findByIdAndDelete(id).exec();
  }

  // Метод для оновлення порядку колонок в проекті
  async updateColumnOrder(
    id: string,
    columnOrder: string[],
    user: UserDocument
  ): Promise<ProjectDocument> {
    // Перевіряємо, чи існує проєкт і чи має користувач доступ
    await this.findOne(id, user);
  
    // Оновлюємо порядок колонок
    const updatedProject = await this.projectModel
      .findByIdAndUpdate(
        id,
        {
          columnOrder,
          updatedAt: new Date(),
        },
        { new: true }
      )
      .exec();
  
    // Якщо TypeScript бачить можливий null — кидаємо помилку
    if (!updatedProject) {
      throw new NotFoundException(`Проєкт з ID ${id} не знайдено під час оновлення порядку колонок`);
    }
  
    return updatedProject;
  }
  
}