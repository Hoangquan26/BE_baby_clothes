import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { normalizeString } from 'src/common/utils/str.util';

export class RegisterAuthDTO {
  @Transform(({ value }) => normalizeString(value))
  @IsString({ message: 'Tên đăng nhập không hợp lệ' })
  @IsNotEmpty({ message: 'Không được bỏ trống trường tên đăng nhập' })
  @MinLength(6, { message: 'Tên đăng nhập phải dài hơn 6 ký tự' })
  username: string;

  @Transform(({ value }) => normalizeString(value))
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @Transform(({ value }) => normalizeString(value))
  @IsString({ message: 'Mật khẩu không hợp lệ' })
  @IsNotEmpty({ message: 'Không được bỏ trống trường mật khẩu' })
  @MinLength(8, { message: 'Mật khẩu phải dài hơn 8 ký tự' })
  password: string;

  @Transform(({ value }) => normalizeString(value))
  @IsString({ message: 'Xác nhận mật khẩu không hợp lệ' })
  @IsNotEmpty({ message: 'Không được bỏ trống trường xác nhận mật khẩu' })
  @MinLength(8, { message: 'Xác nhận mật khẩu phải dài hơn 8 ký tự' })
  confirmPassword: string;
}
