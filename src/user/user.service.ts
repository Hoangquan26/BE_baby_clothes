import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindUserByEmailDTO } from './dto/find-user-by-email.dto';
import { FindUserByBothEmailAndUsername } from './dto/find-user-by-both-email-and-username.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import { FindUserByUsernameDTO } from './dto/find-user-by-username.dto';
import { emailRegex } from 'src/common/utils/reggex.util';
import { Prisma } from 'generated/prisma';
import { UserRoleService } from 'src/user-role/user-role.service';
import { UserRoleIDS } from 'src/user-role/user-role.constant';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private userRole: UserRoleService
  ) {}
  private readonly defaultRegisterRole = UserRoleIDS.CUSTOMER
  private readonly safeUserSelect: Prisma.UserSelect = Object.freeze({
    id: true,
    email: true,
    username: true,
    fullName: true,
    isActive: true,
    lastLoginAt: true,
    createdAt: true,
    updatedAt: true,
  });

  private readonly authUserSelect: Prisma.UserSelect = Object.freeze({
    id: true,
    email: true,
    username: true,
    passwordHash: true,
    isActive: true,
    lastLoginAt: true,
  });

  async findUserByEmail(findUserByEmailDto: FindUserByEmailDTO) {
    const { email } = findUserByEmailDto;

    const where = {
      email,
    } as Prisma.UserWhereUniqueInput;

    const foundUser = await this.prisma.user.findUnique({
      where,
    });

    return foundUser;
  }

  async findUserByUsername(findUserByUsernameDto: FindUserByUsernameDTO) {
    const { username } = findUserByUsernameDto;
    const where = {
      username,
    } as Prisma.UserWhereUniqueInput;

    const foundUser = await this.prisma.user.findUnique({
      where,
    });

    return foundUser;
  }

  async findUserByBothEmailAndUsername(dto: FindUserByBothEmailAndUsername) {
    const email = dto.email?.trim().toLowerCase();
    const username = dto.username?.trim().toLowerCase();

    const foundUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      }, 
      select: this.safeUserSelect,
    });

    return foundUser;
  }

  async findUserForAuth(identifier: string) {
    const normalizedIdentifier = (identifier ?? '').trim();
    if (!normalizedIdentifier) {
      return null;
    }

    const isEmail = emailRegex.test(normalizedIdentifier);

    const where: Prisma.UserWhereUniqueInput = isEmail
      ? { email: normalizedIdentifier.toLowerCase() }
      : { username: normalizedIdentifier };

    return this.prisma.user.findUnique({
      where,
      select: this.authUserSelect,
    });
  }

  async updateLastLoginTimestamp(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
      select: { id: true, lastLoginAt: true },
    });
  }

  async findSafeUserById(userId: string) {
    if (!userId) {
      return null;
    }

    return this.prisma.user.findUnique({
      where: { id: userId },
      select: this.safeUserSelect,
    });
  }

  async create(createUserDto: CreateUserDTO) {
    const { email, username, passwordHash, fullName } = createUserDto;
    const normalizedFullName =
      typeof fullName === 'string' ? fullName.trim() : undefined;

    const data: Prisma.UserCreateInput = {
      email,
      username,
      passwordHash,
      fullName: normalizedFullName || username,
    };

    try {
      const newUser = await this.prisma.user.create({
        data,
        select: this.safeUserSelect,
      });
      const newUserRole = await this.userRole.create({
        userId: newUser.id,
        roleId: this.defaultRegisterRole
      })
      return newUser
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = (error.meta?.target as string[] | undefined) ?? [];
        const duplicateField = target.includes('email')
          ? 'Email'
          : target.includes('username')
            ? 'Username'
            : 'Provided data';

        throw new BadRequestException(`${duplicateField} Đã được sử dụng.`);
      }

      throw new InternalServerErrorException('Không thể tạo người dùng.', {
        cause: error,
      });
    }
  }
}
