// src/tasks/tasks.service.ts - виправлена версія
import { Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ColumnsService } from '../columns/columns.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @Inject(forwardRef(() => ColumnsService))
    private columnsService: ColumnsService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<TaskDocument> {
    // Створюємо нову задачу
    const newTask = new this.taskModel({
      ...createTaskDto,
      deadline: createTaskDto.deadline ? new Date(createTaskDto.deadline) : undefined,
    });
    
    const savedTask = await newTask.save();
    
    // Додаємо задачу до колонки
    await this.columnsService.addTask(String(createTaskDto.columnId), String(savedTask._id));
    
    // Створюємо сповіщення про дедлайн, якщо він вказаний
    if (savedTask.deadline) {
      await this.notificationsService.scheduleDeadlineNotification(savedTask);
    }
    
    return savedTask;
  }

  async findAll(projectId: string): Promise<TaskDocument[]> {
    return this.taskModel.find({ projectId }).exec();
  }

  async findOne(id: string): Promise<TaskDocument> {
    const task = await this.taskModel.findById(id).exec();
    
    if (!task) {
      throw new NotFoundException(`Задачу з ID ${id} не знайдено`);
    }
    
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<TaskDocument> {
    const task = await this.findOne(id);
    
    // Якщо змінюється колонка, оновлюємо зв'язки
    if (updateTaskDto.columnId && String(task.columnId) !== String(updateTaskDto.columnId)) {
      // Видаляємо задачу з старої колонки
      await this.columnsService.removeTask(String(task.columnId), id);
      
      // Додаємо задачу до нової колонки
      await this.columnsService.addTask(String(updateTaskDto.columnId), id);
    }
    
    // Обробляємо дедлайн
    let deadlineDate: Date | null | undefined = undefined;
    if (updateTaskDto.deadline !== undefined) {
      deadlineDate = updateTaskDto.deadline ? new Date(updateTaskDto.deadline) : null;
      
      // Оновлюємо сповіщення про дедлайн
      if (deadlineDate) {
        // Скасовуємо старі сповіщення
        await this.notificationsService.cancelDeadlineNotifications(id);
        // Створюємо нові сповіщення
        await this.notificationsService.scheduleDeadlineNotification({
          ...task.toJSON(), // Використовуйте toJSON() замість toObject()
          deadline: deadlineDate,
          _id: task._id, // Переконайтесь, що _id передається правильно
        } as TaskDocument);
      } else {
        // Скасовуємо сповіщення, якщо дедлайн видалено
        await this.notificationsService.cancelDeadlineNotifications(id);
      }
    }
    
    // Оновлюємо задачу
    const updatedTask = await this.taskModel
      .findByIdAndUpdate(
        id,
        { 
          ...updateTaskDto,
          deadline: deadlineDate,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();
    
    if (!updatedTask) {
      throw new NotFoundException(`Задачу з ID ${id} не знайдено`);
    }
    
    return updatedTask;
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    
    // Видаляємо задачу з колонки
    await this.columnsService.removeTask(String(task.columnId), id);
    
    // Скасовуємо сповіщення про дедлайн
    await this.notificationsService.cancelDeadlineNotifications(id);
    
    // Видаляємо задачу
    await this.taskModel.findByIdAndDelete(id).exec();
  }

  async moveTask(id: string, targetColumnId: string): Promise<TaskDocument> {
    const task = await this.findOne(id);
    
    // Перевіряємо, чи задача вже не знаходиться в цільовій колонці
    if (String(task.columnId) === targetColumnId) {
      return task;
    }
    
    // Видаляємо задачу з поточної колонки
    await this.columnsService.removeTask(String(task.columnId), id);
    
    // Додаємо задачу до нової колонки
    await this.columnsService.addTask(targetColumnId, id);
    
    // Оновлюємо колонку в задачі
    task.columnId = new Types.ObjectId(targetColumnId) as any;
    task.updatedAt = new Date();
    
    return task.save();
  }

  async findAllWithDeadlines(from: Date, to: Date): Promise<TaskDocument[]> {
    return this.taskModel
      .find({
        deadline: {
          $gte: from,
          $lte: to,
        },
      })
      .exec();
  }

  async findUpcomingDeadlines(days: number = 7): Promise<TaskDocument[]> {
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + days);
    
    return this.taskModel
      .find({
        deadline: {
          $gte: today,
          $lte: future,
        },
      })
      .exec();
  }

  async findOverdueTasks(): Promise<TaskDocument[]> {
    const today = new Date();
    
    return this.taskModel
      .find({
        deadline: { $lt: today },
      })
      .exec();
  }
}