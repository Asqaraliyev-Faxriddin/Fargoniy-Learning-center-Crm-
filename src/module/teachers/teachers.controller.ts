// teachers.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto, FindAllTeacherDto, UpdateTeacherDto } from './dto/create-teacher.dto';

@ApiTags('Teachers')
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi o\'qituvchi qo\'shish' })
  @ApiResponse({ status: 201, description: 'O\'qituvchi yaratildi' })
  @ApiResponse({ status: 409, description: 'Email allaqachon band' })
  create(@Body() dto: CreateTeacherDto) {
    return this.teachersService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Barcha o\'qituvchilarni olish',
    description: 'Ism, fan IDsi yoki holat bo\'yicha filter qilish mumkin',
  })
  @ApiResponse({ status: 200, description: 'O\'qituvchilar ro\'yxati' })
  findAll(@Query() query: FindAllTeacherDto) {
    return this.teachersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Bitta o\'qituvchini olish',
    description: 'Barcha guruhlari va fan ma\'lumotlari bilan',
  })
  @ApiParam({ name: 'id', example: 'uuid-here' })
  @ApiResponse({ status: 200, description: 'O\'qituvchi topildi' })
  @ApiResponse({ status: 404, description: 'O\'qituvchi topilmadi' })
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'O\'qituvchi ma\'lumotlarini yangilash' })
  @ApiParam({ name: 'id', example: 'uuid-here' })
  @ApiResponse({ status: 200, description: 'Yangilandi' })
  @ApiResponse({ status: 404, description: 'Topilmadi' })
  update(@Param('id') id: string, @Body() dto: UpdateTeacherDto) {
    return this.teachersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'O\'qituvchini o\'chirish' })
  @ApiParam({ name: 'id', example: 'uuid-here' })
  @ApiResponse({ status: 200, description: 'O\'chirildi' })
  @ApiResponse({ status: 404, description: 'Topilmadi' })
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }
}