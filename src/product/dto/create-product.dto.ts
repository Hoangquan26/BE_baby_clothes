import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";
import { normalizeString } from "src/common/utils/str.util";

export class CreateProductDTO {
    @Transform(({ value }) => normalizeString(value))
    @IsString()
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @MinLength(3, { message: 'Tên sản phẩm phải có ít nhất 3 ký tự' })
    @MaxLength(255, { message: 'Slug sản phẩm không được vượt quá 255 ký tự' })
    name: string;

    @Transform(({ value }) => normalizeString(value))
    @IsString()
    @IsNotEmpty()
    @MinLength(3, { message: 'Tên sản phẩm phải có ít nhất 3 ký tự' })
    @MaxLength(255, { message: 'Slug sản phẩm không được vượt quá 255 ký tự' })
    description: string

    @IsString()
    @MaxLength(128, { message: 'Thương hiệu không được vượt quá 128 ký tự' })
    @MinLength(2, { message: 'Thương hiệu phải có ít nhất 2 ký tự' })
    @IsOptional()
    brand?: string;

    @IsNumber()
    @Min(1)
    @IsNotEmpty({ message: 'Vui lòng chọn danh mục cho sản phẩm' })
    categoryId: number;

    @IsString()
    @MaxLength(255, { message: 'Phụ đề sản phẩm không được vượt quá 255 ký tự' })
    @IsOptional()
    subtitle?: string;

    @IsOptional()
    @IsBoolean()
    isPublished?: boolean = false;
}