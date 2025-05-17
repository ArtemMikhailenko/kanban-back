// src/users/users.controller.ts
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from './schemas/user.schema';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@GetUser() user: any) {
    return user;
  }

  @Get('verify/:token')
  async verifyEmail(@Param('token') token: string) {
    const user = await this.usersService.verifyEmail(token);
    return {
      message: 'Email успішно підтверджено!',
      userId: user._id,
    };
  }
}