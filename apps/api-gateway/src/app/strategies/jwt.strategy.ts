import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { AppService } from '../app.service';
import { UserService } from '../user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService, private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'super-secret'
    });
  }
  async validate(payload: {username: string, id: string}) {
    const user = await this.userService.findUser(payload.id)
    console.log(payload.id)
    if (!user.isVerify) return false;
    console.log(user.isVerify)
    return true
  }
}
