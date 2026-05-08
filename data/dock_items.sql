/*
 Navicat Premium Data Transfer

 Source Server         : SQLite-Votilarus
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 08/05/2026 16:41:13
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for dock_items
-- ----------------------------
DROP TABLE IF EXISTS "dock_items";
CREATE TABLE "dock_items" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "item_id" TEXT NOT NULL,
  "sort_order" INTEGER DEFAULT 0,
  "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("item_id") REFERENCES "icon_items" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- ----------------------------
-- Records of dock_items
-- ----------------------------
INSERT INTO "dock_items" VALUES (83, '3', 1, '2026-05-08 08:11:25');
INSERT INTO "dock_items" VALUES (84, '4', 2, '2026-05-08 08:11:30');
INSERT INTO "dock_items" VALUES (85, '195', 3, '2026-05-08 08:11:34');
INSERT INTO "dock_items" VALUES (86, '42', 4, '2026-05-08 08:12:15');
INSERT INTO "dock_items" VALUES (87, '124', 5, '2026-05-08 08:12:25');

-- ----------------------------
-- Auto increment value for dock_items
-- ----------------------------
UPDATE "sqlite_sequence" SET seq = 87 WHERE name = 'dock_items';

-- ----------------------------
-- Indexes structure for table dock_items
-- ----------------------------
CREATE INDEX "idx_dock_items_item_id"
ON "dock_items" (
  "item_id" ASC
);

PRAGMA foreign_keys = true;
