import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { IsPassword } from 'src/common/decorator/validators/password.decorator/password.decorator.decorator';
import { IsUsername } from 'src/common/decorator/validators/username.decorator/username.decorator.decorator';
import { normalizeString } from 'src/common/utils/str.util';

export class RegisterAuthDTO {
  @IsUsername()
  username: string;

  @Transform(({ value }) => normalizeString(value))
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsPassword()
  password: string;

  @Transform(({ value }) => normalizeString(value))
  @IsString({ message: 'Xác nhận mật khẩu không hợp lệ' })
  @IsNotEmpty({ message: 'Không được bỏ trống trường xác nhận mật khẩu' })
  @MinLength(8, { message: 'Xác nhận mật khẩu phải dài hơn 8 ký tự' })
  confirmPassword: string;

  @Transform(({ value }) => normalizeString(value))
  @IsString({ message: 'Tên người dùng không hợp lệ' })
  @MinLength(3, { message: 'Tên người dùng phải chứa ít nhất 3 ký tự' })
  @IsOptional()
  fullName: string;
}
