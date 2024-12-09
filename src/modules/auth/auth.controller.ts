import { Controller, Post, Body, UsePipes, Res } from '@nestjs/common';
import { ResponseHandler } from 'utility/success-response';
import { RegisterDto } from 'DTO/register.dto';
import { HashPasswordPipe } from 'pipes/hash-password.pipe';
import { Response } from 'express';
import { SuccessHandler } from 'interfaces/success-handler.interface';
import { AuthService } from './auth.service';
import { LoginInDTO } from 'DTO/login.dto';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseHandler: ResponseHandler,
  ) { }

  @Post('register')
  @UsePipes(HashPasswordPipe)
  public async register(@Body() registerDto: RegisterDto): Promise<SuccessHandler<any>> {
    const response = await this.authService.register(registerDto)
    if (response) {
      return this.responseHandler.successHandler(null, "Account Registered Successfully, wait for admin verification")
    }
  }


  @Post('login')
  public async login(
    @Body() loginDto: LoginInDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SuccessHandler<any>> {
    const loggedUser = await this.authService.login(loginDto);
    const Options = {
      httpOnly: true,
      secure: true,
    };
    response.cookie('accessToken', loggedUser.accessToken, Options);
    response.cookie('refreshToken', loggedUser.refreshToken, Options);
    return this.responseHandler.successHandler(loggedUser, "User LoggedIn Successfully")
  }


}

