import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    Min,
  } from 'class-validator';
  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
  import { Transform, Type } from 'class-transformer';
  
  export class CreateSubjectDto {
    @ApiProperty({
      example: 'Matematika',
      description: 'Fan nomi',
    })
    @IsString()
    @IsNotEmpty()
    name: string;
  
    @ApiProperty({
      example: 150000,
      description: 'Fan narxi',
    })
    @IsNumber()
    @IsPositive()
    price: number;
  
    @ApiPropertyOptional({
      example: true,
      description: "Fan aktiv yoki yo'qligi",
      default: true,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
  }
  
  export class UpdateSubjectDto {
    @ApiPropertyOptional({ example: 'Fizika' })
    @IsString()
    @IsOptional()
    name?: string;
  
    @ApiPropertyOptional({ example: 200000 })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;
  
    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
  }
  
  export class FindOneSubjectDto {
    @ApiProperty({ example: 1, description: 'Fan IDsi' })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id: number;
  }
  
  // ✅ page va limit shu yerda bo'lishi kerak
  export class FindAllSubjectDto {
    @ApiPropertyOptional({
      example: 'Mat',
      description: "Fan nomi bo'yicha qidirish",
    })
    @IsString()
    @IsOptional()
    name?: string;
  
    @ApiPropertyOptional({
      example: true,
      description: 'Faqat aktiv yoki noaktiv fanlarni olish',
    })
    @Transform(({ value }) => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return value;
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
  
    @ApiPropertyOptional({ example: 1, description: 'Sahifa raqami' })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number;
  
    @ApiPropertyOptional({ example: 10, description: 'Har sahifadagi elementlar soni' })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    limit?: number;
  }
  
  // ✅ DeleteSubjectDto faqat id ni oladi
  export class DeleteSubjectDto {
    @ApiProperty({ example: 1, description: "O'chiriladigan fan IDsi" })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    id: number;
  }