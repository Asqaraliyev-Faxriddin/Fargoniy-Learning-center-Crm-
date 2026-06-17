// dto/group.dto.ts

import {
    IsString,
    IsNotEmpty,
    IsInt,
    IsBoolean,
    IsOptional,
    IsDateString,
    Min,
    IsNumber,
    IsArray,
    IsEnum,
  } from 'class-validator';
  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
  import { Type, Transform } from 'class-transformer';
import { WeekDay } from '@prisma/client';
  
  // ─── CREATE ───────────────────────────────────────────────
  export class CreateGroupDto {
    @ApiProperty({ example: 'A-guruh', description: 'Guruh nomi' })
    @IsString()
    @IsNotEmpty()
    name: string;
  
    @ApiProperty({ example: 1, description: 'Fan IDsi' })
    @IsInt()
    @Min(1)
    subjectId: number;
  
    @ApiProperty({ example: 'uuid-teacher-id', description: 'O\'qituvchi profil IDsi' })
    @IsString()
    @IsNotEmpty()
    teacherId: string;
  
    @ApiProperty({ example: '101-xona', description: 'Xona' })
    @IsString()
    @IsNotEmpty()
    room: string;
  
    @ApiPropertyOptional({ example: false, description: 'Guruh aktiv holati' })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
  
    @ApiProperty({ example: '2025-06-10T00:00:00.000Z', description: 'Guruh boshlanish sanasi' })
    @IsDateString()
    startDate: string;
  
    @ApiProperty({ example: '09:00', description: 'Guruh boshlanish vaqti' })
    @IsString()
    startTime: string;
  
    @ApiProperty({ example: '11:00', description: 'Guruh tugash vaqti' })
    @IsString()
    endTime: string;
  
    @ApiProperty({
      example: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
      description: 'Dars kunlari',
      enum: WeekDay,
      isArray: true,
    })
    @IsArray()
    @IsEnum(WeekDay, { each: true })
    days: WeekDay[];
  }
  // ─── UPDATE ───────────────────────────────────────────────
  export class UpdateGroupDto {
    @ApiPropertyOptional({ example: 'B-guruh' })
    @IsString()
    @IsOptional()
    name?: string;
  
    @ApiPropertyOptional({ example: 2 })
    @IsInt()
    @Min(1)
    @IsOptional()
    subjectId?: number;
  
    @ApiPropertyOptional({ example: 'uuid-teacher-id' })
    @IsString()
    @IsOptional()
    teacherId?: string;
  
    @ApiPropertyOptional({ example: '202-xona' })
    @IsString()
    @IsOptional()
    room?: string;
  
    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({
      example: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
      description: 'Dars kunlari',
      enum: WeekDay,
      isArray: true,
    })
    @IsArray()
    @IsEnum(WeekDay, { each: true })
    days: WeekDay[];
  
    @ApiPropertyOptional({ example: '2025-07-01T00:00:00.000Z' })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiPropertyOptional({ example: '2025-06-10T00:00:00.000Z', description: 'Guruh boshlanish vaqti' })
    @IsString()
    @IsOptional()
    startTime?: string;

          
    @ApiPropertyOptional({ example: '2025-06-10T00:00:00.000Z', description: 'Guruh tugash vaqti' })
    @IsString()
    @IsOptional()
    endTime?: string;
  }
  
  // ─── FIND ALL ─────────────────────────────────────────────
  export class FindAllGroupDto {
    @ApiPropertyOptional({ example: 'A-guruh', description: 'Guruh nomi bo\'yicha qidirish' })
    @IsString()
    @IsOptional()
    name?: string;
  
    @ApiPropertyOptional({ example: 1, description: 'Fan IDsi bo\'yicha filter' })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    subjectId?: number;
  
    @ApiPropertyOptional({ example: 'uuid-teacher-id', description: 'O\'qituvchi IDsi bo\'yicha filter' })
    @IsString()
    @IsOptional()
    teacherId?: string;
  
    @ApiPropertyOptional({ example: true, description: 'Aktiv/noaktiv guruhlar' })
    @Transform(({ value }) => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return value;
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
  
    @ApiPropertyOptional({ example: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number;
  
    @ApiPropertyOptional({ example: 10 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    limit?: number;
  }

  export class FindAllTeacherDto {
    @ApiPropertyOptional({
      example: 'Ali',
      description: 'O\'qituvchi ismi yoki familiyasi bo\'yicha qidirish',
    })
    @IsString()
    @IsOptional()
    name?: string;
  
    @ApiPropertyOptional({
      example: 1,
      description: 'Fan IDsi bo\'yicha filter — qaysi fan o\'qituvchilarini olish',
    })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    subjectId?: number;
  
    @ApiPropertyOptional({
      example: true,
      description: 'Akkaunt aktiv/noaktiv holati bo\'yicha filter',
    })
    @Transform(({ value }) => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return value;
    })
    @IsBoolean()
    @IsOptional()
    isEnabled?: boolean;
  
    @ApiPropertyOptional({ example: 1, description: 'Sahifa raqami' })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    page?: number;
  
    @ApiPropertyOptional({ example: 10, description: 'Har sahifadagi elementlar soni' })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    limit?: number;
  }
  