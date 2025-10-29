import { PrismaClient } from "generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // 1) Khai báo toàn bộ permission code (để mở rộng sau này không phải migrate)
  const PERMISSIONS = [
    // SYSTEM & RBAC
    'system.health.read',
    'rbac.role.read','rbac.role.create','rbac.role.update','rbac.role.delete',
    'rbac.permission.read','rbac.user_role.assign','rbac.user_role.revoke',

    // USER / SESSION / AUDIT
    'user.read.any','user.read.own','user.create','user.update.any','user.update.own','user.delete',
    'session.read.any','session.revoke.any','session.read.own','session.revoke.own',
    'audit.read',

    // CATEGORY / PRODUCT / VARIANT / MEDIA / OPTION
    'category.read','category.create','category.update','category.delete','category.reorder',
    'product.read','product.create','product.update','product.delete','product.publish',
    'variant.read','variant.create','variant.update','variant.delete',
    'media.read','media.upload','media.delete',
    'option.read','option.create','option.update','option.delete',

    // WAREHOUSE / INVENTORY / STOCK
    'warehouse.read','warehouse.create','warehouse.update','warehouse.delete',
    'inventory.read','inventory.adjust','inventory.reserve',
    'stock_move.read','stock_move.create','stock_move.revert',

    // CART / WISHLIST
    'cart.read','cart.update','cart.delete',
    'wishlist.read.any','wishlist.read.own','wishlist.update.any','wishlist.update.own',

    // COUPON / PROMOTION
    'coupon.read','coupon.create','coupon.update','coupon.delete','coupon.publish',
    'coupon_redemption.read',

    // ORDER / PAYMENT / SHIPMENT
    'order.read.any','order.read.own','order.create','order.update','order.cancel','order.manage',
    'payment.read','payment.capture','payment.refund.partial','payment.refund.full','payment.cancel',
    'shipment.read','shipment.create','shipment.update','shipment.cancel',

    // REVIEW
    'review.read','review.create','review.approve','review.reject','review.delete',

    // NOTIFICATION
    'notification.read','notification.create','notification.publish','notification.cancel',
    'notification.target.role','notification.target.broadcast',
  ] as const;

  console.log(`🔹 Upsert ${PERMISSIONS.length} permissions...`);
  for (const code of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code },
      update: {},
      create: {
        code,
        name: code
          .replaceAll('.', ' ')
          .replace(/\b\w/g, c => c.toUpperCase()),
      },
    });
  }

  // 2) Rút gọn vai trò
  // - owner: full quyền (*)
  // - admin: quản trị cao, gần full, bao gồm tài chính
  // - staff: vận hành (sản phẩm, tồn kho, đơn hàng, vận chuyển, CSKH, marketing cơ bản), không có refund/capture/cấu hình RBAC
  // - customer: quyền phía người dùng
  // - guest: xem public
  const ROLE_PERMS: Record<string, string[]> = {
    owner: ['*'],

    admin: [
      'rbac.role.*','rbac.permission.read','rbac.user_role.*',
      'user.*','session.*',
      'category.*','product.*','variant.*','media.*','option.*',
      'warehouse.*','inventory.*','stock_move.*',
      'order.*','payment.*','shipment.*',
      'coupon.*','coupon_redemption.read',
      'review.*','notification.*',
      'audit.read','system.health.read',
    ],

    staff: [
      'user.read.any',
      'category.*','product.*','variant.*','media.*','option.*',
      'warehouse.read','warehouse.create','warehouse.update',
      'inventory.read','inventory.adjust','inventory.reserve',
      'stock_move.read','stock_move.create',
      'order.read.any','order.create','order.update','order.cancel',
      'shipment.read','shipment.create','shipment.update','shipment.cancel',
      'coupon.read','coupon.create','coupon.update',
      'review.read','review.approve','review.reject',
      'notification.read','notification.create',
      'payment.read', // chỉ xem thanh toán (không capture/refund/cancel)
    ],

    customer: [
      'user.read.own','user.update.own',
      'session.read.own','session.revoke.own',
      'cart.read.own','cart.update.own',
      'wishlist.read.own','wishlist.update.own',
      'order.read.own','order.create','order.cancel',
      'review.create','review.read',
      'notification.read',
    ],

    guest: ['product.read','category.read','review.read'],
  };

  // 3) Upsert Roles + gán permissions (hỗ trợ wildcard *. và *)
  console.log(`🔹 Upsert roles & role-permission mapping...`);
  const allPerms = await prisma.permission.findMany();

  for (const [roleCode, patterns] of Object.entries(ROLE_PERMS)) {
    const role = await prisma.role.upsert({
      where: { code: roleCode },
      update: {},
      create: {
        code: roleCode,
        name: roleCode.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
      },
    });

    const match = (pattern: string, code: string) => {
      if (pattern === '*') return true;
      if (pattern.endsWith('.*')) {
        const prefix = pattern.slice(0, -2);
        return code.startsWith(prefix + '.');
      }
      return code === pattern;
    };

    const resolved = allPerms.filter(p => patterns.some(pt => match(pt, p.code)));

    for (const perm of resolved) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }

    console.log(`✅ ${role.code} → ${resolved.length} permissions`);
  }

  console.log('🎉 RBAC seed done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
