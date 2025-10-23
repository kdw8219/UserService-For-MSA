import { Controller, Delete, Get, Patch, Post, Put, Param, Body } from "@nestjs/common";
import { UpdateDateColumn } from "typeorm";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "./entities/user.entity";

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(':id')
    async getUsers(@Param('id') id: string): Promise<User> {
        return await this.userService.getUsers(+id);
    }

    @Post()
    async createUser(@Body() userDto:CreateUserDto): Promise<User> {
        return await this.userService.create(userDto);
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