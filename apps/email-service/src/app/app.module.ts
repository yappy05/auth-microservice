import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { emailConfig } from '../config/email.config';

@Module({
  imports: [ConfigModule.forRoot({
    load: [() => ({email: emailConfig()})],
    isGlobal: true
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
