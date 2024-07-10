-- CreateTable
CREATE TABLE `bundle` (
    `bundleId` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `price` INTEGER NOT NULL,
    `imgSrc` VARCHAR(191) NOT NULL,
    `tags` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`bundleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `section` (
    `sectionId` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `badgeTone` VARCHAR(191) NOT NULL,
    `badgeProgress` VARCHAR(191) NOT NULL,
    `price` INTEGER NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `imgSrc` VARCHAR(191) NOT NULL,
    `details` VARCHAR(191) NOT NULL,
    `bundleId` INTEGER NOT NULL,

    PRIMARY KEY (`sectionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `section` ADD CONSTRAINT `section_bundleId_fkey` FOREIGN KEY (`bundleId`) REFERENCES `bundle`(`bundleId`) ON DELETE RESTRICT ON UPDATE CASCADE;
