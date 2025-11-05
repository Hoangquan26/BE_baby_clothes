import { Body, Controller, UploadedFile } from '@nestjs/common';
import { MediaService } from './media.service';
import { UploadImageDTO } from './dto/upload-image.dto';

@Controller('media')
export class MediaController {
    constructor(private mediaService: MediaService){}

    async uploadImage(
        @UploadedFile( ) file: Express.Multer.File,
        @Body() body: UploadImageDTO
    ) {
        return await this.mediaService.uploadImage(body)
    }
}
