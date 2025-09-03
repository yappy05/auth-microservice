import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ConfirmVerification,
  LoginDto,
  RegisterDto, SendEmailRequest,
  TokensResponse,
  UserResponse, VerifyCode
} from '@backend/shared-dto';
import { RpcException } from '@nestjs/microservices';
import { argon2d, argon2id, hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

import { status } from '@grpc/grpc-js';
import Redis from 'ioredis';

@Injectable()
export class AppService {
  private readonly redis: Redis
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis
  ) {
    this.redis = new Redis({host: 'localhost', port: 6381})
  }

  public async sendVerifyCode(userId: string): Promise<SendEmailRequest> {
    const code = 123456
    const user = await this.findById(userId)
    await this.redis.psetex(`verify:${user.email}`, 300000, `${code}`)
    return {name: user.name, email: user.email, verifyCode: code}
  }

  public async confirmVerification(payload: ConfirmVerification) {
    const {email, code} = payload
    const redisCode = await this.redisClient.get(`verify:${email}`)
    if (!redisCode) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'срок действия кода истек'
      })
    }
    console.log(redisCode)
    if (Number(redisCode) !== code) throw new RpcException({
      code: status.UNAUTHENTICATED,
      message: 'неверный код подверждения'
    })
    console.log('success')
    await this.prismaService.user.update({
      where: {email},
      data: {isVerify: true}
    })
    await this.redisClient.del(`verify:${email}`)
  }

  async register(dto: RegisterDto): Promise<TokensResponse> {
    const { name, email, password } = dto;
    const isExist = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    console.log(!!isExist === true);

    if (isExist)
      throw new RpcException({
        code: 6,
        message: 'Пользователь с таким email уже существует',
      });
    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        password: await hash(password, {
          type: argon2id,
          timeCost: 3,
          hashLength: 32,
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    const tokens = await this.generateTokens(user.name, user.id);
    await this.saveRefreshTokenInDatabase(user.id, tokens.refreshToken);
    return tokens;
  }

  public async login(dto: LoginDto): Promise<TokensResponse> {
    const { email, password } = dto;
    const user = await this.findByEmail(email);
    if (!user)
      throw new RpcException({
        code: 5,
        message: 'польщователь с такой почтой не зарегестрирован',
      });
    const isPass = await verify(user.password, password);
    if (!isPass)
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'не правильно введеный пароль',
      });
    const tokens = await this.generateTokens(user.name, user.id);
    this.saveRefreshTokenInDatabase(user.id, tokens.refreshToken);
    return tokens;
  }

  //todo тут может быть проблема, так как нет async
  public logout(userId: string) {
    this.saveRefreshTokenInDatabase(userId, '');
  }

  public async findByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  }

  public async findById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {id}
    })
    if (!user) throw new RpcException({code: status.NOT_FOUND, message: 'не удалось найти пользователя'})
    return user
  }

  private async generateTokens(username: string, id: string) {
    const payload = { username, id };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES'),
    });
    return { accessToken, refreshToken };
  }

  private saveRefreshTokenInDatabase(userId: string, refreshToken: string) {
    this.prismaService.user
      .update({
        where: { id: userId },
        data: { refreshToken },
      })
      .catch((error) =>
        console.log(
          'ошибка при обновление refresh-token в базе данных, ',
          error
        )
      );
  }
}
