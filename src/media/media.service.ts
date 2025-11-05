import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadImageDTO } from './dto/upload-image.dto';

@Injectable()
export class MediaService {
    constructor(private prisma: PrismaService) {}

    async uploadImage(dto: UploadImageDTO) {
        
    }
}
