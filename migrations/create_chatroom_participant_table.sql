-- Migration: create chatRoomParticipant table
-- Run this SQL against your MySQL database to create the participants table

CREATE TABLE IF NOT EXISTS `chatRoomParticipant` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `chat_room_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `last_read_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_room_user` (`chat_room_id`, `user_id`),
  KEY `idx_chat_room` (`chat_room_id`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `fk_crp_chatroom` FOREIGN KEY (`chat_room_id`) REFERENCES `chatRoom` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_crp_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notes:
-- 1) `chatRoom` table name is assumed to be `chatRoom` (matches your model's tableName).
-- 2) `user` table is assumed to use `user_id` as primary key (matches your User model).
-- 3) If your actual table names or PKs differ, adjust the REFERENCES accordingly.
