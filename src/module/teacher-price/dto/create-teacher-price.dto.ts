import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from "class-validator";

export class CreateTeacherSalaryDto {
  @ApiProperty({ example: "uuid-of-teacher-profile" })
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @ApiProperty({ example: 6, description: "Oy (1-12)" })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: 2025, description: "Yil" })
  @IsInt()
  @Min(2020)
  year: number;

  @ApiPropertyOptional({
    example: 30,
    description:
      "Foiz (faqat percent rejimida ishlatiladi). Fixed salary bo'lsa shart emas.",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percent?: number;

  @ApiProperty({
    example: 500000,
    description:
      "Haqiqatda to'lanayotgan summa. Jami oylikdan ko'p bo'lsa xatolik qaytariladi.",
  })
  @IsNumber()
  @Min(0)
  amountPaid: number;
}

export class GetSalaryQueryDto {
  @ApiProperty({ example: 6, description: "Oy (1-12)" })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: 2025, description: "Yil" })
  @IsInt()
  @Min(2020)
  year: number;

  @ApiPropertyOptional({
    example: 30,
    description: "Default foiz (TeacherProfile.percent bo'lmasa ishlatiladi)",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percent?: number;
}