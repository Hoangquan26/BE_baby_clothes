import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { LoginAuthDTO } from './dto/login-auth.dto';
import { RegisterAuthDTO } from './dto/register-auth.dto';
import { UserService } from 'src/user/user.service';
import { AUTH_PAYLOAD_SELECT } from './auth.constant';
import { SessionService } from './session.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GetUserInfoDTO } from './dto/get-user-info.dto';
import { randomUUID } from 'crypto';

export type LoginSuccessResponse = {
  tokenType: 'Bearer';
  accessToken: string;
  refreshToken?: string;
  expiresIn: JwtSignOptions['expiresIn'];
  refreshTokenExpiresIn?: JwtSignOptions['expiresIn'];
  sessionId?: string;
  sessionExpiresAt?: string;
  user: {
    id: string;
    email: string;
    username: string | null;
    lastLoginAt: string | null;
  };
};

type LoginContext = {
  userAgent?: string | null;
};

@Injectable()
export class AuthService {
  private readonly invalidCredentialsMessage =
    'Thông tin đăng nhập không chính xác';

  constructor(
    private readonly userService: UserService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
  ) {}

  private get saltRounds() {
    return Number(this.config.get('hash.auth_salt') ?? 12);
  }

  private get accessTokenSecret(): string {
    return this.config.getOrThrow<string>('jwt.accessTokenSecret');
  }

  private get refreshTokenSecret(): string {
    return this.config.getOrThrow<string>('jwt.refreshTokenSecret');
  }

  private get accessTokenExpiresIn(): JwtSignOptions['expiresIn'] {
    return this.config.getOrThrow<JwtSignOptions['expiresIn']>('jwt.expiresIn');
  }

  private get refreshTokenExpiresIn(): JwtSignOptions['expiresIn'] {
    return this.config.getOrThrow<JwtSignOptions['expiresIn']>(
      'jwt.refreshTokenExpiresIn',
    );
  }

  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  async login(
    loginAuthDto: LoginAuthDTO,
    context?: LoginContext,
  ): Promise<LoginSuccessResponse> {
    const { username, password, rememberMe } = loginAuthDto;
    const user = await this.userService.findUserForAuth(username);

    if (!user || !user.isActive) {
      throw new BadRequestException(this.invalidCredentialsMessage);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException(this.invalidCredentialsMessage);
    }

    await this.userService
      .updateLastLoginTimestamp(user.id)
      .catch(() => undefined);

    const payload = this.buildAuthPayload(user.id, user.username ?? user.email);
    const includeRefresh = rememberMe === true;
    const tokens = await this.generateTokenPair(payload, includeRefresh);

    const response: LoginSuccessResponse = {
      tokenType: 'Bearer',
      accessToken: tokens.accessToken,
      expiresIn: this.accessTokenExpiresIn,
      user: {
        id: user.id,
        email: user.email,
        username: user.username ?? null,
        lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      },
    };

    if (tokens.refreshToken) {
      response.refreshToken = tokens.refreshToken;
      response.refreshTokenExpiresIn = this.refreshTokenExpiresIn;

      if (tokens.refreshTokenExpiresAt) {
        const session = await this.sessionService.createSession({
          userId: user.id,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.refreshTokenExpiresAt,
          userAgent: context?.userAgent ?? null,
          saltRounds: this.saltRounds,
        });

        response.sessionId = session.id;
        response.sessionExpiresAt = session.expiresAt.toISOString();
      }
    }
    return response;
  }

  async register(registerAuthDto: RegisterAuthDTO) {
    const { confirmPassword, email, fullName, password, username } =
      registerAuthDto;
    if (confirmPassword !== password) {
      throw new BadRequestException('Mật khẩu xác thực không khớp');
    }

    const foundExistUser =
      await this.userService.findUserByBothEmailAndUsername({
        email,
        username,
      });

    if (foundExistUser) {
      throw new BadRequestException('Thông tin đăng ký đã được sử dụng');
    }

    const hashedPassword = await this.hashPassword(password);
    const createdUser = await this.userService.create({
      email,
      fullName,
      username,
      passwordHash: hashedPassword,
    });
    return createdUser;
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<LoginSuccessResponse> {
    const { refreshToken, sessionId, user } = refreshTokenDto;

    const session = await this.sessionService.validateRefreshToken(
      sessionId,
      refreshToken,
      user.id
    );

    if (!session) {
      await this.sessionService.deleteSession(sessionId);
      throw new UnauthorizedException('Token không hợp lệ');
    }

    const payload = this.buildAuthPayload(user.id, user.username ?? user.email);
    const tokens = await this.generateTokenPair(payload, true);

    if (!tokens.refreshToken || !tokens.refreshTokenExpiresAt) {
      throw new InternalServerErrorException(
        'Không thể cấp phiên đăng nhập',
      );
    }

    const rotated = await this.sessionService.rotateRefreshToken(
      session.id,
      tokens.refreshToken,
      tokens.refreshTokenExpiresAt,
      this.saltRounds,
    );

    return {
      tokenType: 'Bearer',
      accessToken: tokens.accessToken,
      expiresIn: this.accessTokenExpiresIn,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiresIn: this.refreshTokenExpiresIn,
      sessionId: rotated.id,
      sessionExpiresAt: rotated.expiresAt.toISOString(),
      user: {
        id: user.id,
        email: user.email,
        username: user.username ?? null,
        lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      },
    } satisfies LoginSuccessResponse;
  }

  async getUserInfo(user: GetUserInfoDTO) {
    const { sub: userId } = user;
    return user;
  }

  async logout(sessionId: string | null | undefined) {
    if (!sessionId) {
      return;
    }
    await this.sessionService.deleteSession(sessionId);
  }

  private buildAuthPayload(
    userId: string,
    username: string | null,
  ): AUTH_PAYLOAD_SELECT {
    return {
      sub: userId,
      username: username ?? userId,
    };
  }

  private async generateTokenPair(
    payload: AUTH_PAYLOAD_SELECT,
    includeRefreshToken: boolean,
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
    refreshTokenExpiresAt?: Date;
  }> {
    const accessTokenPromise = this.jwtService.signAsync(payload, {
      secret: this.accessTokenSecret,
      expiresIn: this.accessTokenExpiresIn,
    });

    if (!includeRefreshToken) {
      const accessToken = await accessTokenPromise;
      return { accessToken };
    }

    const refreshTokenPromise = this.jwtService.signAsync(payload, {
      secret: this.refreshTokenSecret,
      expiresIn: this.refreshTokenExpiresIn,
      jwtid: randomUUID(),
    });

    const [accessToken, refreshToken] = await Promise.all([
      accessTokenPromise,
      refreshTokenPromise,
    ]);

    const refreshPayload = await this.jwtService.verifyAsync<
      { exp: number } & AUTH_PAYLOAD_SELECT
    >(refreshToken, {
      secret: this.refreshTokenSecret,
    });

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt: new Date(refreshPayload.exp * 1000),
    };
  }
}
