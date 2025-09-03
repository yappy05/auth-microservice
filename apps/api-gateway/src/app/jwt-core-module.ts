import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { AppModule } from './app.module';
import { UserService } from './user.service';
import { UserModule } from './user.module';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: 'super-secret',
        signOptions: {
          expiresIn: config.getOrThrow<string>('JWT_ACCESS_EXPIRES')
        }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [JwtStrategy],
  exports: [JwtModule]
})

export class JwtCoreModule {}
