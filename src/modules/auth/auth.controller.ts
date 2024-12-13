import {
  Controller,
  Post,
  Body,
  UsePipes,
  Res,
  Req,
  Patch,
} from '@nestjs/common';
import { ResponseHandler } from 'utility/success-response';
import { RegisterDto } from 'DTO/register.dto';
import { HashPasswordPipe } from 'pipes/hash-password.pipe';
import { Response, Request } from 'express';
import { SuccessHandler } from 'interfaces/success-handler.interface';
import { AuthService } from './auth.service';
import { LoginInDTO } from 'DTO/login.dto';
import { CustomError } from 'utility/custom-error';
import { JwtService } from '@nestjs/jwt';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseHandler: ResponseHandler,
  ) { }

  @Post('register')
  @UsePipes(HashPasswordPipe)
  public async register(
    @Body() registerDto: RegisterDto,
  ): Promise<SuccessHandler<any>> {
    console.log(registerDto, "dto");
    const response = await this.authService.register(registerDto);
    if (response) {
      return this.responseHandler.successHandler(
        null,
        'Account Registered Successfully, wait for admin verification',
      );
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
    return this.responseHandler.successHandler(
      loggedUser,
      'User LoggedIn Successfully',
    );
  }

  @Post('logout')
  public async logoutUser(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SuccessHandler<any>> {
    console.log('Entered');
    console.log(req.user, 'entity');
    const { id } = req.user;
    const responseFromService = await this.authService.logout(id);
    const Options = {
      httpOnly: true,
      secure: true,
    };
    if (responseFromService) {
      response.clearCookie('accessToken', Options);
      response.clearCookie('refreshToken', Options);
    }

    return this.responseHandler.successHandler(
      null,
      'Account LoggedOut Successfully',
    );
  }

  @Post('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const IncommingRefreshToken = req.cookies?.refreshToken;
    console.log('uncc', IncommingRefreshToken);

    if (!IncommingRefreshToken) {
      throw new CustomError('Refresh token is missing', 400);
    }
    try {
      const newTokens = await this.authService.refreshToken(
        IncommingRefreshToken,
      );
      const { accessToken, refreshToken } = newTokens;
      console.log('Controller', newTokens);

      const Options = { httpOnly: true, secure: true };

      response.cookie('accessToken', accessToken, Options);

      response.cookie('refreshToken', refreshToken, Options);

      return this.responseHandler.successHandler(
        newTokens,
        'Tokens refreshed Sucessfully',
      );
    } catch (error) {
      throw new CustomError(error.message || 'Failed to refresh token', 500);
    }
  }

  @Post('verify-phone')
  async verifyPhone(
    @Body() body: { phoneNumber: string },
  ): Promise<SuccessHandler<any>> {
    const { phoneNumber } = body;

    try {
      const response = await this.authService.verifyPhone(phoneNumber);
      if (!response) {
        throw new CustomError('Unable to verify phone number', 401);
      }
      return this.responseHandler.successHandler(true, 'Phone Number Verified');
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        'There is an Error During verify phone try again later',
        402,
      );
    }
  }

  @Post('reset-password')
  @UsePipes(HashPasswordPipe)
  async resetPassword(
    @Body()
    body: {
      phoneNumber: string;
      verificationCode: string;
      newPassword: string;
      role: string;
    },
  ) {
    const { phoneNumber, verificationCode, newPassword, role } = body;
    console.log('Body');

    try {
      const response = await this.authService.verifyCode(
        phoneNumber,
        verificationCode,
      );
      if (!response) {
        throw new CustomError('unable to verify phone');
      }
      const updatedPassword = await this.authService.resetPassword(
        phoneNumber,
        newPassword,
      );
      console.log('Updated Password', updatedPassword);
      if (!updatedPassword) {
        throw new CustomError('Unable to update the Password', 401);
      }
      return this.responseHandler.successHandler(
        true,
        'Passowrd Reset Successfully',
      );
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Error during code verification', 500);
    }
  }
}
