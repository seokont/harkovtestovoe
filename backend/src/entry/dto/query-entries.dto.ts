import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export type SortBy = 'createdAt' | 'userName' | 'email';
export type SortOrder = 'ASC' | 'DESC';

export class QueryEntriesDto {
  @IsOptional()
  @IsIn(['createdAt', 'userName', 'email'])
  sortBy?: SortBy = 'createdAt';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: SortOrder = 'DESC';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 25;
}
