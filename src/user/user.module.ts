import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // ✅ DB 엔티티 등록
  controllers: [UserController],             // ✅ 라우팅 담당
  providers: [UserService],                  // ✅ 서비스(비즈니스 로직)
  exports: [UserService],                    // ✅ 다른 모듈에서 사용 가능
})
export class UserModule {}