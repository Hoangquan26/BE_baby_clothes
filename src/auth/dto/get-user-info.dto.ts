import { IsString, MinLength } from 'class-validator';
import { IsUsername } from 'src/common/decorator/validators/username.decorator/username.decorator.decorator';

export class GetUserInfoDTO {
  @IsString({ message: 'Sub không hợp lệ' })
  @MinLength(1, { message: 'Sub không được bỏ trống' })
  sub: string;

  @IsUsername()
  username: string;
}
