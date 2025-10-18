import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { DbService } from './common/db/db.service';
import configuration from './config/configuration';
import { MyLoggerDev } from './common/logger/my.logger';
@Module({
  imports: [AuthModule, UserModule, ConfigModule.forRoot({
    load: [configuration],
    isGlobal: true,
    envFilePath: ['.env']
  })],
  controllers: [AppController],
  providers: [AppService, DbService, MyLoggerDev],
})
export class AppModule {}
