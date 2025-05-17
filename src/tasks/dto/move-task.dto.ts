// src/tasks/dto/move-task.dto.ts
import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class MoveTaskDto {
  @IsMongoId({ message: 'Невірний формат ID нової колонки' })
  @IsNotEmpty({ message: 'ID нової колонки обов\'язковий' })
  targetColumnId: Types.ObjectId;
}