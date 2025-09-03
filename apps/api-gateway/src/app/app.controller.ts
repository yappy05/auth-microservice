import { Body, ConflictException, Controller, Get, Inject, Post, Res, UseFilters, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { ConfirmVerification, LoginDto, RegisterDto, TokensResponse } from '@backend/shared-dto';
import { firstValueFrom } from 'rxjs';
import { AllExceptionsFilter } from './rpc-exception.filter';
import {Response} from 'express';
import { AuthGuard } from '@nestjs/passport';


@Controller()
@UseFilters(AllExceptionsFilter)
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('auth_service') private readonly authClient: ClientProxy
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getData() {
    return this.appService.getData();
  }

  // @Post('auth/find-by-id')
  // async findUserById (@Body('userId') userId: string) {
  //   return await this.appService.findUser(userId)
  // }

  @Post('auth/register')
  async register(@Res({passthrough: true}) res: Response, @Body() dto: RegisterDto) {
    console.log('gtaway-service')
    const response: TokensResponse = await firstValueFrom(this.authClient.send('register', dto));
    // return response
    const {refreshToken} = response;
    res.cookie('refreshToken', refreshToken, {
      secure: false,
      httpOnly: false,
      sameSite: 'lax'
    })
    return response
  }

  @Post('auth/login')
  async login (@Res({passthrough: true}) res: Response,@Body() dto: LoginDto): Promise<TokensResponse> {
    const response: TokensResponse = await firstValueFrom(this.authClient.send('login', dto));
    const {refreshToken} = response;
    res.cookie('refreshToken', refreshToken, {
      secure: false,
      httpOnly: false,
      sameSite: 'lax'
    })
    console.log(response)
    return response
  }

  @Post('auth/logout')
  logout (@Res({passthrough: true}) res: Response, @Body('userId') userId: string) {
    this.authClient.emit('logout', userId)
    res.clearCookie('refreshToken')
  }

  @Post('auth/send-verify')
  async sendVerifyCode(@Body('userId') userId: string){
    await firstValueFrom(this.authClient.send('send-verify', userId))
  }

  @Post('auth/confirm-verification')
  async verify(@Body() payload: ConfirmVerification) {
    await firstValueFrom(this.authClient.send('confirm-verification', payload))
  }
}
