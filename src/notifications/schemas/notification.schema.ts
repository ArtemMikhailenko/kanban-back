// src/notifications/schemas/notification.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Task } from '../../tasks/schemas/task.schema';

export enum NotificationType {
  DEADLINE_APPROACHING = 'deadline-approaching',
  DEADLINE_MISSED = 'deadline-missed',
  TASK_ASSIGNED = 'task-assigned',
  TASK_COMPLETED = 'task-completed',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ type: Types.ObjectId, ref: 'Task', required: true })
  taskId: Task;

  @Prop({
    enum: NotificationType,
    required: true,
  })
  type: NotificationType;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export type NotificationDocument = Notification & Document;
export const NotificationSchema = SchemaFactory.createForClass(Notification);