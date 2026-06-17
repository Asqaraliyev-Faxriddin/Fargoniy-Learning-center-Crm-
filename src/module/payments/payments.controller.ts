import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaymentService } from '../payments/payments.service';
import {
  CreatePaymentDto,
  DeletePaymentDto,
  PaymentQueryDto,
  PaymentStatisticsDto,
  UpdatePaymentDto,
} from './dto/create-payment.dto';
import { AuthGuard } from 'src/common/guards/AuthGuard';
import { RolesGuard } from 'src/common/guards/RolesGuard';
import { Roles } from 'src/common/decorators/Roles.decorators';
import { UserRole } from '@prisma/client';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // O'zingizning guard


@ApiTags('Payments')
@ApiBearerAuth()
@Roles(UserRole.DIREKTOR,UserRole.ADMIN)
@UseGuards(AuthGuard,RolesGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /* ─── CREATE ─── */
  @Post()
  @ApiOperation({ summary: 'Yangi to\'lov qo\'shish' })
  create(@Body() dto: CreatePaymentDto, @Request() req: any) {
    const createdById = req.user?.id ?? 'system';
    return this.paymentService.createPayment(dto, createdById);
  }

  /* ─── UPDATE ─── */
  @Patch(':id')
  @ApiOperation({ summary: 'To\'lovni yangilash' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.paymentService.updatePayment(id, dto);
  }

  /* ─── DELETE ─── */
  @Delete()
  @ApiOperation({ summary: 'To\'lovni o\'chirish' })
  remove(@Body() dto: DeletePaymentDto) {
    return this.paymentService.deletePayment(dto);
  }

  /* ─── GET ONE ─── */
  @Get(':id')
  @ApiOperation({ summary: 'Bitta to\'lovni olish' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  findOne(@Param('id') id: string) {
    return this.paymentService.getPaymentById(id);
  }

  /* ─── GET ALL (pagination + filters) ─── */
  @Get()
  @ApiOperation({
    summary: 'Barcha to\'lovlar (pagination, filterlash, qidirish)',
    description:
      'status=PAID|PARTIAL|UNPAID, firstName, phone, groupId, studentProfileId, startDate, endDate, page, limit',
  })
  findAll(@Query() query: PaymentQueryDto) {
    return this.paymentService.getAllPayments(query);
  }

  /* ─── STUDENT PAYMENT SUMMARY ─── */
  @Get('student/:studentProfileId/summary')
  @ApiOperation({
    summary: 'Talabaning to\'lov xulosasi',
    description:
      'Qaysi oylarga to\'lagan, qaysi oylarga qarzi bor, umumiy to\'lagan va qarz summasi',
  })
  @ApiParam({ name: 'studentProfileId' })
  @ApiQuery({ name: 'groupId', required: false })
  @ApiQuery({ name: 'fromYear', required: false, type: Number })
  @ApiQuery({ name: 'fromMonth', required: false, type: Number })
  @ApiQuery({ name: 'toYear', required: false, type: Number })
  @ApiQuery({ name: 'toMonth', required: false, type: Number })
  getStudentSummary(
    @Param('studentProfileId') studentProfileId: string,
    @Query('groupId') groupId?: string,
    @Query('fromYear') fromYear?: string,
    @Query('fromMonth') fromMonth?: string,
    @Query('toYear') toYear?: string,
    @Query('toMonth') toMonth?: string,
  ) {
    return this.paymentService.getStudentPaymentSummary(
      studentProfileId,
      groupId,
      fromYear ? +fromYear : undefined,
      fromMonth ? +fromMonth : undefined,
      toYear ? +toYear : undefined,
      toMonth ? +toMonth : undefined,
    );
  }

  /* ─── GURUH TO'LOV HOLATI (oy/yil) ─── */
  @Get('group/:groupId/status')
  @ApiOperation({
    summary: 'Guruh o\'quvchilarining to\'lov holati (berilgan oy uchun)',
    description: 'Kim to\'lagan, kim to\'lamagan, qarzlar ro\'yxati',
  })
  @ApiParam({ name: 'groupId' })
  @ApiQuery({ name: 'month', type: Number })
  @ApiQuery({ name: 'year', type: Number })
  getGroupStatus(
    @Param('groupId') groupId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.paymentService.getGroupPaymentStatus(
      groupId,
      +month,
      +year,
    );
  }

  /* ─── STATISTICS ─── */
  @Get('statistics/overview')
  @ApiOperation({
    summary: 'To\'lov statistikasi',
    description: 'Jami tushum, PAID/PARTIAL/UNPAID bo\'yicha breakdown, oylik dinamika',
  })
  getStatistics(@Query() dto: PaymentStatisticsDto) {
    return this.paymentService.getPaymentStatistics(dto);
  }
}