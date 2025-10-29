type PermissionTree = {
  [key: string]: PermissionTree | string;
};

export const PERMISSION = {
  SYSTEM: {
    HEALTH: {
      READ: 'system.health.read',
    },
  },
  RBAC: {
    ROLE: {
      READ: 'rbac.role.read',
      CREATE: 'rbac.role.create',
      UPDATE: 'rbac.role.update',
      DELETE: 'rbac.role.delete',
    },
    PERMISSION: {
      READ: 'rbac.permission.read',
    },
    USER_ROLE: {
      ASSIGN: 'rbac.user_role.assign',
      REVOKE: 'rbac.user_role.revoke',
    },
  },
  USER: {
    READ_ANY: 'user.read.any',
    READ_OWN: 'user.read.own',
    CREATE: 'user.create',
    UPDATE_ANY: 'user.update.any',
    UPDATE_OWN: 'user.update.own',
    DELETE: 'user.delete',
  },
  SESSION: {
    READ_ANY: 'session.read.any',
    REVOKE_ANY: 'session.revoke.any',
    READ_OWN: 'session.read.own',
    REVOKE_OWN: 'session.revoke.own',
  },
  AUDIT: {
    READ: 'audit.read',
  },
  CATALOG: {
    CATEGORY: {
      READ: 'category.read',
      CREATE: 'category.create',
      UPDATE: 'category.update',
      DELETE: 'category.delete',
      REORDER: 'category.reorder',
    },
    PRODUCT: {
      READ: 'product.read',
      CREATE: 'product.create',
      UPDATE: 'product.update',
      DELETE: 'product.delete',
      PUBLISH: 'product.publish',
    },
    VARIANT: {
      READ: 'variant.read',
      CREATE: 'variant.create',
      UPDATE: 'variant.update',
      DELETE: 'variant.delete',
    },
    MEDIA: {
      READ: 'media.read',
      UPLOAD: 'media.upload',
      DELETE: 'media.delete',
    },
    OPTION: {
      READ: 'option.read',
      CREATE: 'option.create',
      UPDATE: 'option.update',
      DELETE: 'option.delete',
    },
  },
  WAREHOUSE: {
    READ: 'warehouse.read',
    CREATE: 'warehouse.create',
    UPDATE: 'warehouse.update',
    DELETE: 'warehouse.delete',
  },
  INVENTORY: {
    READ: 'inventory.read',
    ADJUST: 'inventory.adjust',
    RESERVE: 'inventory.reserve',
  },
  STOCK_MOVE: {
    READ: 'stock_move.read',
    CREATE: 'stock_move.create',
    REVERT: 'stock_move.revert',
  },
  CART: {
    READ: 'cart.read',
    UPDATE: 'cart.update',
    DELETE: 'cart.delete',
  },
  WISHLIST: {
    READ_ANY: 'wishlist.read.any',
    READ_OWN: 'wishlist.read.own',
    UPDATE_ANY: 'wishlist.update.any',
    UPDATE_OWN: 'wishlist.update.own',
  },
  COUPON: {
    READ: 'coupon.read',
    CREATE: 'coupon.create',
    UPDATE: 'coupon.update',
    DELETE: 'coupon.delete',
    PUBLISH: 'coupon.publish',
    REDEMPTION: {
      READ: 'coupon_redemption.read',
    },
  },
  ORDER: {
    READ_ANY: 'order.read.any',
    READ_OWN: 'order.read.own',
    CREATE: 'order.create',
    UPDATE: 'order.update',
    CANCEL: 'order.cancel',
    MANAGE: 'order.manage',
  },
  PAYMENT: {
    READ: 'payment.read',
    CAPTURE: 'payment.capture',
    REFUND_PARTIAL: 'payment.refund.partial',
    REFUND_FULL: 'payment.refund.full',
    CANCEL: 'payment.cancel',
  },
  SHIPMENT: {
    READ: 'shipment.read',
    CREATE: 'shipment.create',
    UPDATE: 'shipment.update',
    CANCEL: 'shipment.cancel',
  },
  REVIEW: {
    READ: 'review.read',
    CREATE: 'review.create',
    APPROVE: 'review.approve',
    REJECT: 'review.reject',
    DELETE: 'review.delete',
  },
  NOTIFICATION: {
    READ: 'notification.read',
    CREATE: 'notification.create',
    PUBLISH: 'notification.publish',
    CANCEL: 'notification.cancel',
    TARGET: {
      ROLE: 'notification.target.role',
      BROADCAST: 'notification.target.broadcast',
    },
  },
} as const satisfies PermissionTree;

