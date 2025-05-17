// src/analytics/analytics.controller.ts (оновлений)
import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { AnalyticsQueryDto, TimeRangeEnum } from './dto/analytics-query.dto';
import { ProjectOwnerGuard } from '../projects/guards/project-owner.guard';
import { UserStatistics, ActivityData, ColumnDistribution } from './interfaces/analytics.interfaces';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('statistics')
  async getUserStatistics(
    @GetUser() user: UserDocument,
    @Query() query: AnalyticsQueryDto,
  ): Promise<UserStatistics> {
    let customRange;
    
    if (query.timeRange === TimeRangeEnum.CUSTOM && query.startDate && query.endDate) {
      customRange = {
        start: new Date(query.startDate),
        end: new Date(query.endDate),
      };
    }
    
    return this.analyticsService.getUserStatistics(
      user._id.toString(),
      query.timeRange,
      customRange,
    );
  }

  @Get('activity')
  async getActivityByDay(
    @GetUser() user: UserDocument,
    @Query() query: AnalyticsQueryDto,
  ): Promise<ActivityData[]> {
    let customRange;
    
    if (query.timeRange === TimeRangeEnum.CUSTOM && query.startDate && query.endDate) {
      customRange = {
        start: new Date(query.startDate),
        end: new Date(query.endDate),
      };
    }
    
    return this.analyticsService.getActivityByDay(
      user._id.toString(),
      query.timeRange,
      customRange,
    );
  }

  @Get('projects/:projectId/distribution')
  @UseGuards(ProjectOwnerGuard)
  async getTasksDistributionByColumn(@Param('projectId') projectId: string): Promise<ColumnDistribution[]> {
    return this.analyticsService.getTasksDistributionByColumn(projectId);
  }

  @Get('velocity')
  async getCompletionVelocity(
    @GetUser() user: UserDocument,
    @Query() query: AnalyticsQueryDto,
  ): Promise<ActivityData[]> {
    let customRange;
    
    if (query.timeRange === TimeRangeEnum.CUSTOM && query.startDate && query.endDate) {
      customRange = {
        start: new Date(query.startDate),
        end: new Date(query.endDate),
      };
    }
    
    return this.analyticsService.getCompletionVelocity(
      user._id.toString(),
      query.timeRange,
      customRange,
    );
  }
}