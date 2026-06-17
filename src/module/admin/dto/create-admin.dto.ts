import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from "class-validator";
import { Type } from "class-transformer";
import { IsInt, Min } from "class-validator";

// ── CREATE ────────────────────────────────────────────────────────────────────
export class CreateAdminDto {
  @ApiProperty({ example: "Ali" })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: "Valiyev" })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: "admin@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "strongPassword123", minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: "+998901234567" })
  @IsOptional()
  @IsString()
  phone?: string;
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
export class UpdateAdminDto {
  @ApiPropertyOptional({ example: "Ali" })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: "Valiyev" })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: "admin@example.com" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: "+998901234567" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: "newPassword123", minLength: 6 })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}

// ── PAGINATION QUERY ──────────────────────────────────────────────────────────
export class PaginationQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: "ali",
    description: "Ism yoki familiya bo'yicha qidirish",
  })
  @IsOptional()
  @IsString()
  search?: string;
}