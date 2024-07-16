-- CreateTable
CREATE TABLE `charge` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shop` VARCHAR(191) NOT NULL,
    `chargeId` INTEGER NOT NULL,
    `type` ENUM('SECTION', 'BUNDLE') NOT NULL,
    `sectionId` INTEGER NULL,
    `bundleId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `charge` ADD CONSTRAINT `charge_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `section`(`sectionId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `charge` ADD CONSTRAINT `charge_bundleId_fkey` FOREIGN KEY (`bundleId`) REFERENCES `bundle`(`bundleId`) ON DELETE SET NULL ON UPDATE CASCADE;
