import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { IsUsername } from 'src/common/decorator/validators/username.decorator/username.decorator.decorator';

export class GetUserInfoDTO {
  @ApiProperty({ description: 'User identifier (subject claim).' })
  @IsString({ message: 'Subject must be a string.' })
  @MinLength(1, { message: 'Subject cannot be empty.' })
  sub: string;

  @ApiProperty({ description: 'Username of the authenticated user.' })
  @IsUsername()
  username: string;
}
