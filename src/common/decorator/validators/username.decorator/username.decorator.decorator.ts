import { applyDecorators } from '@nestjs/common';
import { IsString, MinLength, MaxLength } from 'class-validator';

export function IsUsername() {
  return applyDecorators(
    IsString({ message: 'Tên đăng nhập không hợp lệ' }),
    MinLength(6, { message: 'Tên đăng nhập phải có ít nhất 6 ký tự' }),
    MaxLength(49, { message: 'Tên đăng nhập có độ dài tối đa 49 ký tự' }),
  );
}
