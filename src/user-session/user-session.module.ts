import { Module } from '@nestjs/common';
import { SessionService } from './user-session.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [SessionService],
  exports: [SessionService],
  imports: [PrismaModule],
})
export class UserSessionModule {}
