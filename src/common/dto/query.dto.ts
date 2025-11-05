import { IsNumber, IsString } from "class-validator";

export class QueryDTO {
  @IsNumber()
  limit: number = 10;
  @IsString()
  query: string = "";
  @IsNumber()
  page: number = 1;
  @IsString()
  sort: string = 'createdAt';
  @IsString()
  order: 'asc' | 'desc' = 'asc';
}
