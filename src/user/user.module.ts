import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserRoleModule } from 'src/user-role/user-role.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    PrismaModule,
    UserRoleModule
  ],
  exports: [UserService]
})
export class UserModule {}
