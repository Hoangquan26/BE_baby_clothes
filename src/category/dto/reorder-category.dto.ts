import { IsNotEmpty, IsNumber, Min } from "class-validator";

export class ReorderCategoryDTO {

    @IsNumber()
    @IsNotEmpty({message: 'Vị trí không được bỏ trống'})
    @Min(1, {message: 'Vị trí phải là số dương'})
    position: number;
}