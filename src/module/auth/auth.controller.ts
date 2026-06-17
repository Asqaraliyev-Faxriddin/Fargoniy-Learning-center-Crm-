import { 
  Controller, 
  Post, 
  Body, 
  Req, 
  HttpCode, 
  HttpStatus 
} from "@nestjs/common";
import { Request } from "express";
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiOkResponse, 
  ApiBadRequestResponse, 
  ApiNotFoundResponse, 
  ApiUnauthorizedResponse 
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/create-auth.dto";
import { RefreshTokenDto } from "./dto/refresh.token.dto";

// Swagger-da alohida bo'lim qilib ko'rsatish uchun tag
@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: "Foydalanuvchini tizimga kiritish (Login)", 
    description: "Email va parol orqali login qilinadi va Access/Refresh tokenlar qaytariladi." 
  })
  @ApiOkResponse({
    description: "Tizimga muvaffaqiyatli kirildi.",
    schema: {
      type: "object",
      properties: {
        status: { type: "boolean", example: true },
        message: { type: "string", example: "Login successful" },
        tokens: {
          type: "object",
          properties: {
            AccessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            RefreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: "Parol noto'g'ri yoki yuborilgan ma'lumotlar xato." })
  @ApiNotFoundResponse({ description: "Bunday email mavjud emas." })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    return this.authService.login(loginDto, req);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: "Access Tokenni yangilash (Refresh Token orqali)", 
    description: "Eski yoki muddati o'tgan Access tokenni yangilash uchun amaldagi Refresh tokenni yuborish kerak." 
  })
  @ApiOkResponse({
    description: "Access token muvaffaqiyatli yangilandi.",
    schema: {
      type: "object",
      properties: {
        AccessToken: {
          type: "object",
          properties: {
            AccessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
          }
        }
      },
    },
  })
  @ApiUnauthorizedResponse({ description: "Refresh token yaroqsiz yoki muddati o'tgan." })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.RefresholdAcces(refreshTokenDto);
  }
}