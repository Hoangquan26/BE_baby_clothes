import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';
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
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUsername()
  username: string;

  @IsPassword()
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
