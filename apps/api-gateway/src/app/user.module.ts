import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserService } from './user.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'auth_service',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'],
          queue: 'auth_queue',
          queueOptions: {
            durable: true
          }
        }
      }
    ])
  ],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
