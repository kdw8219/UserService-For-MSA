import { Controller, Delete, Get, Patch, Post, Put, Param, Body, Res } from "@nestjs/common";
import { UpdateDateColumn } from "typeorm";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { User } from "./entities/user.entity";
import { ExternalApiService } from "./external_comm.service";

@Controller('api/users')
export class UserController {
    constructor(private readonly userService: UserService, private readonly externalComService:ExternalApiService) {}

    @Get(':id')
    async getUsers(@Param('id') id: string): Promise<User> {
        const user = await this.userService.getUsers(+id);
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
    async getUser(@Body() userDto:LoginUserDto, @Res() res: Response) {
        //db 레벨에서 not found 리턴할 것.
        const user = await this.userService.checkUser(userDto);

        //user는 이 시점에 정상으로 조회가 된 것.
        

        return res;
    }

    @Put()
    updateUser(): string {
        return "User updated";
    }

    @Delete()
    deleteUser(): string {
        return "User deleted";
    }

    @Patch()
    patchUser(): string {
        return "User patched";
    }
}