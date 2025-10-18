import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { normalizeString } from 'src/common/utils/str.util';


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
  @Transform(({ value }) => normalizeString(value))
  @IsString({ message: 'Tên đăng nhập không hợp lệ' })
  @IsNotEmpty({ message: 'Không được bỏ trống trường tên đăng nhập' })
  @MinLength(6, { message: 'Tên đăng nhập phải dài hơn 6 ký tự' })
  username: string;

  @Transform(({ value }) => normalizeString(value))
  @IsString({ message: 'Mật khẩu không hợp lệ' })
  @IsNotEmpty({ message: 'Không được bỏ trống trường mật khẩu' })
  @MinLength(8, { message: 'Mật khẩu phải dài hơn 8 ký tự' })
  password: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return false;
    }
    return toBoolean(value);
  })
  @IsBoolean({ message: 'Trường ghi nhớ đăng nhập chứa giá trị không hợp lệ' })
  rememberMe: boolean = false;
}
