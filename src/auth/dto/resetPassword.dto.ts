import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class ResetPasswordDto{
    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsUUID('4')
    resetPasswordToken: string;
}