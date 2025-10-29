import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { User } from 'generated/prisma';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  refreshToken: string;

  user: Partial<User>
}
