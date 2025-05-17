// src/projects/dto/update-project.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto {
  @IsString({ message: 'Назва проекту має бути строкою' })
  @IsNotEmpty({ message: 'Назва проекту обов\'язкова' })
  name: string;

  @IsString({ message: 'Опис проекту має бути строкою' })
  @IsOptional()
  description?: string;
}