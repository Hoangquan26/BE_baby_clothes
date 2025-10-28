import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';
import { normalizeString } from 'src/common/utils/str.util';

export class FindUserByEmailDTO {
  @Transform(({ value }) => normalizeString(value))
  @IsString({ message: 'Email không hợp lệ' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;
}
