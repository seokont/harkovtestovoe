import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateEntryDto {
  @IsString()
  @Matches(/^[A-Za-z0-9]+$/, {
    message: 'User Name must contain only Latin letters and digits',
  })
  userName: string;

  @IsEmail({}, { message: 'E-mail has invalid format' })
  email: string;

  @IsOptional()
  @IsUrl({}, { message: 'Home page has invalid URL format' })
  homePage?: string;

  @IsString()
  captchaId: string;

  @IsString()
  @MinLength(1)
  captchaAnswer: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20000)
  text: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsString()
  imagePath?: string;

  @IsOptional()
  @IsString()
  textFilePath?: string;
}
