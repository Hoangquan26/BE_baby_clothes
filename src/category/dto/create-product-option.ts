import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";
import { normalizeString } from "src/common/utils/str.util";

export class CreateProductOptionDTO {
    @Transform(({ value }) => normalizeString(value))
    @IsString()
    @IsNotEmpty({message: 'Tên option không được để trống'})
    name: string;
}