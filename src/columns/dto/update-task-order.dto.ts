// src/columns/dto/update-task-order.dto.ts
import { IsArray, IsNotEmpty } from 'class-validator';

export class UpdateTaskOrderDto {
  @IsArray({ message: 'Порядок задач має бути масивом' })
  @IsNotEmpty({ message: 'Порядок задач обов\'язковий' })
  taskIds: string[];
}