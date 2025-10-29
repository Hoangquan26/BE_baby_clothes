import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsPassword } from 'src/common/decorator/validators/password.decorator/password.decorator.decorator';
import { IsUsername } from 'src/common/decorator/validators/username.decorator/username.decorator.decorator';
import { normalizeString } from 'src/common/utils/str.util';

export class RegisterAuthDTO {
  @ApiProperty({
    description: 'Unique username for the account.',
    example: 'john.doe',
  })
  @IsUsername()
  username: string;

  @ApiProperty({
    description: 'Email address used for the account.',
    example: 'john@example.com',
  })
  @Transform(({ value }) => normalizeString(value))
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({
    description: 'Strong password for the account.',
    example: 'P@ssw0rd1!',
  })
  @IsPassword()
  password: string;

  @ApiProperty({
    description: 'Repeat the password for confirmation.',
    example: 'P@ssw0rd1!',
  })
  @Transform(({ value }) => normalizeString(value))
  @IsString({ message: 'Xác nhận mật khẩu không hợp lệ' })
  @IsNotEmpty({ message: 'Không được bỏ trống trường xác nhận mật khẩu' })
  @MinLength(8, { message: 'Xác nhận mật khẩu phải dài hơn 8 ký tự' })
  confirmPassword: string;

  @ApiPropertyOptional({
    description: 'Display name of the user.',
    example: 'John Doe',
  })
  @Transform(({ value }) => normalizeString(value))
  @IsString({ message: 'Tên người dùng không hợp lệ' })
  @MinLength(3, { message: 'Tên người dùng phải chứa ít nhất 3 ký tự' })
  @IsOptional()
  fullName: string;
}
