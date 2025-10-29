import { Controller, Delete, Get, Patch, Post, Put, Param, Body, Req, InternalServerErrorException } from "@nestjs/common";
import { UpdateDateColumn } from "typeorm";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { User } from "./entities/user.entity";
import { ExternalApiService } from "./external_comm.service";
import { LoginResponseDto } from "./dto/login-user-response.dto";
import { plainToInstance } from "class-transformer";

@Controller('api/users')
export class UserController {
    constructor(private readonly userService: UserService, private readonly externalComService:ExternalApiService) {}

    @Get(':id')
    async getUsers(@Param('id') id: string): Promise<User> {
        const user = await this.userService.getUsers(BigInt(id));
        const { password, ...safe } = user as any;
        return safe;
    }

    @Post('signup')
    async createUser(@Body() userDto:CreateUserDto): Promise<User> {
        const user = await this.userService.create(userDto);
        const {password, ...safe} = user as any;
        
        return safe;
    }
    @Post('login')
    async getUser(@Body() userDto:LoginUserDto): Promise<LoginResponseDto> {
        let createdUser;
        let tokens : {access_token: string, refresh_token:string };
        try {
            createdUser = await this.userService.checkUser(userDto);
            tokens = await this.externalComService.getInitialAuthFromExternal();
        }
        catch (err) {
            if(createdUser) {
                throw new InternalServerErrorException('Get authentication error. check auth service');
            }

            throw new InternalServerErrorException('Registration Failed.. check Auth Services');
        }

        const combined = {
            id: createdUser.id,
            userId: createdUser.userId,
            role : createdUser.role,
            access_token : tokens.access_token,
            refresh_token : tokens.refresh_token,
        };

        console.log(combined.id)
        console.log(combined.userId)
        console.log(combined.role)
        console.log(combined.access_token)
        console.log(combined.refresh_token)

        return plainToInstance(LoginResponseDto, combined, {excludeExtraneousValues: true});
    }

    @Put()
    updateUser(): string {
        return "User updated";
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: string, @Req() req: Request, isInternalReq: boolean = false, refreshToken: string = "") {
        let res = await this.userService.delete(BigInt(id));
        
        if(!res) {
            throw new InternalServerErrorException('Failed to delete user');
        }

        //auth 삭제 필요, refresh_token을 블랙리스트로
        if(isInternalReq == true) {
            let refresh:string = req.headers['cookie']
            ?.split('; ')
            .find(row => row.startwithn('refresh_token='))
            ?.split('=')[1];

            await this.externalComService.refreshTokenToBlacklist(refresh);
        }

        return { message: 'User deleted successfully' };
    }

    @Patch()
    patchUser(): string {
        return "User patched";
    }
}