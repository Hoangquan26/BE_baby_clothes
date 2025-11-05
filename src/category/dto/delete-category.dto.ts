import { IsNotEmpty, IsNumber } from "class-validator";

export class DeleteCategoryDTO {
    @IsNumber()
    @IsNotEmpty({message: 'ID danh mục không được để trống'})
    categoryId: number;
}