import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/user/entities/user.entity';
import { CreateUserDto } from '../src/user/dto/create-user.dto';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let createdUserId: number;

  // 테스트용 사용자 데이터
  const testUser: CreateUserDto = {
    userid: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: 'operator'
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        // 테스트용 DB 설정 (실제 DB와 분리)
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: '1234',
          database: 'testdb_e2e', // 테스트용 별도 DB
          entities: [User],
          synchronize: true, // 테스트 DB 자동 스키마 동기화
          dropSchema: true // 매 테스트마다 스키마 초기화
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/user', () => {
    it('POST / - should create new user', () => {
      return request(app.getHttpServer())
        .post('/user')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.userId).toBe(testUser.userid);
          expect(res.body.email).toBe(testUser.email);
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
          // 생성된 사용자의 ID 저장 (다음 테스트에서 사용)
          createdUserId = res.body.id;
        });
    });

    it('POST / - should prevent duplicate email', () => {
      return request(app.getHttpServer())
        .post('/user')
        .send({
          ...testUser,
          userid: 'different_user' // 다른 userId로 시도
        })
        .expect(400) // BadRequestException
        .expect((res) => {
          expect(res.body.message).toBe('Email already exists');
        });
    });

    it('POST / - should prevent duplicate userId', () => {
      return request(app.getHttpServer())
        .post('/user')
        .send({
          ...testUser,
          email: 'different@example.com' // 다른 이메일로 시도
        })
        .expect(400) // BadRequestException
        .expect((res) => {
          expect(res.body.message).toBe('Name already exists');
        });
    });

    it('GET /:id - should retrieve created user', () => {
      return request(app.getHttpServer())
        .get(`/user/${createdUserId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdUserId);
          expect(res.body.userId).toBe(testUser.userid);
          expect(res.body.email).toBe(testUser.email);
          expect(res.body.role).toBe(2); // operator role
        });
    });

    it('GET /:id - should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/user/99999')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('not found');
        });
    });
  });
});