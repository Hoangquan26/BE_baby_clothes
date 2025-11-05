import { IsBoolean } from "class-validator";

export class getAllCategoryDTO {
    @IsBoolean()
    isActive?: boolean;
}