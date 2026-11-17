import { IsEmail, IsOptional, IsString, IsUrl, Matches } from 'class-validator';

export class CreateUserDto {
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
}
