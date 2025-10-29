import { Body, Controller, Get, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService, type LoginSuccessResponse } from './auth.service';
import { LoginAuthDTO } from './dto/login-auth.dto';
import { RegisterAuthDTO } from './dto/register-auth.dto';
import { AuthGuard } from 'src/common/guard/auth/auth.guard';
import { RefreshTokenGuard } from 'src/common/guard/auth/refresh-token.guard';
import { AUTH_PAYLOAD_SELECT, AuthCookies, baseCookieOptions } from './auth.constant';
import { LoginSuccessResponseDto } from './dto/login-success-response.dto';
import { SafeUserDto } from 'src/user/dto/safe-user.dto';
import { GetUserInfoDTO } from './dto/get-user-info.dto';

type RefreshRequest = Request & { refreshToken: string; sessionId: string; user: GetUserInfoDTO & { email: string; fullName?: string | null } };

const formatMeta = (meta: Record<string, unknown>) => JSON.stringify(meta);

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Sign in',
    description: 'Authenticate user credentials and issue access/refresh tokens.',
  })
  @ApiBody({ type: LoginAuthDTO })
  @ApiOkResponse({
    description: 'Login successful.',
    type: LoginSuccessResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid login payload.' })
  @ApiUnauthorizedResponse({ description: 'Incorrect username/email or password.' })
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
      res.cookie(AuthCookies.accessToken, result.accessToken, baseCookieOptions);
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
  @ApiOperation({ summary: 'Register a new account' })
  @ApiBody({ type: RegisterAuthDTO })
  @ApiCreatedResponse({ description: 'Account created successfully.', type: SafeUserDto })
  @ApiBadRequestResponse({ description: 'Invalid registration data or account already exists.' })
  async register(@Body() registerAuthDTO: RegisterAuthDTO): Promise<SafeUserDto> {
    this.logger.log(
      `Register attempt for ${registerAuthDTO.username} ${formatMeta({
        email: registerAuthDTO.email,
      })}`,
    );
    const createdUser = await this.authService.register(registerAuthDTO);
    return {
      ...createdUser,
      createdAt:
        createdUser.createdAt instanceof Date
          ? createdUser.createdAt.toISOString()
          : createdUser.createdAt,
      updatedAt:
        createdUser.updatedAt instanceof Date
          ? createdUser.updatedAt.toISOString()
          : createdUser.updatedAt,
    };
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Rotate the refresh token and return a fresh access token using cookies.',
  })
  @ApiCookieAuth(AuthCookies.refreshToken)
  @ApiOkResponse({ description: 'Token refreshed successfully.', type: LoginSuccessResponseDto })
  @ApiUnauthorizedResponse({ description: 'Refresh token invalid, expired, or session revoked.' })
  async refresh(@Req() req: RefreshRequest, @Res({passthrough: true}) res: Response): Promise<LoginSuccessResponse> {
    const { refreshToken, sessionId, user } = req;
    this.logger.log(
      `Refreshing token ${formatMeta({ sessionId })}`,
    );
    const result = await this.authService.refreshToken({ refreshToken, sessionId, user });
    
    if (result.accessToken) {
      res.cookie(AuthCookies.accessToken, result.accessToken, baseCookieOptions);
    }

    if (result.refreshToken) {
      res.cookie(AuthCookies.refreshToken, result.refreshToken, baseCookieOptions);
    }

    if (result.sessionId) {
      res.cookie(AuthCookies.sessionId, result.sessionId, baseCookieOptions);
    }
    return result
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Current user info.', type: GetUserInfoDTO })
  @ApiUnauthorizedResponse({ description: 'Access token missing or invalid.' })
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
  @ApiOperation({ summary: 'Sign out', description: 'Invalidate the current session and refresh token.' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Logout successful.', schema: { example: { success: true } } })
  @ApiUnauthorizedResponse({ description: 'Access token missing or invalid.' })
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




