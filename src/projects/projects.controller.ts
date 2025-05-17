// src/projects/projects.controller.ts
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
  } from '@nestjs/common';
  import { ProjectsService } from './projects.service';
  import { CreateProjectDto } from './dto/create-project.dto';
  import { UpdateProjectDto } from './dto/update-project.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { GetUser } from '../common/decorators/get-user.decorator';
  import { UserDocument } from '../users/schemas/user.schema';
  
  @Controller('projects')
  @UseGuards(JwtAuthGuard)
  export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}
  
    @Post()
    create(
      @Body() createProjectDto: CreateProjectDto,
      @GetUser() user: UserDocument,
    ) {
      return this.projectsService.create(createProjectDto, user);
    }
  
    @Get()
    findAll(@GetUser() user: UserDocument) {
      return this.projectsService.findAll(user);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string, @GetUser() user: UserDocument) {
      return this.projectsService.findOne(id, user);
    }
  
    @Put(':id')
    update(
      @Param('id') id: string,
      @Body() updateProjectDto: UpdateProjectDto,
      @GetUser() user: UserDocument,
    ) {
      return this.projectsService.update(id, updateProjectDto, user);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string, @GetUser() user: UserDocument) {
      return this.projectsService.remove(id, user);
    }
  
    @Patch(':id/column-order')
    updateColumnOrder(
      @Param('id') id: string,
      @Body('columnOrder') columnOrder: string[],
      @GetUser() user: UserDocument,
    ) {
      return this.projectsService.updateColumnOrder(id, columnOrder, user);
    }
  }