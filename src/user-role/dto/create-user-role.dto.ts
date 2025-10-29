import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { UserRoleIDS } from '../user-role.constant';

export class CreateUserRoleDTO {
  @IsString()
  @IsNotEmpty({ message: 'Chưa set user' })
  userId: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Chưa set role' })
  @IsEnum(UserRoleIDS, { message: 'Role không hợp lệ' })
  roleId: number;
}
