import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { ApplicationLogger } from './common/logger/logger';
import { PrismaModule } from './prisma/prisma.module';
import { AddressModule } from './address/address.module';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UserRoleModule } from './user-role/user-role.module';
import { UserSessionModule } from './user-session/user-session.module';
import { RequestIdMiddleware } from './common/middlewares/request-id.middleware/request-id.middleware.middleware';
import { JwtModule, JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';
@Module({
  imports: [
    AuthModule,
    UserModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            ttl: config.get<number>('throttle.ttl', { infer: true }) ?? 60,
            limit: config.get<number>('throttle.limit', { infer: true }) ?? 30,
          },
        ],
      }),
    }),
    PrismaModule,
    AddressModule,
    UserRoleModule,
    UserSessionModule,

  ],
  controllers: [AppController],
  providers: [
    AppService,
    ApplicationLogger,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
