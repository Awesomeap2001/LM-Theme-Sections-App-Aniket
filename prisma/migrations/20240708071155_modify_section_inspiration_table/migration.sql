-- AlterTable
ALTER TABLE `section_inspiration` ADD COLUMN `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NULL,
    MODIFY `title` VARCHAR(191) NULL,
    MODIFY `imgSrc` VARCHAR(191) NULL;
