import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';
import { IsUsername } from 'src/common/decorator/validators/username.decorator/username.decorator.decorator';
import { normalizeString } from 'src/common/utils/str.util';

export class FindUserByBothEmailAndUsername {
  @Transform(({ value }) => normalizeString(value))
  @IsString({ message: 'Email không hợp lệ' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsUsername()
  username: string;
}
