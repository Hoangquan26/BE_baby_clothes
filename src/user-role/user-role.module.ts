import { Module } from '@nestjs/common';
import { UserRoleService } from './user-role.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [UserRoleService],
  exports: [UserRoleService],
  imports: [
    PrismaModule
  ]
})
export class UserRoleModule {}
