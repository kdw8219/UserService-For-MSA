import { Expose, Exclude } from 'class-transformer';

export class LoginResponseDto {
  @Expose()
  id: bigint;
  
  @Expose()
  userId: string;
  
  @Expose()
  role: string;
  
  @Expose()
  access_token: string;
  
  @Expose()
  refresh_token: string;
}
