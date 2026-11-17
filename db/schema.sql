-- Схема БД приложения «Комментарии» (MySQL)
-- Файл можно открыть в MySQL Workbench и сравнить с фактически реализованной моделью.

CREATE DATABASE IF NOT EXISTS `comments`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `comments`;

CREATE TABLE `users` (
  `id`        CHAR(36)     NOT NULL,
  `userName`  VARCHAR(255) NOT NULL,
  `email`     VARCHAR(255) NOT NULL,
  `homePage`  VARCHAR(255) NOT NULL DEFAULT '',
  `createdAt` DATETIME     NOT NULL,
  `updatedAt` DATETIME     NOT NULL,
  `deletedAt` DATETIME     NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email` (`email`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE `entries` (
  `id`           CHAR(36)     NOT NULL,
  `userId`       CHAR(36)     NOT NULL,
  `parentId`     CHAR(36)     NULL,
  `text`         TEXT         NOT NULL,
  `imagePath`    VARCHAR(255) NULL,
  `textFilePath` VARCHAR(255) NULL,
  `createdAt`    DATETIME     NOT NULL,
  `updatedAt`    DATETIME     NOT NULL,
  `deletedAt`    DATETIME     NULL,
  PRIMARY KEY (`id`),
  KEY `entries_userId` (`userId`),
  KEY `entries_parentId` (`parentId`),
  CONSTRAINT `fk_entries_user`
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_entries_parent`
    FOREIGN KEY (`parentId`) REFERENCES `entries` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
