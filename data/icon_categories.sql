/*
 Navicat Premium Data Transfer

 Source Server         : SQLite-Votilarus
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 08/05/2026 15:22:45
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for icon_categories
-- ----------------------------
DROP TABLE IF EXISTS "icon_categories";
CREATE TABLE "icon_categories" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "category_code" TEXT NOT NULL,
  "category_name" TEXT,
  "category_name_py" TEXT,
  "created_at" DATE,
  "updated_at" DATE,
  "deleted_at" DATE,
  "deleted_flag" TEXT DEFAULT '0'
);

-- ----------------------------
-- Records of icon_categories
-- ----------------------------
INSERT INTO "icon_categories" VALUES (1, 'fun', '娱乐', 'yule', NULL, NULL, NULL, '0');
INSERT INTO "icon_categories" VALUES (2, 'network', '网络', 'wangluo', NULL, NULL, NULL, '0');
INSERT INTO "icon_categories" VALUES (3, 'tools', '工具', 'gongju', NULL, NULL, NULL, '0');
INSERT INTO "icon_categories" VALUES (4, 'software', '软件', 'ruanjian', NULL, NULL, NULL, '0');
INSERT INTO "icon_categories" VALUES (5, 'temp', '临时', 'linshi', NULL, NULL, NULL, '0');
INSERT INTO "icon_categories" VALUES (6, 'trash', '垃圾桶', 'lajitong', NULL, NULL, NULL, '0');
INSERT INTO "icon_categories" VALUES (7, 'ys', '其他', 'qita', NULL, NULL, NULL, '1');
INSERT INTO "icon_categories" VALUES (8, 'game', '游戏', 'youxi', NULL, NULL, NULL, '0');

-- ----------------------------
-- Auto increment value for icon_categories
-- ----------------------------
UPDATE "sqlite_sequence" SET seq = 8 WHERE name = 'icon_categories';

-- ----------------------------
-- Indexes structure for table icon_categories
-- ----------------------------
CREATE INDEX "idx_icon_categories_category_code"
ON "icon_categories" (
  "category_code" ASC
);
CREATE INDEX "idx_icon_categories_deleted_flag"
ON "icon_categories" (
  "deleted_flag" ASC
);

PRAGMA foreign_keys = true;
