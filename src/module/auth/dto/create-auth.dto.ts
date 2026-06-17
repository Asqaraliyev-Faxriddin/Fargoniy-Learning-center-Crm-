import { IsEmail, IsNotEmpty, IsNumber, IsPassportNumber, IsPhoneNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
    
    @ApiProperty({
        example: "asqaraliyevfaxriddin2009@gmail.com",
        description: "Foydalanuvchining telefon raqami",
    })
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    email: string;

    @ApiProperty({
        example: "12345678",
        description: "Foydalanuvchining paroli",
    })
    @IsNotEmpty()
    @IsString()
    password: string;
}
