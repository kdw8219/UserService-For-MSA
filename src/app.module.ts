import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import * as crypto from 'crypto';
(global as any).crypto = crypto;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 전역 사용 가능
    }),

    TypeOrmModule.forRootAsync({
      useFactory: (configService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST') as string,
        port: configService.get('DB_PORT') as number,
        username: configService.get('DB_USER') as string,
        password: configService.get('DB_PASSWORD') as string,
        database: configService.get('DB_NAME') as string,
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [/* ConfigService */ ConfigService],
    }),
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
