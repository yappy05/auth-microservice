import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer'
import { ConfigService } from '@nestjs/config';
import { emailConfig, EmailConfig } from '../config/email.config';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { SendWelcomeRequest } from '@backend/shared-dto';


@Injectable()
export class AppService {
  private transport: nodemailer.Transporter;
  constructor(private readonly configService: ConfigService) {
    const emailConfig = this.configService.getOrThrow<EmailConfig>('email')
    console.log(this.configService.getOrThrow<string>('email.defaults.from'))
    this.transport = nodemailer.createTransport({
      service: emailConfig.transport.service,
      auth: {
        user: emailConfig.transport.auth.user,
        pass: emailConfig.transport.auth.pass,
      },
    })

    this.verifyConnection()
  }

  private async verifyConnection () {
    try {
      await this.transport.verify()
    } catch (e) {
      console.log('не удалось подключить nodemailer, ', e)
    }
  }

  public async sendEmail (to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transport.sendMail({
        from: this.configService.getOrThrow<string>('email.defaults.from'),
        subject,
        to,
        html
      })
    } catch (e) {
      throw new RpcException({
        code: status.INTERNAL,
        message: 'не удалось отправить email'
      })
    }
  }

  public async sendWelcomeEmail (payload: SendWelcomeRequest) {
    const {name, email} = payload
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Добро пожаловать, ${name}! 👋</h1>
        <p>Спасибо за регистрацию в нашем приложении.</p>
        <p>Мы рады видеть вас в нашем сообществе!</p>
        <br>
        <p>С уважением,<br>Команда My App</p>
      </div>
    `;
    await this.sendEmail(email, 'Добро пожаловать!', html)
  }


  getData(): { message: string } {
    return { message: 'Hello API' };
  }
}
