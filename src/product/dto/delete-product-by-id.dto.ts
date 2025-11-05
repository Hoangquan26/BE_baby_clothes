import { IsNotEmpty, IsString } from "class-validator";

export class DeleteProductById {
    @IsString()
    @IsNotEmpty()
    productId: string;
}