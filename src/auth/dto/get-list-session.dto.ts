import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetListSessionDTO {
  @ApiProperty({ description: 'Identifier of the user whose sessions will be fetched.' })
  @IsString({ message: 'User id must be a string.' })
  @IsNotEmpty({ message: 'User id is required.' })
  userId: string;
}
