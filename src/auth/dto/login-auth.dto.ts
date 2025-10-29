import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsPassword } from 'src/common/decorator/validators/password.decorator/password.decorator.decorator';
import { IsUsername } from 'src/common/decorator/validators/username.decorator/username.decorator.decorator';

const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no', 'off'].includes(normalized)) {
      return false;
    }
  }

  return Boolean(value);
};

export class LoginAuthDTO {
  @ApiProperty({
    description: 'Username or email used for authentication.',
    example: 'john.doe',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUsername()
  username: string;

  @ApiProperty({
    description: 'User password.',
    example: 'P@ssw0rd1!',
  })
  @IsPassword()
  password: string;

  @ApiProperty({
    description:
      'Enable to receive refresh token & persist the session (remember me).',
    example: true,
    default: false,
    required: false,
  })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return false;
    }
    return toBoolean(value);
  })
  @IsBoolean({ message: 'Remember me must be boolean.' })
  rememberMe: boolean = false;
}

