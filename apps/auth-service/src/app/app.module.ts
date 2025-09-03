import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
// import { JwtStrategy } from '../../../api-gateway/src/app/strategies/jwt.strategy';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { JwtCoreModule } from '../../../api-gateway/src/app/jwt-core-module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import Redis from 'ioredis';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';


@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtCoreModule,
    ClientsModule.register([
      {
        name: 'email_client',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'],
          queue: 'email_service',
          prefetchCount: 1,
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: () =>
        new Redis({
          host: 'localhost',
          port: 6381,
        }),
    },
  ],
  exports: [AppService],
})
export class AppModule {}
