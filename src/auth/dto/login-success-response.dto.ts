import { ApiProperty } from '@nestjs/swagger';

export class LoginUserInfoDto {
  @ApiProperty({ description: 'Unique identifier of the user (sub claim).' })
  sub: string;

  @ApiProperty({ description: 'Unique username of the user.', nullable: true })
  username: string | null;

  @ApiProperty({ description: 'Primary email of the user.' })
  email: string;

  @ApiProperty({ description: 'Full name if provided.', nullable: true })
  fullName?: string | null;

  @ApiProperty({ description: 'Timestamp of the last login if available.', nullable: true, type: String, format: 'date-time' })
  lastLoginAt: string | null;
}

export class LoginSuccessResponseDto {
  @ApiProperty({ example: 'Bearer' })
  tokenType: 'Bearer';

  @ApiProperty({ description: 'Short lived access token used for Bearer auth.' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh token issued when rememberMe=true.', nullable: true })
  refreshToken?: string;

  @ApiProperty({ description: 'Access token TTL (matches JWT exp).', example: '3600s' })
  expiresIn: string | number;

  @ApiProperty({ description: 'Refresh token TTL.', nullable: true, example: '86400s' })
  refreshTokenExpiresIn?: string | number;

  @ApiProperty({ description: 'Session identifier used to manage refresh token rotation.', nullable: true })
  sessionId?: string;

  @ApiProperty({ description: 'Expiration timestamp of the refresh session.', nullable: true, type: String, format: 'date-time' })
  sessionExpiresAt?: string;

  @ApiProperty({ type: LoginUserInfoDto })
  user: LoginUserInfoDto;
}
