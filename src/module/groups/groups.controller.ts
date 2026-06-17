// groups.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto, FindAllGroupDto, UpdateGroupDto } from './dto/create-group.dto';
import { Roles } from 'src/common/decorators/Roles.decorators';
import { UserRole } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/AuthGuard';
import { RolesGuard } from 'src/common/guards/RolesGuard';

@ApiTags('Groups')
@ApiBearerAuth()
@Roles(UserRole.DIREKTOR,UserRole.ADMIN)
@UseGuards(AuthGuard,RolesGuard)
@Controller('groups')
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  // ─── CREATE ─────────────────────────────────────────────
  @Post()
  @ApiOperation({ summary: 'Yangi guruh yaratish' })
  @ApiResponse({ status: 201, description: 'Guruh muvaffaqiyatli yaratildi' })
  @ApiResponse({ status: 400, description: "Noto'g'ri ma'lumot" })
  create(@Body() dto: CreateGroupDto) {
    return this.groupsService.create(dto);
  }

  // ─── FIND ALL ───────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: "Barcha guruhlarni olish",
    description: "Fan ma'lumoti, o'qituvchi va o'quvchilar soni bilan",
  })
  @ApiResponse({ status: 200, description: "Guruhlar ro'yxati" })
  findAll(@Query() query: FindAllGroupDto) {
    return this.groupsService.findAll(query);
  }

  // ─── FIND ONE ───────────────────────────────────────────
  @Get(':id')
  @ApiOperation({
    summary: "Bitta guruhni olish",
    description: "Fan, o'qituvchi va barcha o'quvchilar ro'yxati bilan",
  })
  @ApiParam({ name: 'id', example: 'uuid-here', description: 'Guruh IDsi' })
  @ApiResponse({ status: 200, description: 'Guruh topildi' })
  @ApiResponse({ status: 404, description: 'Guruh topilmadi' })
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  // ─── UPDATE ─────────────────────────────────────────────
  @Patch(':id')
  @ApiOperation({ summary: 'Guruhni yangilash' })
  @ApiParam({ name: 'id', example: 'uuid-here', description: 'Yangilanadigan guruh IDsi' })
  @ApiResponse({ status: 200, description: 'Guruh yangilandi' })
  @ApiResponse({ status: 404, description: 'Guruh topilmadi' })
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.groupsService.update(id, dto);
  }

  // ─── DELETE ─────────────────────────────────────────────
  @Delete(':id')
  @ApiOperation({ summary: "Guruhni o'chirish" })
  @ApiParam({ name: 'id', example: 'uuid-here', description: "O'chiriladigan guruh IDsi" })
  @ApiResponse({ status: 200, description: "Guruh o'chirildi" })
  @ApiResponse({ status: 404, description: 'Guruh topilmadi' })
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }
}