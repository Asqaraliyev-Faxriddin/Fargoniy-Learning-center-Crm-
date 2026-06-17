import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  IsDateString,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @ApiProperty({
    example: 'Internet to‘lovi',
    description: 'Xarajat nomi',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Kommunal',
    description: 'Xarajat kategoriyasi',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  kategoriya: string;

  @ApiProperty({
    example: 250000,
    description: 'Xarajat summasi',
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  amount: number;

  @ApiProperty({
    example: '2026-06-06',
    description: 'Xarajat sanasi',
  })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({
    example: 'Bir oylik internet abonent to‘lovi',
    description: 'Qo‘shimcha izoh',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}



export class ExpenseIdParamDto {
  @ApiProperty({
    example: "UUid",
    description: 'Xarajatning unikal ID raqami',
  })
  @IsUUID()
  id: string;
}