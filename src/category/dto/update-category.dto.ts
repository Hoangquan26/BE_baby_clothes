import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsNumber, isNumber, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";
import { normalize } from "path";

export class UpdateCategoryDTO {
    @Transform(({ value }) => normalize(value))
    @IsString()
    @IsOptional()
    name?: string;

    @Transform(({ value }) => normalize(value))
    @IsString()
    @IsOptional()
    @MinLength(10, { message: 'Mô tả phải có ít nhất 10 ký tự' })
    @MaxLength(244, { message: 'Mô tả không được vượt quá 500 ký tự' })
    description?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsNumber()
    @IsOptional()
    @Min(1, { message: 'Vị trí phải là số nguyên dương' })
    position?: number;

    @IsNumber()
    @IsOptional()
    parentId?: number | null;   
}