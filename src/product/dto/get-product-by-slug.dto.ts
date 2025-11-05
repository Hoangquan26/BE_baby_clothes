import { IsNotEmpty, IsString } from "class-validator";

export class GetProductBySlugDTO {
    @IsString()
    @IsNotEmpty()
    slug: string;
}