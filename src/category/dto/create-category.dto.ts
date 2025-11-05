import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { normalize } from "path";

export class CreateCategoryDTO {
    @Transform(({ value }) => normalize(value))
    @IsString()
    @IsNotEmpty({ message: 'Tên không được để trống' })
    name: string;
    @IsNumber()
    @IsOptional()
    parentId?: number;

    @IsBoolean()
    isActive: boolean = false;

    @Transform(({ value }) => normalize(value))
    @IsString()
    @MinLength(10, { message: 'Mô tả phải có ít nhất 10 ký tự' })
    @MaxLength(244, { message: 'Mô tả không được vượt quá 500 ký tự' })
    @IsOptional()
    description?: string;
}