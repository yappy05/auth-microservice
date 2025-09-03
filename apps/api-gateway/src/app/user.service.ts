import { Inject, Injectable, Module } from '@nestjs/common';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { UserResponse } from '@backend/shared-dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserService {
  constructor(
    @Inject('auth_service') private readonly authClient: ClientProxy
  ) {}

  async findUser(userId: string): Promise<UserResponse> {
    const user = await firstValueFrom(
      this.authClient.send('find-user-by-id', userId)
    );
    console.log(user);
    return user;
  }
}

