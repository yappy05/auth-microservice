import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, TokensResponse, UserResponse } from '@backend/shared-dto';
import { RpcException } from '@nestjs/microservices';
import { argon2d, argon2id, hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { status } from '@grpc/grpc-js';


@Injectable()
export class AppService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
  }

  async register(dto: RegisterDto): Promise<TokensResponse> {
    const { name, email, password } = dto;
    const isExist = await this.prismaService.user.findUnique({
      where: {
        email
      }
    });
    console.log(!!isExist === true);

    if (isExist)
      throw new RpcException({
        code: 6,
        message: 'Пользователь с таким email уже существует'
      });
    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        password: await hash(password, {
          type: argon2id,
          timeCost: 3,
          hashLength: 32
        })
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    const tokens = await this.generateTokens(user.name, user.id);
    await this.saveRefreshTokenInDatabase(user.id, tokens.refreshToken);
    return tokens;
  }

  public async login(dto: LoginDto): Promise<TokensResponse> {
    const { email, password } = dto;
    const user = await this.findByEmail(email);
    if (!user) throw new RpcException({
      code: 5,
      message: 'польщователь с такой почтой не зарегестрирован'
    });
    const isPass = await verify(user.password, password);
    if (!isPass) throw new RpcException({
      code: status.UNAUTHENTICATED,
      message: 'не правильно введеный пароль'
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
        email
      }
    });
    return user;
  }

  private async generateTokens(username: string, id: string) {
    const payload = { username, id };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES')
    });
    return { accessToken, refreshToken };
  }


  private saveRefreshTokenInDatabase(userId: string, refreshToken: string) {
    this.prismaService.user.update({
      where: { id: userId },
      data: { refreshToken }
    }).catch(error => console.log('ошибка при обновление refresh-token в базе данных, ', error))
  }

}
