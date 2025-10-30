/*
  Warnings:

  - You are about to drop the column `country` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `isDefaultBilling` on the `address` table. All the data in the column will be lost.
  - Made the column `ward` on table `address` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `address` DROP FOREIGN KEY `Address_userId_fkey`;

-- DropIndex
DROP INDEX `Address_userId_isDefaultBilling_idx` ON `address`;

-- AlterTable
ALTER TABLE `address` DROP COLUMN `country`,
    DROP COLUMN `district`,
    DROP COLUMN `isDefaultBilling`,
    MODIFY `ward` VARCHAR(128) NOT NULL;

-- AlterTable
ALTER TABLE `usersession` MODIFY `rfTokenHashed` VARCHAR(191) NULL;

-- AddForeignKey
-- ALTER TABLE `RolePermission` ADD CONSTRAINT `RolePermission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
