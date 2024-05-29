/*
  Warnings:

  - You are about to drop the column `infonutridayId` on the `foods` table. All the data in the column will be lost.
  - You are about to drop the column `infonutridayId` on the `meals` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `foods` DROP FOREIGN KEY `foods_infonutridayId_fkey`;

-- DropForeignKey
ALTER TABLE `infonutriday_has_users` DROP FOREIGN KEY `fk_infonutriday_has_users_infonutriday1`;

-- DropForeignKey
ALTER TABLE `infonutriday_has_users` DROP FOREIGN KEY `fk_infonutriday_has_users_users1`;

-- DropForeignKey
ALTER TABLE `meals` DROP FOREIGN KEY `meals_infonutridayId_fkey`;

-- DropForeignKey
ALTER TABLE `meals_has_foods` DROP FOREIGN KEY `fk_meals_has_foods_foods1`;

-- DropForeignKey
ALTER TABLE `meals_has_foods` DROP FOREIGN KEY `fk_meals_has_foods_meals`;

-- DropForeignKey
ALTER TABLE `users_has_foods` DROP FOREIGN KEY `fk_users_has_foods_foods1`;

-- DropForeignKey
ALTER TABLE `users_has_foods` DROP FOREIGN KEY `fk_users_has_foods_users1`;

-- DropForeignKey
ALTER TABLE `users_has_meals` DROP FOREIGN KEY `fk_users_has_meals_meals1`;

-- DropForeignKey
ALTER TABLE `users_has_meals` DROP FOREIGN KEY `fk_users_has_meals_users1`;

-- AlterTable
ALTER TABLE `foods` DROP COLUMN `infonutridayId`;

-- AlterTable
ALTER TABLE `meals` DROP COLUMN `infonutridayId`;

-- CreateTable
CREATE TABLE `infonutriday_item_food` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `infonutriday_id` VARCHAR(45) NOT NULL,
    `food_id` INTEGER NOT NULL,
    `qtde` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `infonutriday_item_meal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `infonutriday_id` VARCHAR(45) NOT NULL,
    `meal_id` INTEGER NOT NULL,
    `qtde` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `infonutriday_has_meals` (
    `infonutriday_id` VARCHAR(45) NOT NULL,
    `meals_id` INTEGER NOT NULL,

    PRIMARY KEY (`infonutriday_id`, `meals_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `infonutriday_has_foods` (
    `infonutriday_id` VARCHAR(191) NOT NULL,
    `foods_id` INTEGER NOT NULL,

    PRIMARY KEY (`infonutriday_id`, `foods_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `infonutriday_item_food` ADD CONSTRAINT `infonutriday_item_food_food_id_fkey` FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infonutriday_item_food` ADD CONSTRAINT `infonutriday_item_food_infonutriday_id_fkey` FOREIGN KEY (`infonutriday_id`) REFERENCES `infonutriday`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infonutriday_item_meal` ADD CONSTRAINT `infonutriday_item_meal_meal_id_fkey` FOREIGN KEY (`meal_id`) REFERENCES `meals`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infonutriday_item_meal` ADD CONSTRAINT `infonutriday_item_meal_infonutriday_id_fkey` FOREIGN KEY (`infonutriday_id`) REFERENCES `infonutriday`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infonutriday_has_meals` ADD CONSTRAINT `infonutriday_has_meals_infonutriday_id_fkey` FOREIGN KEY (`infonutriday_id`) REFERENCES `infonutriday`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infonutriday_has_meals` ADD CONSTRAINT `infonutriday_has_meals_meals_id_fkey` FOREIGN KEY (`meals_id`) REFERENCES `meals`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infonutriday_has_foods` ADD CONSTRAINT `infonutriday_has_foods_infonutriday_id_fkey` FOREIGN KEY (`infonutriday_id`) REFERENCES `infonutriday`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infonutriday_has_foods` ADD CONSTRAINT `infonutriday_has_foods_foods_id_fkey` FOREIGN KEY (`foods_id`) REFERENCES `foods`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infonutriday_has_users` ADD CONSTRAINT `infonutriday_has_users_infonutriday_id_fkey` FOREIGN KEY (`infonutriday_id`) REFERENCES `infonutriday`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infonutriday_has_users` ADD CONSTRAINT `infonutriday_has_users_users_id_fkey` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meals_has_foods` ADD CONSTRAINT `meals_has_foods_meals_id_fkey` FOREIGN KEY (`meals_id`) REFERENCES `meals`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meals_has_foods` ADD CONSTRAINT `meals_has_foods_foods_id_fkey` FOREIGN KEY (`foods_id`) REFERENCES `foods`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users_has_foods` ADD CONSTRAINT `users_has_foods_users_id_fkey` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users_has_foods` ADD CONSTRAINT `users_has_foods_foods_id_fkey` FOREIGN KEY (`foods_id`) REFERENCES `foods`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users_has_meals` ADD CONSTRAINT `users_has_meals_users_id_fkey` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users_has_meals` ADD CONSTRAINT `users_has_meals_meals_id_fkey` FOREIGN KEY (`meals_id`) REFERENCES `meals`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
