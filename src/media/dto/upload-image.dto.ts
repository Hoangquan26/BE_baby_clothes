import { IsOptional, IsString } from "class-validator";

export class UploadImageDTO {
    @IsString()
    @IsOptional()
    altText?: string;
    @IsString()
    @IsOptional()
    mimeType?: string;
    @IsString()
    @IsOptional()
    width?: number;
    @IsString()
    @IsOptional()
    height?: number;
}