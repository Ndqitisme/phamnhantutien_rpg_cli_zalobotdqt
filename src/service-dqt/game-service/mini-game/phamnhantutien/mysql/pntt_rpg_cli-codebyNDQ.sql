/*
 Navicat Premium Data Transfer

 Source Server         : pntt_rpg_cli-codebyNDQ
 Source Server Type    : MySQL
 Source Server Version : 100432
 Source Host           : localhost:3306
 Target Schema         : pntt_rpg_cli

 Target Server Type    : MySQL
 Target Server Version : 100432
 File Encoding         : 65001

 Date: 07/04/2025 20:02:58
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for player
-- ----------------------------
DROP TABLE IF EXISTS `player`;
CREATE TABLE `player` (
  `id` int NOT NULL AUTO_INCREMENT,
  `globalId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` bigint NOT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'offline',
  `lastActivity` bigint DEFAULT NULL,
  `guild` json DEFAULT NULL,
  `skills` json DEFAULT NULL,
  `location` json DEFAULT NULL,
  `body` json DEFAULT NULL,
  `bag` json DEFAULT NULL,
  `realm` json DEFAULT NULL,
  `stats` json DEFAULT NULL,
  `quests` json DEFAULT NULL,
  `knownIds` json DEFAULT NULL,
  `redeemedCodes` json DEFAULT NULL,
  `respawnTime` bigint DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `globalId` (`globalId`) USING BTREE,
  KEY `name` (`name`) USING BTREE,
  KEY `status` (`status`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of player
-- ----------------------------
INSERT INTO `player` VALUES (
  1, 
  'VP6N8D5203TPH83JVSO4T89G7O6E1T80', 
  'N D Q', 
  1755144682250, 
  'online', 
  1756215614145, 
  '{}', 
  '{"active": [], "passive": []}', 
  '{}', 
  '{"head": null, "body": null, "arm": null, "leg": null}', 
  '{"type": "Tay nải", "items": []}', 
  '{"now": {"id": "luyenkhi", "level": 2}, "inReal": "luyenkhi", "level": 2, "exp": 0, "maxExp": 120, "spiritRoot": {"type": "tu", "elements": ["thuy", "hoa", "moc", "tho"]}}', 
  '{}', 
  '{}', 
  '["2625280118793095163"]', 
  '[]', 
  NULL
);

-- ----------------------------
-- Table structure for spirit_root_types
-- ----------------------------
DROP TABLE IF EXISTS `spirit_root_types`;
CREATE TABLE `spirit_root_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `type_id` (`type_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of spirit_root_types
-- ----------------------------
INSERT INTO `spirit_root_types` VALUES 
(1, 'thien', 'Thiên linh căn'),
(2, 'song', 'Song linh căn'),
(3, 'tam', 'Tam linh căn'),
(4, 'tu', 'Tứ linh căn'),
(5, 'ngu', 'Ngũ linh căn'),
(6, 'none', 'Chưa có linh căn');

-- ----------------------------
-- Table structure for spirit_root_elements
-- ----------------------------
DROP TABLE IF EXISTS `spirit_root_elements`;
CREATE TABLE `spirit_root_elements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `element_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `element_id` (`element_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of spirit_root_elements
-- ----------------------------
INSERT INTO `spirit_root_elements` VALUES 
(1, 'kim', 'Kim'),
(2, 'moc', 'Mộc'),
(3, 'thuy', 'Thủy'),
(4, 'hoa', 'Hỏa'),
(5, 'tho', 'Thổ');

-- ----------------------------
-- Table structure for realms
-- ----------------------------
DROP TABLE IF EXISTS `realms`;
CREATE TABLE `realms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `realm_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `breakthrough_at` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `realm_id` (`realm_id`) USING BTREE,
  KEY `type` (`type`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of realms
-- ----------------------------
INSERT INTO `realms` VALUES 
(1, 'luyenkhi', 'Luyện Khí Kỳ', 'tiered', 9),
(2, 'trucco', 'Trúc Cơ', 'substage', 4),
(3, 'ketdan', 'Kết Đan', 'substage', 4),
(4, 'nguyenanh', 'Nguyên Anh', 'substage', 4),
(5, 'hoathan', 'Hóa Thần', 'substage', 4),
(6, 'luyenhuky', 'Luyện Hư', 'substage', 4),
(7, 'hoptheky', 'Hợp Thể', 'substage', 4),
(8, 'daithuaky', 'Đại Thừa', 'substage', 4),
(9, 'chantien', 'Chân Tiên', 'substage', 4),
(10, 'kimtien', 'Kim Tiên', 'substage', 4),
(11, 'thaiatngoctien', 'Thái Ất Ngọc Tiên', 'substage', 4),
(12, 'daila', 'Đại La', 'substage', 4),
(13, 'daotro', 'Đạo Tổ', 'substage', 4);

-- ----------------------------
-- Table structure for realm_substages
-- ----------------------------
DROP TABLE IF EXISTS `realm_substages`;
CREATE TABLE `realm_substages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `realm_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tier` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `max_exp` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `realm_id` (`realm_id`) USING BTREE,
  KEY `tier` (`tier`) USING BTREE,
  CONSTRAINT `fk_realm_substages_realm` FOREIGN KEY (`realm_id`) REFERENCES `realms` (`realm_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of realm_substages
-- ----------------------------
-- Luyện Khí Kỳ
INSERT INTO `realm_substages` VALUES 
(1, 'luyenkhi', 1, 'Tầng 1', 100),
(2, 'luyenkhi', 2, 'Tầng 2', 120),
(3, 'luyenkhi', 3, 'Tầng 3', 140),
(4, 'luyenkhi', 4, 'Tầng 4', 160),
(5, 'luyenkhi', 5, 'Tầng 5', 180),
(6, 'luyenkhi', 6, 'Tầng 6', 200),
(7, 'luyenkhi', 7, 'Tầng 7', 220),
(8, 'luyenkhi', 8, 'Tầng 8', 240),
(9, 'luyenkhi', 9, 'Tầng 9', 260),
(10, 'luyenkhi', 10, 'Tầng 10', 280),
(11, 'luyenkhi', 11, 'Tầng 11', 300),
(12, 'luyenkhi', 12, 'Tầng 12', 320),
(13, 'luyenkhi', 13, 'Tầng 13', 360);

-- Trúc Cơ
INSERT INTO `realm_substages` VALUES 
(14, 'trucco', 1, 'Sơ Kỳ', 1000),
(15, 'trucco', 2, 'Trung Kỳ', 1500),
(16, 'trucco', 3, 'Hậu Kỳ', 2000),
(17, 'trucco', 4, 'Đại Viên Mãn', 500);

-- Kết Đan
INSERT INTO `realm_substages` VALUES 
(18, 'ketdan', 1, 'Sơ Kỳ', 1500),
(19, 'ketdan', 2, 'Trung Kỳ', 3500),
(20, 'ketdan', 3, 'Hậu Kỳ', 5000),
(21, 'ketdan', 4, 'Đại Viên Mãn', 1000);

-- Nguyên Anh
INSERT INTO `realm_substages` VALUES 
(22, 'nguyenanh', 1, 'Sơ Kỳ', 3000),
(23, 'nguyenanh', 2, 'Trung Kỳ', 6000),
(24, 'nguyenanh', 3, 'Hậu Kỳ', 10000),
(25, 'nguyenanh', 4, 'Đại Viên Mãn', 2000);

-- Hóa Thần
INSERT INTO `realm_substages` VALUES 
(26, 'hoathan', 1, 'Sơ Kỳ', 15000),
(27, 'hoathan', 2, 'Trung Kỳ', 18000),
(28, 'hoathan', 3, 'Hậu Kỳ', 21000),
(29, 'hoathan', 4, 'Đại Viên Mãn', 5000);

-- Luyện Hư
INSERT INTO `realm_substages` VALUES 
(30, 'luyenhuky', 1, 'Sơ Kỳ', 25000),
(31, 'luyenhuky', 2, 'Trung Kỳ', 30000),
(32, 'luyenhuky', 3, 'Hậu Kỳ', 35000),
(33, 'luyenhuky', 4, 'Đại Viên Mãn', 10000);

-- Hợp Thể
INSERT INTO `realm_substages` VALUES 
(34, 'hoptheky', 1, 'Sơ Kỳ', 50000),
(35, 'hoptheky', 2, 'Trung Kỳ', 60000),
(36, 'hoptheky', 3, 'Hậu Kỳ', 70000),
(37, 'hoptheky', 4, 'Đại Viên Mãn', 15000);

-- Đại Thừa
INSERT INTO `realm_substages` VALUES 
(38, 'daithuaky', 1, 'Sơ Kỳ', 100000),
(39, 'daithuaky', 2, 'Trung Kỳ', 120000),
(40, 'daithuaky', 3, 'Hậu Kỳ', 140000),
(41, 'daithuaky', 4, 'Đại Viên Mãn', 30000);

-- Chân Tiên
INSERT INTO `realm_substages` VALUES 
(42, 'chantien', 1, 'Sơ Kỳ', 150000),
(43, 'chantien', 2, 'Trung Kỳ', 180000),
(44, 'chantien', 3, 'Hậu Kỳ', 210000),
(45, 'chantien', 4, 'Đại Viên Mãn', 50000);

-- Kim Tiên
INSERT INTO `realm_substages` VALUES 
(46, 'kimtien', 1, 'Sơ Kỳ', 270000),
(47, 'kimtien', 2, 'Trung Kỳ', 320000),
(48, 'kimtien', 3, 'Hậu Kỳ', 380000),
(49, 'kimtien', 4, 'Đại Viên Mãn', 80000);

-- Thái Ất Ngọc Tiên
INSERT INTO `realm_substages` VALUES 
(50, 'thaiatngoctien', 1, 'Sơ Kỳ', 450000),
(51, 'thaiatngoctien', 2, 'Trung Kỳ', 500000),
(52, 'thaiatngoctien', 3, 'Hậu Kỳ', 550000),
(53, 'thaiatngoctien', 4, 'Đại Viên Mãn', 100000);

-- Đại La
INSERT INTO `realm_substages` VALUES 
(54, 'daila', 1, 'Sơ Kỳ', 600000),
(55, 'daila', 2, 'Trung Kỳ', 660000),
(56, 'daila', 3, 'Hậu Kỳ', 720000),
(57, 'daila', 4, 'Đại Viên Mãn', 120000);

-- Đạo Tổ
INSERT INTO `realm_substages` VALUES 
(58, 'daotro', 1, 'Sơ Kỳ', 800000),
(59, 'daotro', 2, 'Trung Kỳ', 900000),
(60, 'daotro', 3, 'Hậu Kỳ', 999999),
(61, 'daotro', 4, 'Đại Viên Mãn', 150000);

-- ----------------------------
-- Table structure for codes
-- ----------------------------
DROP TABLE IF EXISTS `codes`;
CREATE TABLE `codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rewards` json DEFAULT NULL,
  `max_uses` int DEFAULT 1,
  `current_uses` int DEFAULT 0,
  `user_limit` int DEFAULT 1,
  `expire_date` bigint DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `required_level` int DEFAULT 0,
  `used_users` json DEFAULT NULL,
  `created_at` bigint DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `code_id` (`code_id`) USING BTREE,
  UNIQUE KEY `code` (`code`) USING BTREE,
  KEY `is_active` (`is_active`) USING BTREE,
  KEY `expire_date` (`expire_date`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of codes
-- ----------------------------
-- Hiện tại chưa có codes nào, nhưng có thể thêm mẫu sau:
-- INSERT INTO `codes` VALUES (
--   1, 
--   'WELCOME2024', 
--   'Mã chào mừng năm mới 2024', 
--   'Chào mừng bạn đến với game Phạm Nhân Tu Tiên! Nhận ngay phần thưởng khởi đầu.',
--   'WELCOME2024',
--   '{"gold": 1000, "exp": 500, "items": []}',
--   1000, 
--   0, 
--   1, 
--   NULL, 
--   1, 
--   0, 
--   '{}', 
--   1755144682250
-- );

SET FOREIGN_KEY_CHECKS = 1;
