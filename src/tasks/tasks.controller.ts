// src/tasks/tasks.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    Put,
    Patch,
    Query,
  } from '@nestjs/common';
  import { TasksService } from './tasks.service';
  import { CreateTaskDto } from './dto/create-task.dto';
  import { UpdateTaskDto } from './dto/update-task.dto';
  import { MoveTaskDto } from './dto/move-task.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  
  @Controller('tasks')
  @UseGuards(JwtAuthGuard)
  export class TasksController {
    constructor(private readonly tasksService: TasksService) {}
  
    @Post()
    create(@Body() createTaskDto: CreateTaskDto) {
      return this.tasksService.create(createTaskDto);
    }
  
    @Get()
    findAll(@Query('projectId') projectId: string) {
      return this.tasksService.findAll(projectId);
    }
  
    @Get('upcoming')
    findUpcomingDeadlines(@Query('days') days: number) {
      return this.tasksService.findUpcomingDeadlines(days);
    }
  
    @Get('overdue')
    findOverdueTasks() {
      return this.tasksService.findOverdueTasks();
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.tasksService.findOne(id);
    }
  
    @Put(':id')
    update(
      @Param('id') id: string,
      @Body() updateTaskDto: UpdateTaskDto,
    ) {
      return this.tasksService.update(id, updateTaskDto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.tasksService.remove(id);
    }
  
    @Patch(':id/move')
    moveTask(
      @Param('id') id: string,
      @Body() moveTaskDto: MoveTaskDto,
    ) {
      return this.tasksService.moveTask(id, String(moveTaskDto.targetColumnId));
    }
  }