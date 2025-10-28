import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService, type LoginSuccessResponse } from './auth.service';
import { LoginAuthDTO } from './dto/login-auth.dto';
import { RegisterAuthDTO } from './dto/register-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthGuard } from 'src/common/guard/auth/auth.guard';
import { AUTH_PAYLOAD_SELECT } from './auth.constant';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Req() req: Request, @Body() loginAuthDTO: LoginAuthDTO) {
    const userAgentHeader = req.headers['user-agent'] ?? null;

    return await this.authService.login(loginAuthDTO, {
      userAgent: typeof userAgentHeader === 'string' ? userAgentHeader : null,
    });
  }

  @Post('register')
  async register(@Body() registerAuthDTO: RegisterAuthDTO) {
    return await this.authService.register(registerAuthDTO);
  }

  @Post('refresh')
  @UseGuards(AuthGuard)
  async refresh(@Req() req, @Res() res: Response): Promise<LoginSuccessResponse> {
    const refreshToken = req.refreshToken;
    const sessionId = req.sessionId;
    return await this.authService.refreshToken({ refreshToken, sessionId });
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: Request) {
    const user: AUTH_PAYLOAD_SELECT = (req as Record<string, any>).user;
    return await this.authService.getUserInfo(user);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request) {
    const sessionId = (req as Record<string, any>).sessionId ?? null;
    await this.authService.logout(sessionId);
    return { success: true };
  }
}
