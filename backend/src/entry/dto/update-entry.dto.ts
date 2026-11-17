import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateEntryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20000)
  text?: string;
}
