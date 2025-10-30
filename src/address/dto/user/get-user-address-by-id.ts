import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GetUserAddressByIdDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @IsNotEmpty()
  addressId: number;
}
