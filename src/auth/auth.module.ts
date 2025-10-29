import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { AuthGuard } from 'src/common/guard/auth/auth.guard';
import { RefreshTokenGuard } from 'src/common/guard/auth/refresh-token.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule], 
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const expiresIn =
          config.get<string>('JWT_EXPIRES_IN') ??
          `${config.get<number>('JWT_EXPIRES_IN') ?? 3600}s`;
        const secret = config.getOrThrow<string>('JWT_SECRET')
        return {
          secret: secret,
          signOptions: {
            expiresIn: expiresIn as JwtSignOptions['expiresIn'],
          },
        };
      },
    }),
    PrismaModule,
    UserModule,
    ConfigModule
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, RefreshTokenGuard],
  exports: [AuthGuard, RefreshTokenGuard, JwtModule, UserModule],
})
export class AuthModule {}


