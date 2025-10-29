import { BadRequestException, Injectable, NotFoundException, InternalServerErrorException, ConflictException, UnauthorizedException } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm"
import { User } from "./entities/user.entity"
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import * as bcrypt from "bcrypt"

@Injectable()
export class UserService {
    constructor (
        @InjectRepository(User)
        private userRepository:Repository<User>
    ){}

    async getUsers(primaryId: bigint): Promise<User> {
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
                throw new ConflictException('Email already exists');
            }
            if (existing.userId === dto.userid) {
                throw new ConflictException('Name already exists');
            }
        }
        //do password hash...
        const hashed = await bcrypt.hash(dto.password, 10)

        const user = this.userRepository.create({
            userId: dto.userid,
            email: dto.email,
            password: hashed,
            role: dto.role
        });

        return this.userRepository.save(user);
    }

    async checkUser(dto: LoginUserDto): Promise<User> {
        try {
            const user = await this.userRepository.findOne({ where: { userId: dto.userid } });
            if (!user) throw new NotFoundException('User not found');

            const match = await bcrypt.compare(dto.password, user.password);
            if (!match) throw new NotFoundException('Password mismatch');

            return user;
        }
        catch(err) {
            // 이미 NotFoundException이면 그대로 전파
            if (err instanceof NotFoundException) {
                throw new UnauthorizedException('Unauthorized User');
            }
            // DB 에러 등 다른 에러는 InternalServerErrorException으로 변환
            throw new InternalServerErrorException('Failed to fetch user');
        }
    }

    async delete(primaryId: bigint): Promise<boolean> {

        try {
            const user = await this.userRepository.delete({
                id: primaryId
            });
        } catch(err) {
            if( err instanceof NotFoundException) {
                return true; // 없어서 못지우는 경우는 패스
            }
            else {
                return false;
            }
        }

        return true;
    }

}