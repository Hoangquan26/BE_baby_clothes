import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [PermissionService],
  imports: [PrismaModule],
})
export class PermissionModule {}
