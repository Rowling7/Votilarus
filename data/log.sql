/*
 Navicat Premium Data Transfer

 Source Server         : SQLite-Votilarus
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 09/05/2026 10:03:32
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for log
-- ----------------------------
DROP TABLE IF EXISTS "log";
CREATE TABLE "log" (
  "id" integer NOT NULL,
  "tablename" TEXT,
  "column_id" TEXT,
  "column_name" text,
  "newValue" TEXT,
  "oldValue" TEXT,
  "apis" TEXT,
  "sqls" TEXT,
  "created_at" DATE,
  "deleted_flag" integer,
  PRIMARY KEY ("id")
);

-- ----------------------------
-- Records of log
-- ----------------------------

-- ----------------------------
-- Indexes structure for table log
-- ----------------------------
CREATE INDEX "index_log_apis"
ON "log" (
  "apis" ASC
);
CREATE INDEX "index_log_cloumnValue"
ON "log" (
  "column_id" ASC
);
CREATE INDEX "index_log_tablename"
ON "log" (
  "tablename" ASC
);

PRAGMA foreign_keys = true;
