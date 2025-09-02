import { Controller, Get, Inject, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { LoginDto, RegisterDto, SendEmailRequest, SendWelcomeRequest, TokensResponse } from '@backend/shared-dto';
import { ConfigService } from '@nestjs/config';
import * as process from 'node:process';


@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    @Inject('email_client') private readonly emailClient: ClientProxy
  ) {}


  @MessagePattern('register')
  async handleRegisterAuth(@Payload() dto: RegisterDto) {
    const payload: SendEmailRequest = {name: dto.name, email: dto.email}
    this.emailClient.emit('send-welcome', payload)
    return await this.appService.register(dto)
  }
  @MessagePattern('login')
  async handleLoginAuth(@Payload() dto: LoginDto): Promise<TokensResponse>{
    const payload: SendEmailRequest = {email: dto.email}
    this.emailClient.emit('send-welcome-back', payload)
    return await this.appService.login(dto)
  }
  @MessagePattern('logout')
  handleLogoutAuth(@Payload() userId: string) {
    this.appService.logout(userId)
  }

}
