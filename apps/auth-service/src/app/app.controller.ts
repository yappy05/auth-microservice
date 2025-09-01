import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterDto } from '@backend/shared-dto';



@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}


  @MessagePattern('register')
  handleRegisterAuth(@Payload() dto: RegisterDto) {
    console.log(dto)
    return this.appService.register(dto)
  }
}
