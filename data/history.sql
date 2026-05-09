/*
 Navicat Premium Data Transfer

 Source Server         : SQLite-Votilarus
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 09/05/2026 10:03:14
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for history
-- ----------------------------
DROP TABLE IF EXISTS "history";
CREATE TABLE "history" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "icon_path" text,
  "url" TEXT NOT NULL,
  "title" TEXT,
  "last_visit_at" DATE,
  "created_at" DATE,
  "deleted_at" DATE,
  "deleted_flag" INTEGER DEFAULT 0,
  "updated_at" DATE
);

-- ----------------------------
-- Records of history
-- ----------------------------

-- ----------------------------
-- Auto increment value for history
-- ----------------------------
UPDATE "sqlite_sequence" SET seq = 6852 WHERE name = 'history';

PRAGMA foreign_keys = true;
