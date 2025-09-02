import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
// import { JwtStrategy } from '../../../api-gateway/src/app/strategies/jwt.strategy';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { JwtCoreModule } from '../../../api-gateway/src/app/jwt-core-module';
import { ClientsModule, Transport } from '@nestjs/microservices';

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
            durable: true
          },
        }
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [],
})
export class AppModule {}
