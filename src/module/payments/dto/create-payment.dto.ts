import { PartialType } from '@nestjs/mapped-types';
import { PaymentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/* =====================================
   CREATE PAYMENT
===================================== */

export class CreatePaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  studentProfileId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({
    example: 500000,
    description: 'Haqiqatda to\'lanayotgan summa. Fan narxidan ko\'p bo\'lsa xatolik.',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amountPaid: number;

  @ApiProperty({ example: 6 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: 2026 })
  @Type(() => Number)
  @IsInt()
  year: number;

  @ApiPropertyOptional({ example: 'CASH' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

/* =====================================
   UPDATE PAYMENT
===================================== */

export class UpdatePaymentDto {
  @ApiPropertyOptional({
    example: 500000,
    description: 'Qo\'shimcha to\'lanadigan summa (qolgan qarzga qo\'shiladi)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amountPaid?: number;

  @ApiPropertyOptional({ example: 'CARD' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

/* =====================================
   DELETE PAYMENT
===================================== */

export class DeletePaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  paymentId: string;
}

/* =====================================
   PAYMENT QUERY
===================================== */

export class PaymentQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  studentProfileId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiPropertyOptional({ description: 'Talaba ismi' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Talaba telefon raqami' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;
}

/* =====================================
   PAYMENT STATISTICS
===================================== */

export class PaymentStatisticsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  groupId?: string;
}