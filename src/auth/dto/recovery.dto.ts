import { Transform } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";

export class RecoveryDto {

  @IsEmail()
  email: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(6)
  password: string;

}