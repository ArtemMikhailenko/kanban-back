// src/notifications/notifications.controller.ts
import {
    Controller,
    Get,
    Post,
    Param,
    Delete,
    UseGuards,
  } from '@nestjs/common';
  import { NotificationsService } from './notifications.service';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { GetUser } from '../common/decorators/get-user.decorator';
  import { UserDocument } from '../users/schemas/user.schema';
  
  @Controller('notifications')
  @UseGuards(JwtAuthGuard)
  export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}
  
    @Get()
    findAll(@GetUser() user: UserDocument) {
      return this.notificationsService.findByUser(user._id.toString());
    }
  
    @Post(':id/read')
    markAsRead(@Param('id') id: string) {
      return this.notificationsService.markAsRead(id);
    }
  
    @Post('read-all')
    markAllAsRead(@GetUser() user: UserDocument) {
      return this.notificationsService.markAllAsRead(user._id.toString());
    }
  
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.notificationsService.remove(id);
    }
  }