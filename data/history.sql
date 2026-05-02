/*
 Navicat Premium Data Transfer

 Source Server         : Pitaya-Main
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 02/05/2026 01:49:27
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for history
-- ----------------------------
DROP TABLE IF EXISTS "history";
CREATE TABLE "history" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "history_id" TEXT,
  "bgimage" blob,
  "url" TEXT NOT NULL,
  "title" TEXT,
  "visit_count" INTEGER DEFAULT 0,
  "typed_count" INTEGER DEFAULT 0,
  "last_visit_time" text,
  "last_visit_date" DATE,
  "created_at" DATE,
  "delDatetime" DATE,
  "isdel" INTEGER DEFAULT 0
);

-- ----------------------------
-- Auto increment value for history
-- ----------------------------
UPDATE "sqlite_sequence" SET seq = 6852 WHERE name = 'history';

-- ----------------------------
-- Indexes structure for table history
-- ----------------------------
CREATE INDEX "idx_history_id"
ON "history" (
  "history_id" ASC
);
CREATE INDEX "idx_last_visit_time"
ON "history" (
  "last_visit_time" ASC
);
CREATE INDEX "idx_url"
ON "history" (
  "url" ASC
);

PRAGMA foreign_keys = true;
