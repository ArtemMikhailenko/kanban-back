import { ProjectStatsDto } from './project-stats.dto';

export class UserStatisticsDto {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  overdueTasks: number;
  upcomingDeadlines: number;
  projects: ProjectStatsDto[];
}
