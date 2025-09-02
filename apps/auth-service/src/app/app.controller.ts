import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginDto, RegisterDto, TokensResponse } from '@backend/shared-dto';
import {Response} from 'express';
import { AuthGuard } from '@nestjs/passport';


@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}


  @MessagePattern('register')
  async handleRegisterAuth(@Payload() dto: RegisterDto) {
    return await this.appService.register(dto)
  }
  @MessagePattern('login')
  async handleLoginAuth(@Payload() dto: LoginDto): Promise<TokensResponse>{
    console.log('start login')
    return await this.appService.login(dto)
  }
  @MessagePattern('logout')
  handleLogoutAuth(@Payload() userId: string) {
    this.appService.logout(userId)
  }

}
