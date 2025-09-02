import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
// import { JwtStrategy } from '../../../api-gateway/src/app/strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { JwtCoreModule } from '../../../api-gateway/src/app/jwt-core-module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtCoreModule
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: []
})
export class AppModule {}
