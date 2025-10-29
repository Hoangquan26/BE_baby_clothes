import { Injectable } from '@nestjs/common';
import { CreateUserRoleDTO } from './dto/create-user-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRoleService {
  constructor(private prisma: PrismaService) {}

  create(createUserRoleDto: CreateUserRoleDTO) {
    const { roleId, userId } = createUserRoleDto;
    return this.prisma.userRole.create({
      data: {
        roleId: roleId,
        userId: userId,
      },
    });
  }
}
