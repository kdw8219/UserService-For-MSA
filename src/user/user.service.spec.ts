import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return a user if found', async () => {
      const mockUser = {
        id: 1,
        userId: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUsers(1);
      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getUsers(1)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      userid: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'operator',
    };

    it('should create a new user successfully', async () => {
      const mockCreatedUser = {
        id: 1,
        userId: createUserDto.userid,
        email: createUserDto.email,
        password: 'hashedpassword',
        role: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockCreatedUser);
      mockRepository.save.mockResolvedValue(mockCreatedUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockCreatedUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: [
          { email: createUserDto.email },
          { userId: createUserDto.userid },
        ],
      });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when email already exists', async () => {
      const existingUser = {
        ...createUserDto,
        id: 1,
        email: createUserDto.email,
        userId: 'different-userid',
      };

      mockRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new BadRequestException('Email already exists'),
      );
    });

    it('should throw BadRequestException when userId already exists', async () => {
      const existingUser = {
        ...createUserDto,
        id: 1,
        email: 'different@example.com',
        userId: createUserDto.userid,
      };

      mockRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new BadRequestException('Name already exists'),
      );
    });
  });

  describe('convertRoleStringToInt', () => {
    it('should convert admin role correctly', async () => {
      const result = await service.convertRoleStringToInt('admin');
      expect(result).toBe(1);
    });

    it('should convert operator role correctly', async () => {
      const result = await service.convertRoleStringToInt('operator');
      expect(result).toBe(2);
    });

    it('should convert monitor role correctly', async () => {
      const result = await service.convertRoleStringToInt('monitor');
      expect(result).toBe(3);
    });

    it('should return -1 for invalid role', async () => {
      const result = await service.convertRoleStringToInt('invalid-role');
      expect(result).toBe(-1);
    });
  });
});