-- AlterTable
ALTER TABLE `category` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
