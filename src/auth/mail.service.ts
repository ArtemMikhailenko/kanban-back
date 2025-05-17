// src/auth/mail.service.ts (оновлені типи параметрів)
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Створюємо транспортер для відправки електронних листів
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT', 587),
      secure: false, // true для 465, false для інших портів
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  /**
   * Відправляє лист для підтвердження реєстрації
   * @param email Email користувача
   * @param token Токен підтвердження
   * @param fullName Ім'я користувача
   */
  async sendVerificationEmail(
    email: string, 
    token: string, 
    fullName: string
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const verificationUrl = `${frontendUrl}/auth/verify/${token}`;

    // Налаштовуємо опції листа
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: email,
      subject: 'Підтвердження реєстрації в KanbanFlow',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #3b82f6;">KanbanFlow</h1>
          </div>
          <div style="margin-bottom: 30px;">
            <h2>Вітаємо, ${fullName}!</h2>
            <p>Дякуємо за реєстрацію в KanbanFlow. Щоб підтвердити вашу email адресу, будь ласка, натисніть на кнопку нижче:</p>
          </div>
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Підтвердити Email</a>
          </div>
          <div style="margin-bottom: 20px;">
            <p>Або перейдіть за цим посиланням:</p>
            <a href="${verificationUrl}" style="word-break: break-all; color: #3b82f6;">${verificationUrl}</a>
          </div>
          <div style="color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #e1e1e1; padding-top: 20px;">
            <p>Якщо ви не реєструвались в KanbanFlow, просто проігноруйте цей лист.</p>
            <p>© ${new Date().getFullYear()} KanbanFlow. Всі права захищені.</p>
          </div>
        </div>
      `,
    };

    try {
      // Відправка листа
      const info = await this.transporter.sendMail(mailOptions);
      
      // При використанні Ethereal, виводимо URL для перегляду листа в консоль
      if (this.configService.get<string>('EMAIL_HOST') === 'smtp.ethereal.email') {
        console.log('Тестовий лист відправлено');
        console.log('Переглянути лист: %s', nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      console.error('Помилка при відправці листа:', error);
      throw error;
    }
  }

  /**
   * Відправляє сповіщення про наближення дедлайну
   */
  async sendDeadlineNotification(email: string, taskTitle: string, deadline: Date): Promise<void> {
    const formattedDeadline = deadline.toLocaleString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: email,
      subject: `Нагадування про дедлайн: ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #3b82f6;">KanbanFlow</h1>
          </div>
          <div style="margin-bottom: 30px;">
            <h2>Нагадування про дедлайн</h2>
            <p>Дедлайн для задачі <strong>${taskTitle}</strong> наближається!</p>
            <p>Термін виконання: <strong>${formattedDeadline}</strong></p>
          </div>
          <div style="color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #e1e1e1; padding-top: 20px;">
            <p>© ${new Date().getFullYear()} KanbanFlow. Всі права захищені.</p>
          </div>
        </div>
      `,
    };

    try {
      // Відправка листа
      const info = await this.transporter.sendMail(mailOptions);
      
      // При використанні Ethereal, виводимо URL для перегляду листа в консоль
      if (this.configService.get<string>('EMAIL_HOST') === 'smtp.ethereal.email') {
        console.log('Тестовий лист про дедлайн відправлено');
        console.log('Переглянути лист: %s', nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      console.error('Помилка при відправці листа про дедлайн:', error);
      throw error;
    }
  }
}