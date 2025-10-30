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
import {  JwtAuthPayload } from 'src/auth/auth.constant';
import { extractTokenFromHeader } from 'src/common/utils/http.util';


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = extractTokenFromHeader(request);

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

    (request as any).user = {
      ...user,
      tokenExpiresAt:
        typeof payload.exp === 'number'
          ? new Date(payload.exp * 1000).toISOString()
          : undefined,
    };

    return true;
  }

  
}
