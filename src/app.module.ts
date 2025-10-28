import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { DbService } from './common/db/db.service';
import configuration from './config/configuration';
import { ApplicationLogger } from './common/logger/logger';
import { PrismaModule } from './prisma/prisma.module';
@Module({
  imports: [AuthModule, UserModule, ConfigModule.forRoot({
    load: [configuration],
    isGlobal: true,
    envFilePath: ['.env']
  }), PrismaModule],
  controllers: [AppController],
  providers: [AppService, DbService, ApplicationLogger],
})
export class AppModule {}
