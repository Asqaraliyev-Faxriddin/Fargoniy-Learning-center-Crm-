  import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
  } from '@nestjs/common';

  import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
    ApiParam,
    ApiBody,
    ApiOkResponse,
    ApiCreatedResponse,
  } from '@nestjs/swagger';

  import { ExpencesService } from './expences.service';
  import {
    CreateExpenseDto,
    ExpenseIdParamDto,
  } from './dto/create-expence.dto';
  import { UpdateExpenceDto } from './dto/update-expence.dto';

  import { RolesGuard } from 'src/common/guards/RolesGuard';
  import { AuthGuard } from 'src/common/guards/AuthGuard';
  import { Roles } from 'src/common/decorators/Roles.decorators';

  import { UserRole } from '@prisma/client';

  @ApiBearerAuth()
  @ApiTags('Expenses')
  @ApiBearerAuth()
  @Controller('expences')
  export class ExpencesController {
    constructor(private readonly expencesService: ExpencesService) {}

    @Post()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.DIREKTOR)
    @ApiOperation({
      summary: 'Yangi xarajat yaratish',
      description: 'Admin yoki direktor yangi xarajat yaratishi mumkin',
    })
    @ApiBody({ type: CreateExpenseDto })
    @ApiCreatedResponse({
      description: 'Xarajat muvaffaqiyatli yaratildi',
    })
    create(
      @Req() req: any,
      @Body() createExpenseDto: CreateExpenseDto,
    ) {
      return this.expencesService.create(
        req.user.id,
        createExpenseDto,
      );
    }

    @Get()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.DIREKTOR)
    @ApiOperation({
      summary: 'Barcha xarajatlarni olish',
    })
    @ApiOkResponse({
      description: 'Xarajatlar ro‘yxati',
    })
    findAll() {
      return this.expencesService.findAll();
    }

    @Get("profile/me")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.DIREKTOR)
    @ApiOperation({
      summary: `Profile malumotlaringiz`,
    })
    @ApiOkResponse({
      description: 'Profile muffaqiyatli olindi.',
    })
    ProfileMe(@Req() req) {
      return this.expencesService.ProfileMe(req.user.id);
    }

    @Get(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.DIREKTOR)
    @ApiOperation({
      summary: 'Xarajatni ID bo‘yicha olish',
    })
    @ApiParam({
      name: 'id',
      example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
      description: 'Expense UUID',
    })
    @ApiOkResponse({
      description: 'Topilgan xarajat',
    })
    findOne(@Param() params: ExpenseIdParamDto) {
      return this.expencesService.findOne(params.id);
    }

    @Patch(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.DIREKTOR)
    @ApiOperation({
      summary: 'Xarajatni yangilash',
    })
    @ApiParam({
      name: 'id',
      example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    })
    @ApiBody({
      type: UpdateExpenceDto,
    })
    @ApiOkResponse({
      description: 'Xarajat muvaffaqiyatli yangilandi',
    })
    update(
      @Param() params: ExpenseIdParamDto,
      @Req() req: any,
      @Body() updateExpenseDto: UpdateExpenceDto,
    ) {
      return this.expencesService.update(
        params.id,
        req.user.id,
        updateExpenseDto,
      );
    }

    @Delete(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.DIREKTOR)
    @ApiOperation({
      summary: 'Xarajatni o‘chirish',
    })
    @ApiParam({
      name: 'id',
      example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    })
    @ApiOkResponse({
      description: 'Xarajat muvaffaqiyatli o‘chirildi',
    })
    remove(@Param() params: ExpenseIdParamDto) {
      return this.expencesService.remove(params.id);
    }
  }