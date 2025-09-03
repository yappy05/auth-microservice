import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { RegisterDto, UserResponse } from '@backend/shared-dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(@Inject('auth_service') private readonly authClient: ClientProxy) {
  }

  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  async register(dto: RegisterDto) {
    try {
      return await firstValueFrom(await this.authClient.send('register', dto))
    } catch (error) {
      if (error instanceof RpcException) {
        throw new ConflictException(error.message)
      }
      throw error
    }
  }

  // async findUser(userId: string): Promise<UserResponse> {
  //   const user = await firstValueFrom( this.authClient.send('find-user-by-id', userId))
  //   console.log(user)
  //   return user
  // }
}
