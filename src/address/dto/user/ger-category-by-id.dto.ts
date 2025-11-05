import { IsNotEmpty, IsNumber } from "class-validator";

export class GetCategoryByIdDTO {
    @IsNumber()
    @IsNotEmpty({message: 'ID không được bỏ trống'})
    categoryId: number;
}