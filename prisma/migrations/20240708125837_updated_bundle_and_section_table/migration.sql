-- DropForeignKey
ALTER TABLE `section` DROP FOREIGN KEY `section_bundleId_fkey`;

-- AlterTable
ALTER TABLE `bundle` MODIFY `title` VARCHAR(191) NULL,
    MODIFY `price` INTEGER NULL,
    MODIFY `imgSrc` VARCHAR(191) NULL,
    MODIFY `tags` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `section` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NULL,
    MODIFY `title` VARCHAR(191) NULL,
    MODIFY `badgeTone` VARCHAR(191) NULL,
    MODIFY `badgeProgress` VARCHAR(191) NULL,
    MODIFY `price` INTEGER NULL,
    MODIFY `categoryId` INTEGER NULL,
    MODIFY `imgSrc` VARCHAR(191) NULL,
    MODIFY `details` VARCHAR(191) NULL,
    MODIFY `bundleId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `section` ADD CONSTRAINT `section_bundleId_fkey` FOREIGN KEY (`bundleId`) REFERENCES `bundle`(`bundleId`) ON DELETE SET NULL ON UPDATE CASCADE;
