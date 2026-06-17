import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsPhoneNumber,
  IsInt,
  Min,
  Max,
  MinLength,
} from 'class-validator';

/* =====================================================
   CREATE STUDENT
   - Admin talaba qo'shadi
   - Email kiritilmaydi, bazaga "" saqlanadi
   - Parol majburiy (admin o'zi belgilaydi)
===================================================== */
export class CreateStudentDto {
  @ApiProperty({ example: 'Jasur', description: 'Talabaning ismi' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Toshmatov', description: 'Talabaning familiyasi' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '+998901234567', description: 'Telefon raqami' })
  @IsString()
  @IsNotEmpty()
  phone: string;



  @ApiPropertyOptional({
    example: true,
    description: 'Akkaunt holati (default: true)',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

/* =====================================================
   UPDATE STUDENT
   - Barcha maydonlar ixtiyoriy
===================================================== */
export class UpdateStudentDto extends PartialType(CreateStudentDto) {}

/* =====================================================
   ADD STUDENT TO GROUP
===================================================== */
export class AddStudentToGroupDto {
  @ApiProperty({ description: 'Guruh ID' })
  @IsString()
  @IsNotEmpty()
  groupId: string;
}

/* =====================================================
   REMOVE STUDENT FROM GROUP
===================================================== */
export class RemoveStudentFromGroupDto {
  @ApiProperty({ description: 'Guruh ID' })
  @IsString()
  @IsNotEmpty()
  groupId: string;
}

/* =====================================================
   STUDENT QUERY (Pagination + Search)
===================================================== */
export class StudentQueryDto {
  @ApiPropertyOptional({
    example: 'Jasur',
    description: 'Ism bo\'yicha qidirish (case-insensitive)',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Toshmatov',
    description: 'Familiya bo\'yicha qidirish (case-insensitive)',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    example: '+998901234567',
    description: 'Telefon raqami bo\'yicha qidirish',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'abc-uuid',
    description: 'Guruh ID bo\'yicha filter',
  })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Akkaunt holati bo\'yicha filter',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({ default: 1, description: 'Sahifa raqami' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10, description: 'Sahifadagi elementlar soni' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}