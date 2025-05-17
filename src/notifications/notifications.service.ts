// src/notifications/notifications.service.ts
import { Injectable ,NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema';
import { TaskDocument } from '../tasks/schemas/task.schema';

@Injectable()
export class NotificationsService {
  private deadlineTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(notificationData: {
    userId: Types.ObjectId;
    taskId: Types.ObjectId;
    type: NotificationType;
    message: string;
  }): Promise<NotificationDocument> {
    const notification = new this.notificationModel(notificationData);
    return notification.save();
  }

  async findByUser(userId: string): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(id: string): Promise<NotificationDocument> {
    const notification = await this.notificationModel
      .findByIdAndUpdate(id, { isRead: true }, { new: true })
      .exec();
  
    if (!notification) {
      // Уведомление с таким ID не найдено — кидаем 404
      throw new NotFoundException(`Notification with id ${id} not found`);
    }
  
    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel
      .updateMany({ userId, isRead: false }, { isRead: true })
      .exec();
  }

  async remove(id: string): Promise<void> {
    await this.notificationModel.findByIdAndDelete(id).exec();
  }

  async removeAllByTask(taskId: string): Promise<void> {
    await this.notificationModel.deleteMany({ taskId }).exec();
  }

  // Методи для роботи з дедлайнами
  async scheduleDeadlineNotification(task: TaskDocument): Promise<void> {
    if (!task.deadline) return;

    const taskId = task._id.toString();
    const projectId = task.projectId.toString();
    const deadline = new Date(task.deadline);
    const now = new Date();

    // Скасовуємо існуючі таймаути для цієї задачі, якщо вони є
    this.cancelDeadlineNotifications(taskId);

    // Розрахунок часу для сповіщення про наближення дедлайну (1 день до дедлайну)
    const approachingDeadlineTime = new Date(deadline);
    approachingDeadlineTime.setDate(approachingDeadlineTime.getDate() - 1);

    // Якщо час сповіщення ще не настав
    if (approachingDeadlineTime > now) {
      const timeUntilApproaching = approachingDeadlineTime.getTime() - now.getTime();

      // В реальному додатку тут буде надсилання email або інший спосіб сповіщення
      // Для демонстрації створюємо запис у базі даних
      const timeout = setTimeout(async () => {
        await this.create({
          userId: new Types.ObjectId(projectId) as any, // В реальному додатку тут буде ID власника проекту
          taskId: new Types.ObjectId(taskId) as any,
          type: NotificationType.DEADLINE_APPROACHING,
          message: `Наближається дедлайн для задачі "${task.title}" (24 години).`,
        });
      }, timeUntilApproaching);

      this.deadlineTimeouts.set(`${taskId}-approaching`, timeout);
    }

    // Якщо дедлайн вже пройшов
    if (deadline < now) {
      await this.create({
        userId: new Types.ObjectId(projectId) as any, // В реальному додатку тут буде ID власника проекту
        taskId: new Types.ObjectId(taskId) as any,
        type: NotificationType.DEADLINE_MISSED,
        message: `Пропущено дедлайн для задачі "${task.title}".`,
      });
    } else {
      // Якщо дедлайн ще не пройшов, встановлюємо таймер для сповіщення
      const timeUntilDeadline = deadline.getTime() - now.getTime();

      const timeout = setTimeout(async () => {
        await this.create({
          userId: new Types.ObjectId(projectId) as any, // В реальному додатку тут буде ID власника проекту
          taskId: new Types.ObjectId(taskId) as any,
          type: NotificationType.DEADLINE_MISSED,
          message: `Пропущено дедлайн для задачі "${task.title}".`,
        });
      }, timeUntilDeadline);

      this.deadlineTimeouts.set(`${taskId}-missed`, timeout);
    }
  }

  cancelDeadlineNotifications(taskId: string): void {
    const approachingKey = `${taskId}-approaching`;
    const missedKey = `${taskId}-missed`;

    if (this.deadlineTimeouts.has(approachingKey)) {
      clearTimeout(this.deadlineTimeouts.get(approachingKey));
      this.deadlineTimeouts.delete(approachingKey);
    }

    if (this.deadlineTimeouts.has(missedKey)) {
      clearTimeout(this.deadlineTimeouts.get(missedKey));
      this.deadlineTimeouts.delete(missedKey);
    }
  }
}