type ExtractPermission<T> = T extends string
  ? T
  : T extends Record<string, infer R>
  ? ExtractPermission<R>
  : never;

export type PermissionCode = ExtractPermission<typeof PERMISSION>;

const collectPermissionValues = (tree: PermissionTree): PermissionCode[] => {
  const bucket: PermissionCode[] = [];

  const dfs = (node: PermissionTree | string) => {
    if (typeof node === 'string') {
      bucket.push(node as PermissionCode);
      return;
    }
    Object.values(node).forEach(dfs);
  };

  dfs(tree);
  return bucket;
};

export const ALL_PERMISSIONS = Object.freeze(collectPermissionValues(PERMISSION));

const P = PERMISSION;

export const ROLE_PERMISSION_PATTERNS = {
  owner: ['*'],
  admin: [
    P.RBAC.ROLE.READ,
    P.RBAC.ROLE.CREATE,
    P.RBAC.ROLE.UPDATE,
    P.RBAC.ROLE.DELETE,
    P.RBAC.PERMISSION.READ,
    P.RBAC.USER_ROLE.ASSIGN,
    P.RBAC.USER_ROLE.REVOKE,
    'user.*',
    'session.*',
    'category.*',
    'product.*',
    'variant.*',
    'media.*',
    'option.*',
    'warehouse.*',
    'inventory.*',
    'stock_move.*',
    'order.*',
    'payment.*',
    'shipment.*',
    'coupon.*',
    P.COUPON.REDEMPTION.READ,
    'review.*',
    'notification.*',
    P.AUDIT.READ,
    P.SYSTEM.HEALTH.READ,
  ],
  staff: [
    P.USER.READ_ANY,
    'category.*',
    'product.*',
    'variant.*',
    'media.*',
    'option.*',
    P.WAREHOUSE.READ,
    P.WAREHOUSE.CREATE,
    P.WAREHOUSE.UPDATE,
    P.INVENTORY.READ,
    P.INVENTORY.ADJUST,
    P.INVENTORY.RESERVE,
    P.STOCK_MOVE.READ,
    P.STOCK_MOVE.CREATE,
    P.ORDER.READ_ANY,
    P.ORDER.CREATE,
    P.ORDER.UPDATE,
    P.ORDER.CANCEL,
    P.SHIPMENT.READ,
    P.SHIPMENT.CREATE,
    P.SHIPMENT.UPDATE,
    P.SHIPMENT.CANCEL,
    P.COUPON.READ,
    P.COUPON.CREATE,
    P.COUPON.UPDATE,
    P.REVIEW.READ,
    P.REVIEW.APPROVE,
    P.REVIEW.REJECT,
    P.NOTIFICATION.READ,
    P.NOTIFICATION.CREATE,
    P.PAYMENT.READ,
  ],
  customer: [
    P.USER.READ_OWN,
    P.USER.UPDATE_OWN,
    P.SESSION.READ_OWN,
    P.SESSION.REVOKE_OWN,
    P.CART.READ,
    P.CART.UPDATE,
    P.WISHLIST.READ_OWN,
    P.WISHLIST.UPDATE_OWN,
    P.ORDER.READ_OWN,
    P.ORDER.CREATE,
    P.ORDER.CANCEL,
    P.REVIEW.CREATE,
    P.REVIEW.READ,
    P.NOTIFICATION.READ,
  ],
  guest: [P.CATALOG.PRODUCT.READ, P.CATALOG.CATEGORY.READ, P.REVIEW.READ],
} as const;

export type RoleCode = keyof typeof ROLE_PERMISSION_PATTERNS;

const matchPattern = (pattern: string, code: PermissionCode) => {
  if (pattern === '*') return true;
  if (pattern.endsWith('.*')) {
    const prefix = pattern.slice(0, -2);
    return code.startsWith(`${prefix}.`);
  }
  return pattern === code;
};

export const resolveRolePermissions = (role: RoleCode): PermissionCode[] => {
  const patterns = ROLE_PERMISSION_PATTERNS[role] ?? [];
  if ((patterns as readonly string[]).includes('*')) {
    return [...ALL_PERMISSIONS];
  }
  return ALL_PERMISSIONS.filter((code) =>
    (patterns as readonly string[]).some((pattern) => matchPattern(pattern, code)),
  );
}
 

export const ROLE_PERMISSIONS = Object.freeze(
  (Object.keys(ROLE_PERMISSION_PATTERNS) as RoleCode[]).reduce<Record<RoleCode, PermissionCode[]>>(
    (acc, role) => {
      acc[role] = resolveRolePermissions(role);
      return acc;
    },
    {} as Record<RoleCode, PermissionCode[]>,
  ),
);
