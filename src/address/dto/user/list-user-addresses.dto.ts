import { IsNotEmpty, IsString } from 'class-validator';

export class ListUserAddressesDTO {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
