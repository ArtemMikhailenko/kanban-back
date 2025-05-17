// src/analytics/interfaces/analytics.interfaces.ts
/**
 * Інтерфейс для статистики проекту
 */
export interface ProjectStats {
    id: any; // Тип ObjectId
    name: string;
    tasksCount: number;
    completedTasksCount: number;
    completionRate: number;
  }
  
  /**
   * Інтерфейс для даних активності по днях
   */
  export interface ActivityData {
    date: string;
    count: number;
  }
  
  /**
   * Інтерфейс для розподілу задач по колонках
   */
  export interface ColumnDistribution {
    columnId: any; // Тип ObjectId
    columnTitle: string;
    tasksCount: number;
    percentage: number;
  }
  
  /**
   * Інтерфейс для загальної статистики користувача
   */
  export interface UserStatistics {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    overdueTasks: number;
    upcomingDeadlines: number;
    projects: ProjectStats[];
  }