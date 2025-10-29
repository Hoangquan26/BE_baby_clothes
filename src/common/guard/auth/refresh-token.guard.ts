import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthCookies, JwtAuthPayload } from 'src/auth/auth.constant';
import { SessionService } from 'src/user-session/user-session.service';
import { extractSessionId } from 'src/common/utils/request.util';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const refreshToken = request.cookies[AuthCookies.refreshToken];

    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new UnauthorizedException('Refresh token missing');
    }
    let payload: JwtAuthPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtAuthPayload>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>(
            'jwt.refreshTokenSecret',
          ),
        },
      );
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }
    const user = await this.userService.findSafeUserById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Không thể xác thực người dùng');
    }

    (request as Record<string, any>).refreshTokenPayload = payload;
    const sessionId = extractSessionId(request);
    if (sessionId) {
      const isActive = await this.sessionService.isSessionActive(
        sessionId,
        payload.sub,
      );

      if (!isActive) {
        throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');
      }
      (request as any).refreshToken = request.cookies[AuthCookies.refreshToken];
      (request as any).sessionId = sessionId;
      (request as any).user = user;
    }
    return true;
  }
}
