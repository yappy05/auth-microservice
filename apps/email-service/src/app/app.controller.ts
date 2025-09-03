import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SendEmailRequest, SendWelcomeRequest } from '@backend/shared-dto';
import { HtmlWelcomeBack } from '../assets/html-text';
import { HtmlVerify } from '../assets/html-verify';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @MessagePattern('send-welcome')
  async sendWelcome(@Payload() payload: SendWelcomeRequest) {
    await this.appService.sendWelcomeEmail(payload)
  }
  @MessagePattern('send-welcome-back')
  async sendWelcomeBack(@Payload() payload: SendEmailRequest) {
    await this.appService.sendEmail(payload.email,'Добро пожаловать обратно', HtmlWelcomeBack);
  }
  @MessagePattern('send-verify')
  async senVerifyCode(@Payload() payload: SendEmailRequest) {
    console.log('email-service')
    console.log(payload)
    await this.appService.sendEmail(payload.email, "Код подверждения", HtmlVerify(payload.verifyCode))
  }
}
