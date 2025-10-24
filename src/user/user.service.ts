import { BadRequestException, Injectable, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm"
import { User } from "./entities/user.entity"
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt"
import * as crypto from 'crypto';  // or const crypto = require('crypto');


@Injectable()
export class UserService {
    constructor (
        @InjectRepository(User)
        private userRepository:Repository<User>
    ){}

    async getUsers(primaryId: number): Promise<User> {
        try {
            const user = await this.userRepository.findOne({where: {id: primaryId}});
            if (!user) {
                throw new NotFoundException(`User with ID ${primaryId} not found`);
            }
            return user;
        }
        catch(err) {
            // 이미 NotFoundException이면 그대로 전파
            if (err instanceof NotFoundException) {
                throw err;
            }
            // DB 에러 등 다른 에러는 InternalServerErrorException으로 변환
            throw new InternalServerErrorException('Failed to fetch user');
        }
    }

    async create(dto: CreateUserDto): Promise<User> {
        
        const existing = await this.userRepository.findOne({
            where:[
                { email: dto.email },
                { userId: dto.userid }
            ],
        });
        
        if (existing) {
            if (existing.email === dto.email) {
                throw new BadRequestException('Email already exists');
            }
            if (existing.userId === dto.userid) {
                throw new BadRequestException('Name already exists');
            }
        }

        //do password hash...
        const hashed = await bcrypt.hash(dto.password, 10)

        const user = this.userRepository.create({
            userId: dto.userid,
            email: dto.email,
            password: hashed,
            role: await this.convertRoleStringToInt(dto.role)
        });

        return this.userRepository.save(user);
    }

    async convertRoleStringToInt(role:string): Promise<number> {

        switch(role) {
            case 'admin':
                return 1;
            case 'operator':
                return 2;
            case 'monitor':
                return 3;
            default:
                return -1;
        }
    }

}