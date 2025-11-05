import { IsNotEmpty, IsString } from "class-validator";

export class GetAdminProductByIdDTO {
    @IsString()
    @IsNotEmpty()
    productId: string
}