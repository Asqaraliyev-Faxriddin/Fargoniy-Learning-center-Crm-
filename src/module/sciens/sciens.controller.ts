  import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Delete,
    Param,
    Query,
    ParseIntPipe,
    UseGuards,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBearerAuth,
  } from '@nestjs/swagger';
  import { SciensService } from './sciens.service';
  import {
    CreateSubjectDto,
    FindAllSubjectDto,
    UpdateSubjectDto,
  } from './dto/create-scien.dto';
  import { AuthGuard } from 'src/common/guards/AuthGuard';
  import { RolesGuard } from 'src/common/guards/RolesGuard';
  import { Roles } from 'src/common/decorators/Roles.decorators';
  import { UserRole } from '@prisma/client';

  @ApiTags('Subjects')
  @ApiBearerAuth()
  @Controller('subjects')
  @Roles(UserRole.DIREKTOR,UserRole.ADMIN)
  @UseGuards(AuthGuard,RolesGuard)
  export class SciensController {
    constructor(private readonly sciensService: SciensService) {}

    // ─── CREATE ───────────────────────────────────────────────
    @Post()
    @ApiOperation({ summary: 'Yangi fan yaratish' })
    @ApiResponse({ status: 201, description: 'Fan muvaffaqiyatli yaratildi' })
    @ApiResponse({ status: 400, description: "Noto'g'ri ma'lumot" })
    create(@Body() createSubjectDto: CreateSubjectDto) {
      return this.sciensService.create(createSubjectDto);
    }

    // ─── FIND ALL ─────────────────────────────────────────────
    @Get()
    @ApiOperation({ summary: "Barcha fanlarni olish (filter + pagination bilan)" })
    @ApiResponse({ status: 200, description: "Fanlar ro'yxati" })
    findAll(@Query() query: FindAllSubjectDto) {
      return this.sciensService.findAll(query);
    }

    // ─── FIND ONE ─────────────────────────────────────────────
    @Get(':id')
    @ApiOperation({ summary: "Bitta fanni ID bo'yicha olish" })
    @ApiParam({ name: 'id', example: 1, description: 'Fan IDsi' })
    @ApiResponse({ status: 200, description: 'Fan topildi' })
    @ApiResponse({ status: 404, description: 'Fan topilmadi' })
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.sciensService.findOne({ id });
    }

    // ─── UPDATE ───────────────────────────────────────────────
    @Patch(':id')
    @ApiOperation({ summary: "Fanni yangilash" })
    @ApiParam({ name: 'id', example: 1, description: 'Yangilanadigan fan IDsi' })
    @ApiResponse({ status: 200, description: 'Fan yangilandi' })
    @ApiResponse({ status: 404, description: 'Fan topilmadi' })
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateSubjectDto: UpdateSubjectDto,
    ) {
      return this.sciensService.update(id, updateSubjectDto);
    }

    // ─── DELETE ───────────────────────────────────────────────
    @Delete(':id')
    @ApiOperation({ summary: "Fanni o'chirish" })
    @ApiParam({ name: 'id', example: 1, description: "O'chiriladigan fan IDsi" })
    @ApiResponse({ status: 200, description: "Fan o'chirildi" })
    @ApiResponse({ status: 404, description: 'Fan topilmadi' })
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.sciensService.remove({ id });
    }
  }