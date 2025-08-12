import { Body, Controller, Get, HttpCode, HttpStatus, Post, Patch, Param, Delete } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthService } from "./auth.service";
import { Role } from "../common/enums/role.enum";
import { Auth } from "./decorators/auth.decorator";
import { ActiveUser } from "../common/decorators/active-user.decorator";
import { UserActiveInterface } from "../common/interfaces/user-active.interface";
import { RequestResetPasswordDto } from "./dto/requestResetPassword.dto";
import { ResetPasswordDto } from "./dto/resetPassword.dto";
import { UpdateUserDto } from "../users/dto/update-user.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  /** actualizado el register */
  // @Auth(Role.ADMIN)
  @Post('nuevo-usuario')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.registro(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Auth(Role.USER, Role.GUEST)
  @Patch('/updateUser/:id')
  async updateUser(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return await this.authService.updateUser(id, updateUserDto);
  }

  @Post('requestResetPassword')
  async requestResetPasswordByEmail(@Body() dto: RequestResetPasswordDto) {
    return this.authService.requestResetPasswordByEmail(dto);
  }

  @Post('resetPassword')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto);
  }

  @Get('profile')
  @Auth(Role.USER, Role.GUEST)
  async profile(@ActiveUser() user: UserActiveInterface) {
    return await this.authService.profile(user);
  }

  @Get('listar-usuarios')
  @Auth(Role.ADMIN)
  async findAllUsers() {
    return await this.authService.findAll();
  }

  @Delete('dar-de-baja-usuario/:id')
  @Auth(Role.ADMIN)
  async deleteUser(@Param('id') id: number) {
    return await this.authService.deleteUser(id);
  }

  @Patch('activar-usuario/:id')
  @Auth(Role.ADMIN)
  async activarUsuario(@Param('id') id: number) {
    return await this.authService.activarUsuario(id);
  }


}