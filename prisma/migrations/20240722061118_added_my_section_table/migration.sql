-- CreateTable
CREATE TABLE `my_sections` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shop` VARCHAR(191) NOT NULL,
    `sectionId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `my_sections` ADD CONSTRAINT `my_sections_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `section`(`sectionId`) ON DELETE RESTRICT ON UPDATE CASCADE;
