import { IsEmail, IsString, Min, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @MinLength(4)
  userid: string;

  @IsString()
  @MinLength(8)
  password: string;
}
