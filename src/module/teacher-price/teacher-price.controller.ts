import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { TeacherSalaryService } from "./teacher-price.service";
import {
  CreateTeacherSalaryDto,
  GetSalaryQueryDto,
} from "./dto/create-teacher-price.dto";
import { Roles } from "src/common/decorators/Roles.decorators";
import { UserRole } from "@prisma/client";
import { AuthGuard } from "src/common/guards/AuthGuard";
import { RolesGuard } from "src/common/guards/RolesGuard";

@ApiTags("Teacher Salary")
@ApiBearerAuth()
@Roles(UserRole.DIREKTOR, UserRole.ADMIN)
@UseGuards(AuthGuard, RolesGuard)
@Controller("teacher-salary")
export class TeacherSalaryController {
  constructor(private readonly salaryService: TeacherSalaryService) {}

  // ── POST /teacher-salary/pay ─────────────────────────────────────────────────
  @Post("pay")
  @ApiOperation({
    summary: "Oylik to'lovini amalga oshirish",
    description:
      "amountPaid - haqiqatda to'lanayotgan summa. " +
      "Jami oylikdan ko'p bo'lsa xatolik qaytariladi. " +
      "Kam bo'lsa 'half' holatiga o'tadi, teng bo'lsa 'paid'.",
  })
  async pay(@Body() dto: CreateTeacherSalaryDto) {
    return this.salaryService.createSalaryPayment(dto);
  }

  // ── GET /teacher-salary/preview/:teacherId ───────────────────────────────────
  @Get("preview/:teacherId")
  @ApiOperation({
    summary: "Oylikni hisoblash (saqlash kerak emas)",
    description:
      "To'lamasdan oldin hisob-kitobni ko'rish uchun. " +
      "calculatedSalary (jami), previouslyPaid (avval to'langan), remainingAmount (qoldiq) qaytariladi.",
  })
  @ApiQuery({ name: "month", type: Number })
  @ApiQuery({ name: "year", type: Number })
  @ApiQuery({ name: "percent", type: Number, required: false })
  async preview(
    @Param("teacherId", ParseUUIDPipe) teacherId: string,
    @Query("month", ParseIntPipe) month: number,
    @Query("year", ParseIntPipe) year: number,
    @Query("percent") percent?: number,
  ) {
    return this.salaryService.previewSalary(
      teacherId,
      month,
      year,
      percent ? Number(percent) : undefined,
    );
  }

  // ── GET /teacher-salary/all-status ───────────────────────────────────────────
  @Get("all-status")
  @ApiOperation({
    summary: "Barcha o'qituvchilar oylik holati",
    description: "Berilgan oy/yil uchun barcha o'qituvchilarning to'lov holati.",
  })
  @ApiQuery({ name: "month", type: Number })
  @ApiQuery({ name: "year", type: Number })
  @ApiQuery({ name: "percent", type: Number, required: false })
  async allStatus(
    @Query("month", ParseIntPipe) month: number,
    @Query("year", ParseIntPipe) year: number,
    @Query("percent") percent?: number,
  ) {
    const query: GetSalaryQueryDto = {
      month,
      year,
      percent: percent ? Number(percent) : undefined,
    };
    return this.salaryService.getAllTeachersSalaryStatus(query);
  }

  // ── GET /teacher-salary/history/:teacherId ───────────────────────────────────
  @Get("history/:teacherId")
  @ApiOperation({ summary: "O'qituvchi oylik tarixi" })
  async history(@Param("teacherId", ParseUUIDPipe) teacherId: string) {
    return this.salaryService.getTeacherSalaryHistory(teacherId);
  }
}