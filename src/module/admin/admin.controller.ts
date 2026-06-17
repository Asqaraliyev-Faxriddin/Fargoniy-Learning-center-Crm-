  import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UseGuards,
  } from "@nestjs/common";
  import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
  import { AdminService } from "./admin.service";
  import {
    CreateAdminDto,
    PaginationQueryDto,
    UpdateAdminDto,
  } from "./dto/create-admin.dto";
  import { Roles } from "src/common/decorators/Roles.decorators";
  import { UserRole } from "@prisma/client";
  import { AuthGuard } from "src/common/guards/AuthGuard";
  import { RolesGuard } from "src/common/guards/RolesGuard";

  @ApiTags("Admin")
  @ApiBearerAuth()

  @Controller("admin")
  export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    // POST /admin
    @Roles(UserRole.DIREKTOR)
    @UseGuards(AuthGuard,RolesGuard)
    @Post()
    @ApiOperation({ summary: "Yangi admin qo'shish" })
    create(@Body() dto: CreateAdminDto) {
      return this.adminService.create(dto);
    }

    // GET /admin
    @Roles(UserRole.DIREKTOR)
    @UseGuards(AuthGuard,RolesGuard)
    @Get()
    @ApiOperation({ summary: "Barcha adminlar ro'yxati (pagination + search)" })
    findAll(@Query() query: PaginationQueryDto) {
      return this.adminService.findAll(query);
    }

    // GET /admin/statistics
    @Roles(UserRole.DIREKTOR,UserRole.ADMIN)
    @UseGuards(AuthGuard,RolesGuard)
    @Get("statistics")
    @ApiOperation({ summary: "Umumiy statistika" })
    getStatistics() {
      return this.adminService.getStatistics();
    }

    // GET /admin/:id
    @Roles(UserRole.DIREKTOR)
    @UseGuards(AuthGuard,RolesGuard)
    @Get(":id")
    @ApiOperation({ summary: "Bitta admin ma'lumotlari" })
    findOne(@Param("id", ParseUUIDPipe) id: string) {
      return this.adminService.findOne(id);
    }
 
    // PATCH /admin/:id
    @Roles(UserRole.DIREKTOR)
    @UseGuards(AuthGuard,RolesGuard)
    @Patch(":id")
    @ApiOperation({ summary: "Admin ma'lumotlarini yangilash" })
    update(
      @Param("id", ParseUUIDPipe) id: string,
      @Body() dto: UpdateAdminDto,
    ) {
      return this.adminService.update(id, dto);
    }

    // PATCH /admin/:id/toggle-status
    @Roles(UserRole.DIREKTOR)
    @UseGuards(AuthGuard,RolesGuard)
    @Patch(":id/toggle-status")
    @ApiOperation({ summary: "Adminni faollashtirish yoki bloklash" })
    toggleStatus(@Param("id", ParseUUIDPipe) id: string) {
      return this.adminService.toggleStatus(id);
    }

    // DELETE /admin/:id
    @Roles(UserRole.DIREKTOR)
    @UseGuards(AuthGuard,RolesGuard)
    @Delete(":id")
    @ApiOperation({ summary: "Adminni o'chirish" })
    remove(@Param("id", ParseUUIDPipe) id: string) {
      return this.adminService.remove(id);
    }
  }