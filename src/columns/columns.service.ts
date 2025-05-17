// src/columns/columns.service.ts
import { Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Column, ColumnDocument } from './schemas/column.schema';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
    @Inject(forwardRef(() => TasksService))
    private tasksService: TasksService,
  ) {}

  async create(createColumnDto: CreateColumnDto): Promise<ColumnDocument> {
    const newColumn = new this.columnModel(createColumnDto);
    return newColumn.save();
  }

  async findAll(projectId: string): Promise<ColumnDocument[]> {
    return this.columnModel.find({ projectId }).exec();
  }

  async findOne(id: string): Promise<ColumnDocument> {
    const column = await this.columnModel.findById(id).exec();
    
    if (!column) {
      throw new NotFoundException(`Колонку з ID ${id} не знайдено`);
    }
    
    return column;
  }

  async update(id: string, updateColumnDto: UpdateColumnDto): Promise<ColumnDocument> {
    const updatedColumn = await this.columnModel
      .findByIdAndUpdate(
        id,
        { ...updateColumnDto, updatedAt: new Date() },
        { new: true },
      )
      .exec();
    
    if (!updatedColumn) {
      throw new NotFoundException(`Колонку з ID ${id} не знайдено`);
    }
    
    return updatedColumn;
  }

  async remove(id: string): Promise<void> {
    const column = await this.findOne(id);
    
    // Видаляємо всі задачі в колонці
    for (const taskId of column.taskIds) {
      await this.tasksService.remove(taskId);
    }
    
    await this.columnModel.findByIdAndDelete(id).exec();
  }

  async updateTaskOrder(id: string, taskIds: string[]): Promise<ColumnDocument> {
    const updatedColumn = await this.columnModel
      .findByIdAndUpdate(
        id,
        { taskIds, updatedAt: new Date() },
        { new: true },
      )
      .exec();
    
    if (!updatedColumn) {
      throw new NotFoundException(`Колонку з ID ${id} не знайдено`);
    }
    
    return updatedColumn;
  }

  // Метод для додавання задачі в колонку
  async addTask(columnId: string, taskId: string): Promise<ColumnDocument> {
    const column = await this.findOne(columnId);
    column.taskIds.push(taskId);
    column.updatedAt = new Date();
    return column.save();
  }

  // Метод для видалення задачі з колонки
  async removeTask(columnId: string, taskId: string): Promise<ColumnDocument> {
    const column = await this.findOne(columnId);
    column.taskIds = column.taskIds.filter(id => id !== taskId);
    column.updatedAt = new Date();
    return column.save();
  }
}