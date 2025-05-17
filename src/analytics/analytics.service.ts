// src/analytics/analytics.service.ts (оновлений)
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from '../tasks/schemas/task.schema';
import { Project, ProjectDocument } from '../projects/schemas/project.schema';
import { Column, ColumnDocument } from '../columns/schemas/column.schema';
import { startOfDay, endOfDay, subDays, subMonths, isWithinInterval } from 'date-fns';
import { 
  ProjectStats, 
  ActivityData, 
  ColumnDistribution, 
  UserStatistics 
} from './interfaces/analytics.interfaces';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
  ) {}

  /**
   * Отримати загальну статистику для користувача
   */
  async getUserStatistics(
    userId: string, 
    timeRange: 'week' | 'month' | 'all' | 'custom' = 'month', 
    customRange?: { start: Date; end: Date }
  ): Promise<UserStatistics> {
    // Визначення часового діапазону
    const dateRange = this.getDateRange(timeRange, customRange);
    
    // Знаходимо всі проекти користувача
    const projects = await this.projectModel.find({ owner: userId }).exec();
    const projectIds = projects.map(project => project._id);
    
    // Знаходимо всі завдання для цих проектів у заданому часовому діапазоні
    const tasks = await this.taskModel.find({
      projectId: { $in: projectIds },
      createdAt: { 
        $gte: dateRange.start,
        $lte: dateRange.end
      }
    }).exec();
    
    // Знаходимо колонки "Готово" або подібні
    const doneColumns = await this.columnModel.find({
      projectId: { $in: projectIds },
      title: { $regex: /готово|done|complete/i }
    }).exec();
    
    const doneColumnIds = doneColumns.map(column => column._id.toString());
    
    // Рахуємо виконані задачі
    const completedTasks = tasks.filter(task => 
      doneColumnIds.includes(task.columnId.toString())
    );
    
    // Рахуємо прострочені задачі
    const now = new Date();
    const overdueTasks = tasks.filter(task => 
      task.deadline && 
      new Date(task.deadline) < now && 
      !doneColumnIds.includes(task.columnId.toString())
    );
    
    // Наближаються дедлайни (7 днів)
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    
    const upcomingDeadlines = tasks.filter(task => 
      task.deadline && 
      new Date(task.deadline) > now && 
      new Date(task.deadline) <= nextWeek && 
      !doneColumnIds.includes(task.columnId.toString())
    );
    
    // Розрахунок статистики за проектами
    const projectsStats: ProjectStats[] = []; // Явно вказуємо тип масиву
    
    for (const project of projects) {
      const projectTasks = tasks.filter(task => 
        task.projectId.toString() === project._id.toString()
      );
      
      const projectCompletedTasks = projectTasks.filter(task => 
        doneColumnIds.includes(task.columnId.toString())
      );
      
      projectsStats.push({
        id: project._id,
        name: project.name,
        tasksCount: projectTasks.length,
        completedTasksCount: projectCompletedTasks.length,
        completionRate: projectTasks.length > 0 
          ? Math.round((projectCompletedTasks.length / projectTasks.length) * 100)
          : 0
      });
    }
    
    // Сортуємо проекти за відсотком виконання
    projectsStats.sort((a, b) => b.completionRate - a.completionRate);
    
    return {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      completionRate: tasks.length > 0 
        ? Math.round((completedTasks.length / tasks.length) * 100)
        : 0,
      overdueTasks: overdueTasks.length,
      upcomingDeadlines: upcomingDeadlines.length,
      projects: projectsStats
    };
  }
  
  /**
   * Отримати статистику активності по днях
   */
  async getActivityByDay(
    userId: string, 
    timeRange: 'week' | 'month' | 'all' | 'custom' = 'month',
    customRange?: { start: Date; end: Date }
  ): Promise<ActivityData[]> {
    // Визначення часового діапазону
    const dateRange = this.getDateRange(timeRange, customRange);
    
    // Знаходимо всі проекти користувача
    const projects = await this.projectModel.find({ owner: userId }).exec();
    const projectIds = projects.map(project => project._id);
    
    // Знаходимо всі завдання для цих проектів
    const tasks = await this.taskModel.find({
      projectId: { $in: projectIds },
      createdAt: { 
        $gte: dateRange.start,
        $lte: dateRange.end
      }
    }).exec();
    
    // Групуємо задачі по днях створення
    const activityByDay: Record<string, number> = {};
    
    // Ініціалізуємо всі дні у діапазоні нулями
    let currentDate = new Date(dateRange.start);
    while (currentDate <= dateRange.end) {
      const dateKey = currentDate.toISOString().split('T')[0];
      activityByDay[dateKey] = 0;
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Рахуємо задачі по днях
    tasks.forEach(task => {
      const dateKey = new Date(task.createdAt).toISOString().split('T')[0];
      if (activityByDay[dateKey] !== undefined) {
        activityByDay[dateKey]++;
      }
    });
    
    // Конвертуємо об'єкт в масив для зручності використання
    const result: ActivityData[] = Object.entries(activityByDay).map(([date, count]) => ({
      date,
      count
    }));
    
    return result;
  }
  
  /**
   * Отримати розподіл задач по колонках
   */
  async getTasksDistributionByColumn(projectId: string): Promise<ColumnDistribution[]> {
    // Знаходимо всі колонки проекту
    const columns = await this.columnModel.find({ projectId }).exec();
    
    // Знаходимо всі задачі проекту
    const tasks = await this.taskModel.find({ projectId }).exec();
    
    // Рахуємо завдання в кожній колонці
    const distribution: ColumnDistribution[] = columns.map(column => {
      const tasksInColumn = tasks.filter(task => 
        task.columnId.toString() === column._id.toString()
      );
      
      return {
        columnId: column._id,
        columnTitle: column.title,
        tasksCount: tasksInColumn.length,
        percentage: tasks.length > 0 
          ? Math.round((tasksInColumn.length / tasks.length) * 100)
          : 0
      };
    });
    
    return distribution;
  }
  
  /**
   * Отримати швидкість завершення задач
   */
  async getCompletionVelocity(
    userId: string, 
    timeRange: 'week' | 'month' | 'all' | 'custom' = 'month',
    customRange?: { start: Date; end: Date }
  ): Promise<ActivityData[]> {
    // Визначення часового діапазону
    const dateRange = this.getDateRange(timeRange, customRange);
    
    // Знаходимо всі проекти користувача
    const projects = await this.projectModel.find({ owner: userId }).exec();
    const projectIds = projects.map(project => project._id);
    
    // Знаходимо колонки "Готово" або подібні
    const doneColumns = await this.columnModel.find({
      projectId: { $in: projectIds },
      title: { $regex: /готово|done|complete/i }
    }).exec();
    
    const doneColumnIds = doneColumns.map(column => column._id.toString());
    
    // Знаходимо всі виконані завдання
    const completedTasks = await this.taskModel.find({
      projectId: { $in: projectIds },
      columnId: { $in: doneColumnIds },
      updatedAt: { 
        $gte: dateRange.start,
        $lte: dateRange.end
      }
    }).exec();
    
    // Групуємо завдання по днях завершення
    const velocityByDay: Record<string, number> = {};
    
    // Ініціалізуємо всі дні у діапазоні нулями
    let currentDate = new Date(dateRange.start);
    while (currentDate <= dateRange.end) {
      const dateKey = currentDate.toISOString().split('T')[0];
      velocityByDay[dateKey] = 0;
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Рахуємо задачі по днях
    completedTasks.forEach(task => {
      const dateKey = new Date(task.updatedAt).toISOString().split('T')[0];
      if (velocityByDay[dateKey] !== undefined) {
        velocityByDay[dateKey]++;
      }
    });
    
    // Конвертуємо об'єкт в масив для зручності використання
    const result: ActivityData[] = Object.entries(velocityByDay).map(([date, count]) => ({
      date,
      count
    }));
    
    return result;
  }
  
  /**
   * Допоміжний метод для визначення часового діапазону
   */
  private getDateRange(
    timeRange: 'week' | 'month' | 'all' | 'custom', 
    customRange?: { start: Date; end: Date }
  ): { start: Date; end: Date } {
    const end = endOfDay(new Date());
    let start: Date;
    
    switch (timeRange) {
      case 'week':
        start = startOfDay(subDays(end, 7));
        break;
      case 'month':
        start = startOfDay(subMonths(end, 1));
        break;
      case 'custom':
        if (customRange) {
          start = startOfDay(customRange.start);
          break;
        }
        // Якщо customRange не надано, використовуємо місяць за замовчуванням
        start = startOfDay(subMonths(end, 1));
        break;
      case 'all':
      default:
        // Використовуємо віддалену дату для "all"
        start = startOfDay(new Date(2000, 0, 1));
        break;
    }
    
    return { start, end };
  }
}