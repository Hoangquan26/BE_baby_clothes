import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [MediaService],
  imports: [PrismaModule],
  controllers: [MediaController]
})
export class MediaModule { }
