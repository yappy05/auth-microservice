import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, UserResponse } from '@backend/shared-dto';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {
  }
  async register(dto: RegisterDto): Promise<UserResponse> {
    const {name, email, password} = dto
    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        password
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })
    return user
  }
  public findByEmail(email: string) {
    const user
  }
}
