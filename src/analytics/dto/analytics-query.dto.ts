// src/analytics/dto/analytics-query.dto.ts
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum TimeRangeEnum {
  WEEK = 'week',
  MONTH = 'month',
  ALL = 'all',
  CUSTOM = 'custom',
}

export class AnalyticsQueryDto {
  @IsEnum(TimeRangeEnum, { message: 'Невірний період часу' })
  @IsOptional()
  timeRange?: TimeRangeEnum = TimeRangeEnum.MONTH;

  @IsDateString({}, { message: 'Невірний формат дати початку' })
  @IsOptional()
  startDate?: string;

  @IsDateString({}, { message: 'Невірний формат дати кінця' })
  @IsOptional()
  endDate?: string;
}