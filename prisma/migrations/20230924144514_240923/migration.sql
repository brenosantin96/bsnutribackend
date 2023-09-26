-- AlterTable
ALTER TABLE `users` ALTER COLUMN `isAdmin` DROP DEFAULT;

-- CreateTable
CREATE TABLE `foods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `portion` INTEGER NOT NULL,
    `protein` FLOAT NOT NULL,
    `calories` FLOAT NOT NULL,
    `grease` FLOAT NOT NULL,
    `salt` FLOAT NOT NULL,
    `image` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meals` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isMeal` TINYINT NOT NULL,
    `portion` INTEGER NOT NULL,
    `protein` FLOAT NOT NULL,
    `calories` FLOAT NOT NULL,
    `grease` FLOAT NOT NULL,
    `salt` FLOAT NOT NULL,
    `image` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `infonutriday` (
    `id` VARCHAR(45) NOT NULL,
    `date` DATE NOT NULL,
    `portion` FLOAT NOT NULL,
    `protein` FLOAT NOT NULL,
    `calories` FLOAT NOT NULL,
    `grease` FLOAT NOT NULL,
    `salt` FLOAT NOT NULL,
    `finalizedDay` TINYINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `infonutriday_has_meals` (
    `infonutriday_id` VARCHAR(45) NOT NULL,
    `meals_id` INTEGER NULL,

    INDEX `fk_infonutriday_has_meals_infonutriday1_idx`(`infonutriday_id`),
    INDEX `fk_infonutriday_has_meals_meals1_idx`(`meals_id`),
    PRIMARY KEY (`infonutriday_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meals_has_foods` (
    `meals_id` INTEGER NOT NULL,
    `foods_id` INTEGER NOT NULL,

    INDEX `fk_meals_has_foods_foods1_idx`(`foods_id`),
    INDEX `fk_meals_has_foods_meals_idx`(`meals_id`),
    PRIMARY KEY (`meals_id`, `foods_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users_has_foods` (
    `users_id` INTEGER NOT NULL,
    `foods_id` INTEGER NOT NULL,

    INDEX `fk_users_has_foods_foods1_idx`(`foods_id`),
    INDEX `fk_users_has_foods_users1_idx`(`users_id`),
    PRIMARY KEY (`users_id`, `foods_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users_has_meals` (
    `users_id` INTEGER NOT NULL,
    `meals_id` INTEGER NOT NULL,

    INDEX `fk_users_has_meals_meals1_idx`(`meals_id`),
    INDEX `fk_users_has_meals_users1_idx`(`users_id`),
    PRIMARY KEY (`users_id`, `meals_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `infonutriday_has_foods` (
    `infonutriday_id` VARCHAR(45) NOT NULL,
    `foods_id` INTEGER NULL,

    INDEX `fk_infonutriday_has_foods_foods1_idx`(`foods_id`),
    INDEX `fk_infonutriday_has_foods_infonutriday1_idx`(`infonutriday_id`),
    PRIMARY KEY (`infonutriday_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `infonutriday_has_meals` ADD CONSTRAINT `fk_infonutriday_has_meals_infonutriday1` FOREIGN KEY (`infonutriday_id`) REFERENCES `infonutriday`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `infonutriday_has_meals` ADD CONSTRAINT `fk_InfoNutriDay_has_meals_meals1` FOREIGN KEY (`meals_id`) REFERENCES `meals`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `meals_has_foods` ADD CONSTRAINT `fk_meals_has_foods_foods1` FOREIGN KEY (`foods_id`) REFERENCES `foods`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `meals_has_foods` ADD CONSTRAINT `fk_meals_has_foods_meals` FOREIGN KEY (`meals_id`) REFERENCES `meals`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `users_has_foods` ADD CONSTRAINT `fk_users_has_foods_foods1` FOREIGN KEY (`foods_id`) REFERENCES `foods`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `users_has_foods` ADD CONSTRAINT `fk_users_has_foods_users1` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `users_has_meals` ADD CONSTRAINT `fk_users_has_meals_meals1` FOREIGN KEY (`meals_id`) REFERENCES `meals`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `users_has_meals` ADD CONSTRAINT `fk_users_has_meals_users1` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `infonutriday_has_foods` ADD CONSTRAINT `fk_infonutriday_has_foods_foods1` FOREIGN KEY (`foods_id`) REFERENCES `foods`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `infonutriday_has_foods` ADD CONSTRAINT `fk_infonutriday_has_foods_infonutriday1` FOREIGN KEY (`infonutriday_id`) REFERENCES `infonutriday`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
