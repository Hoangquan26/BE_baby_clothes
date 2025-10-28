import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import { AUTH_PAYLOAD_SELECT } from 'src/auth/auth.constant';
import { SessionService } from 'src/auth/session.service';

type JwtAuthPayload = AUTH_PAYLOAD_SELECT & {
  exp?: number;
  iat?: number;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Không tìm thấy token');
    }

    let payload: JwtAuthPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtAuthPayload>(token, {
        secret: this.configService.getOrThrow<string>('jwt.accessTokenSecret'),
      });
    } catch (error) {
      throw new UnauthorizedException('Phiên đăng nhập có thể đã hết hạn');
    }

    const user = await this.userService.findSafeUserById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Không thể xác thực người dùng');
    }

    const sessionId = this.extractSessionId(request);
    if (sessionId) {
      const isActive = await this.sessionService.isSessionActive(
        sessionId,
        user.id,
      );

      if (!isActive) {
        throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');
      }
      (request as any).refreshToken =  request.cookies['refreshToken']
      (request as any).sessionId = sessionId;
    }

    (request as any).user = {
      ...user,
      tokenExpiresAt:
        typeof payload.exp === 'number'
          ? new Date(payload.exp * 1000).toISOString()
          : undefined,
    };

    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authorization = request.headers['authorization'];
    if (typeof authorization !== 'string') {
      return null;
    }

    const [type, token] = authorization.split(' ');
    if (type?.toLowerCase() === 'bearer' && token) {
      return token;
    }

    return null;
  }

  private extractSessionId(request: Request): string | null {
    const sessionHeader = request.headers['x-session-id'];
    if (typeof sessionHeader === 'string' && sessionHeader.trim().length > 0) {
      return sessionHeader.trim();
    }

    if (Array.isArray(sessionHeader) && sessionHeader.length > 0) {
      return sessionHeader[0];
    }

    return null;
  }
}
