import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class MediaPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const maxSize = 10 * 1024
    return value.size < maxSize;
  }
}
