import { Request } from 'express';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_METADATA_KEY } from 'src/common/decorator/permissions.decorator';
import { PermissionCode } from 'src/common/constants/permission.constant';
import { UserService } from 'src/user/user.service';


@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private userService: UserService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionCode[]>(
      PERMISSIONS_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );
    console.log(requiredPermissions)
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user.sub;
    const userPermissions = await this.userService.getPermisionsForUser(userId);

    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

