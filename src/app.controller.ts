import { All, Body, Controller, Delete, Get, MethodNotAllowedException, Patch, Post, Put, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateUserDto } from './user/dto/create-user.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getUser() {
    return this.appService.getUser();
  }

}
