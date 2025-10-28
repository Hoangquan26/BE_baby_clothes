import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { normalizeString } from 'src/common/utils/str.util';

export function IsPassword() {
  return applyDecorators(
    Transform(({ value }) => normalizeString(value)),
    IsString({ message: 'Mật khẩu không hợp lệ' }),
    IsNotEmpty({ message: 'Không được bỏ trống trường mật khẩu' }),
    MinLength(8, { message: 'Mật khẩu phải dài hơn 8 ký tự' }),
  );
}
