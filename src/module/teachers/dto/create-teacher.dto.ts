// dto/teacher.dto.ts

import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsOptional,
    IsEmail,
    MinLength,
    IsBoolean,
  } from 'class-validator';
  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
  import { Type, Transform } from 'class-transformer';
  
  // ─── CREATE ───────────────────────────────────────────────
  export class CreateTeacherDto {
    @ApiProperty({ example: 'Ali', description: 'Ism' })
    @IsString()
    @IsNotEmpty()
    firstName: string;
  
    @ApiProperty({ example: 'Karimov', description: 'Familiya' })
    @IsString()
    @IsNotEmpty()
    lastName: string;
  

    @ApiProperty({ example: '+998901234567', description: 'Telefon raqam' })
    @IsString()
    @IsNotEmpty()
    phone: string;
  
    @ApiProperty({ example: 30, description: 'Oylik maosh foizi(so\'mda)' })
    @IsNumber()
    @IsNotEmpty()
    percent: number;
  }
  
  // ─── UPDATE ───────────────────────────────────────────────
  export class UpdateTeacherDto {
    @ApiPropertyOptional({ example: 'Vali' })
    @IsString()
    @IsOptional()
    firstName?: string;
  
    @ApiPropertyOptional({ example: 'Rahimov' })
    @IsString()
    @IsOptional()
    lastName?: string;

    @ApiPropertyOptional({ example: 30, description: 'Oylik maosh foizi(so\'mda)' })
    @IsNumber()
    @IsOptional()
    percent: number;
  

  
    @ApiPropertyOptional({ example: '+998901234567' })
    @IsString()
    @IsOptional()
    phone?: string;
  
    @ApiPropertyOptional({ example: 3500000 })
    @IsNumber()
    @IsOptional()
    salary?: number;
  
    @ApiPropertyOptional({ example: true, description: 'Akkaunt holati' })
    @IsBoolean()
    @IsOptional()
    isEnabled?: boolean;
  }
  
  // ─── FIND ALL ─────────────────────────────────────────────
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