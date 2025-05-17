// src/columns/columns.controller.ts
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
  import { ColumnsService } from './columns.service';
  import { CreateColumnDto } from './dto/create-column.dto';
  import { UpdateColumnDto } from './dto/update-column.dto';
  import { UpdateTaskOrderDto } from './dto/update-task-order.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { ProjectOwnerGuard } from '../projects/guards/project-owner.guard';
  
  @Controller('columns')
  @UseGuards(JwtAuthGuard)
  export class ColumnsController {
    constructor(private readonly columnsService: ColumnsService) {}
  
    @Post()
    @UseGuards(ProjectOwnerGuard)
    create(@Body() createColumnDto: CreateColumnDto) {
      return this.columnsService.create(createColumnDto);
    }
  
    @Get()
    findAll(@Query('projectId') projectId: string) {
      return this.columnsService.findAll(projectId);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.columnsService.findOne(id);
    }
  
    @Put(':id')
    update(
      @Param('id') id: string,
      @Body() updateColumnDto: UpdateColumnDto,
    ) {
      return this.columnsService.update(id, updateColumnDto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.columnsService.remove(id);
    }
  
    @Patch(':id/task-order')
    updateTaskOrder(
      @Param('id') id: string,
      @Body() updateTaskOrderDto: UpdateTaskOrderDto,
    ) {
      return this.columnsService.updateTaskOrder(id, updateTaskOrderDto.taskIds);
    }
  }