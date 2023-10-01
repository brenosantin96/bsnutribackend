/*
  Warnings:

  - The primary key for the `infonutriday` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `infonutriday_has_foods` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `infonutriday_has_meals` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `infonutriday_has_foods` DROP FOREIGN KEY `fk_infonutriday_has_foods_foods1`;

-- DropForeignKey
ALTER TABLE `infonutriday_has_foods` DROP FOREIGN KEY `fk_infonutriday_has_foods_infonutriday1`;

-- DropForeignKey
ALTER TABLE `infonutriday_has_meals` DROP FOREIGN KEY `fk_InfoNutriDay_has_meals_meals1`;

-- DropForeignKey
ALTER TABLE `infonutriday_has_meals` DROP FOREIGN KEY `fk_infonutriday_has_meals_infonutriday1`;

-- AlterTable
ALTER TABLE `foods` ADD COLUMN `infonutridayId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `infonutriday` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(145) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `meals` ADD COLUMN `infonutridayId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `infonutriday_has_foods`;

-- DropTable
DROP TABLE `infonutriday_has_meals`;

-- CreateTable
CREATE TABLE `infonutriday_has_users` (
    `infonutriday_id` VARCHAR(45) NOT NULL,
    `users_id` INTEGER NOT NULL,

    INDEX `fk_infonutriday_has_users_infonutriday1_idx`(`infonutriday_id`),
    INDEX `fk_infonutriday_has_users_users1_idx`(`users_id`),
    PRIMARY KEY (`infonutriday_id`, `users_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `foods` ADD CONSTRAINT `foods_infonutridayId_fkey` FOREIGN KEY (`infonutridayId`) REFERENCES `infonutriday`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meals` ADD CONSTRAINT `meals_infonutridayId_fkey` FOREIGN KEY (`infonutridayId`) REFERENCES `infonutriday`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infonutriday_has_users` ADD CONSTRAINT `fk_infonutriday_has_users_infonutriday1` FOREIGN KEY (`infonutriday_id`) REFERENCES `infonutriday`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `infonutriday_has_users` ADD CONSTRAINT `fk_infonutriday_has_users_users1` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
