import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  refreshToken: string;
}
