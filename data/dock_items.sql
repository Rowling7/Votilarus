/*
 Navicat Premium Data Transfer

 Source Server         : SQLite-Votilarus
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 09/05/2026 09:48:13
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

-- ----------------------------
-- Auto increment value for dock_items
-- ----------------------------
UPDATE "sqlite_sequence" SET seq = 91 WHERE name = 'dock_items';

-- ----------------------------
-- Indexes structure for table dock_items
-- ----------------------------
CREATE INDEX "idx_dock_items_item_id"
ON "dock_items" (
  "item_id" ASC
);

PRAGMA foreign_keys = true;
