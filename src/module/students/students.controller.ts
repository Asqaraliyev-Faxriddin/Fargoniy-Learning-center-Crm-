  import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
  } from '@nestjs/common';
  import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
  } from '@nestjs/swagger';
  import { StudentService } from './students.service';
  import {
    AddStudentToGroupDto,
    CreateStudentDto,
    RemoveStudentFromGroupDto,
    StudentQueryDto,
    UpdateStudentDto,
  } from './dto/create-student.dto';
  import { RolesGuard } from 'src/common/guards/RolesGuard';
  import { Roles } from 'src/common/decorators/Roles.decorators';
  import { UserRole } from '@prisma/client';
  import { AuthGuard } from 'src/common/guards/AuthGuard';

  @ApiTags('Students')
  @ApiBearerAuth()
  @Roles(UserRole.DIREKTOR,UserRole.ADMIN)
  @UseGuards(AuthGuard,RolesGuard)
  @Controller('students')
  export class StudentController {
    constructor(private  studentService: StudentService) {}

    /* ─── CREATE ─── */
    @Post()
    @ApiOperation({
      summary: 'Yangi talaba qo\'shish',
      description:
        'Admin talaba qo\'shadi. Email kiritilmaydi — bazaga bo\'sh string saqlanadi.',
    })
    @ApiResponse({ status: 201, description: 'Talaba muvaffaqiyatli yaratildi' })
    @ApiResponse({ status: 409, description: 'Bu telefon raqam allaqachon mavjud' })
    create(@Body() dto: CreateStudentDto) {
      return this.studentService.createStudent(dto);
    }

    /* ─── GET ALL ─── */
    @Get()
    @ApiOperation({
      summary: 'Barcha talabalar (pagination + qidirish)',
      description:
        'firstName, lastName, phone bo\'yicha qidirish. groupId va isEnabled bo\'yicha filter.',
    })
    @ApiResponse({ status: 200, description: 'Talabalar ro\'yxati' })
    findAll(@Query() query: StudentQueryDto) {
      return this.studentService.getAllStudents(query);
    }

    /* ─── GET ONE ─── */
    @Get(':studentProfileId')
    @ApiOperation({ summary: 'Bitta talabani olish (guruhlari va so\'nggi to\'lovlari bilan)' })
    @ApiParam({ name: 'studentProfileId', description: 'StudentProfile ID' })
    @ApiResponse({ status: 200, description: 'Talaba ma\'lumotlari' })
    @ApiResponse({ status: 404, description: 'Talaba topilmadi' })
    findOne(@Param('studentProfileId') studentProfileId: string) {
      return this.studentService.getStudentById(studentProfileId);
    }

    /* ─── UPDATE ─── */
    @Patch(':studentProfileId')
    @ApiOperation({ summary: 'Talaba ma\'lumotlarini yangilash' })
    @ApiParam({ name: 'studentProfileId', description: 'StudentProfile ID' })
    @ApiResponse({ status: 200, description: 'Yangilangan talaba' })
    @ApiResponse({ status: 404, description: 'Talaba topilmadi' })
    update(
      @Param('studentProfileId') studentProfileId: string,
      @Body() dto: UpdateStudentDto,
    ) {
      return this.studentService.updateStudent(studentProfileId, dto);
    }

    /* ─── DELETE ─── */
    @Delete(':studentProfileId')
    @ApiOperation({
      summary: 'Talabani o\'chirish',
      description: 'User cascade bilan StudentProfile ham o\'chadi',
    })
    @ApiParam({ name: 'studentProfileId', description: 'StudentProfile ID' })
    @ApiResponse({ status: 200, description: 'Talaba o\'chirildi' })
    @ApiResponse({ status: 404, description: 'Talaba topilmadi' })
    remove(@Param('studentProfileId') studentProfileId: string) {
      return this.studentService.deleteStudent(studentProfileId);
    }

    /* ─── ADD TO GROUP ─── */
    @Post(':studentProfileId/groups')
    @ApiOperation({ summary: 'Talabani guruhga qo\'shish' })
    @ApiParam({ name: 'studentProfileId', description: 'StudentProfile ID' })
    @ApiResponse({ status: 201, description: 'Talaba guruhga qo\'shildi' })
    @ApiResponse({ status: 409, description: 'Talaba bu guruhda allaqachon bor' })
    addToGroup(
      @Param('studentProfileId') studentProfileId: string,
      @Body() dto: AddStudentToGroupDto,
    ) {
      return this.studentService.addToGroup(studentProfileId, dto);
    }

    /* ─── REMOVE FROM GROUP ─── */
    @Delete(':studentProfileId/groups')
    @ApiOperation({ summary: 'Talabani guruhdan chiqarish' })
    @ApiParam({ name: 'studentProfileId', description: 'StudentProfile ID' })
    @ApiResponse({ status: 200, description: 'Talaba guruhdan chiqarildi' })
    @ApiResponse({ status: 404, description: 'Talaba bu guruhda topilmadi' })
    removeFromGroup(
      @Param('studentProfileId') studentProfileId: string,
      @Body() dto: RemoveStudentFromGroupDto,
    ) {
      return this.studentService.removeFromGroup(studentProfileId, dto);
    }

    /* ─── TOGGLE STATUS ─── */
    @Patch(':studentProfileId/toggle-status')
    @ApiOperation({
      summary: 'Akkauntni bloklash / faollashtirish',
      description: 'isEnabled holatini teskari qiladi',
    })
    @ApiParam({ name: 'studentProfileId', description: 'StudentProfile ID' })
    @ApiResponse({ status: 200, description: 'Holat o\'zgardi' })
    toggleStatus(@Param('studentProfileId') studentProfileId: string) {
      return this.studentService.toggleStatus(studentProfileId);
    }
  }