import { ApiProperty } from '@nestjs/swagger';

export class SafeUserDto {
  @ApiProperty({ description: 'User identifier.', example: 'clwxyz1234567890abcdefghi' })
  id: string;

  @ApiProperty({ description: 'Primary email address of the user.' })
  email: string;

  @ApiProperty({ description: 'Unique username of the user.', nullable: true })
  username: string | null;

  @ApiProperty({ description: 'Full display name of the user.', nullable: true })
  fullName: string | null;

  @ApiProperty({ description: 'Whether the user account is active.' })
  isActive: boolean;

  @ApiProperty({ description: 'Timestamp when the user was created.', type: String, format: 'date-time' })
  createdAt: string;

  @ApiProperty({ description: 'Timestamp when the user was last updated.', type: String, format: 'date-time' })
  updatedAt: string;
}
