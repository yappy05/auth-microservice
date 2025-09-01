import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, @Inject('auth_service') private readonly authClient: ClientProxy) {
  }

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Post('auth')
  testAuth(@Body() data: any) {
    console.log(data)
    this.authClient.emit('register', data)
  }

}
