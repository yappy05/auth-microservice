import { Controller, Get, Inject, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import {
  ConfirmVerification,
  LoginDto,
  RegisterDto,
  SendEmailRequest,
  SendWelcomeRequest,
  TokensResponse
} from '@backend/shared-dto';
import { ConfigService } from '@nestjs/config';



@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    @Inject('email_client') private readonly emailClient: ClientProxy,

  ) {}

  @MessagePattern('find-user-by-id')
  async handleFindUserById(@Payload() userId: string) {
    return await this.appService.findById(userId)
  }


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

  @MessagePattern('send-verify')
  async handle(@Payload() userId: string) {
      // const user = await this.appService.findById(userId);
      // const payload: SendEmailRequest = {email: user.email, name: user.name};
      // await this.
      // const code = 123456
      const payload = await this.appService.sendVerifyCode(userId)
      this.emailClient.emit('send-verify', payload);
      return {status: 'verify'}
  }

  @MessagePattern('confirm-verification')
  async handleVerify(@Payload() payload: ConfirmVerification) {
     await this.appService.confirmVerification(payload)
    return true
  }



}
