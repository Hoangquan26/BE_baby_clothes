import { applyDecorators, SetMetadata } from '@nestjs/common';

export const PERMISSIONS_METADATA_KEY = 'permissions';

export const Permissions = (...permissions: string[]) =>
  applyDecorators(SetMetadata(PERMISSIONS_METADATA_KEY, permissions));
