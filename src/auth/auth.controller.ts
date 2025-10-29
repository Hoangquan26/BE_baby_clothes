import { Body, Controller, Get, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService, type LoginSuccessResponse } from './auth.service';
import { LoginAuthDTO } from './dto/login-auth.dto';
import { RegisterAuthDTO } from './dto/register-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthGuard } from 'src/common/guard/auth/auth.guard';
import { RefreshTokenGuard } from 'src/common/guard/auth/refresh-token.guard';
import { AUTH_PAYLOAD_SELECT, AuthCookies, baseCookieOptions } from './auth.constant';

const formatMeta = (meta: Record<string, unknown>) => JSON.stringify(meta);

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() loginAuthDTO: LoginAuthDTO,
  ) {
    const userAgentHeader = req.headers['user-agent'] ?? null;
    this.logger.log(
      `Login attempt for ${loginAuthDTO.username} ${formatMeta({
        userAgent: userAgentHeader,
        rememberMe: loginAuthDTO.rememberMe ?? false,
      })}`,
    );

    const result = await this.authService.login(loginAuthDTO, {
      userAgent: typeof userAgentHeader === 'string' ? userAgentHeader : null,
    });

    if (result.accessToken) {
      res.cookie(AuthCookies.accessToken, result.accessToken, baseCookieOptions)
    }

    if (result.refreshToken) {
      res.cookie(AuthCookies.refreshToken, result.refreshToken, baseCookieOptions);
    }

    if (result.sessionId) {
      res.cookie(AuthCookies.sessionId, result.sessionId, baseCookieOptions);
    }

    return result;
  }

  @Post('register')
  async register(@Body() registerAuthDTO: RegisterAuthDTO) {
    this.logger.log(
      `Register attempt for ${registerAuthDTO.username} ${formatMeta({
        email: registerAuthDTO.email,
      })}`,
    );
    return await this.authService.register(registerAuthDTO);
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refresh(
    @Req() req
  ): Promise<LoginSuccessResponse> {
    const refreshToken = req.refreshToken
    const sessionId = req.sessionId
    const user = req.user
    this.logger.log(
      `Refreshing token ${formatMeta({ sessionId: sessionId })}`,
    );
    return await this.authService.refreshToken({refreshToken, sessionId, user});
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: Request) {
    const user: AUTH_PAYLOAD_SELECT = (req as Record<string, any>).user;
    this.logger.log(
      `Fetching profile ${formatMeta({
        userId: user.sub,
        username: user.username ?? null,
      })}`,
    );
    return await this.authService.getUserInfo(user);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const sessionId = (req as Record<string, any>).sessionId ?? null;
    this.logger.log(`Logout request ${formatMeta({ sessionId })}`);
    if (sessionId) {
      await this.authService.logout(sessionId);
    }
    res.clearCookie(AuthCookies.refreshToken);
    res.clearCookie(AuthCookies.sessionId);
    res.clearCookie(AuthCookies.accessToken);
    return { success: true };
  }
}
