// src/columns/dto/update-column.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateColumnDto {
  @IsString({ message: 'Назва колонки має бути строкою' })
  @IsNotEmpty({ message: 'Назва колонки обов\'язкова' })
  @IsOptional()
  title?: string;
}