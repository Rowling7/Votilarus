/*
 Navicat Premium Data Transfer

 Source Server         : Pitaya-Main
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 02/05/2026 01:47:30
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for log
-- ----------------------------
DROP TABLE IF EXISTS "log";
CREATE TABLE "log" (
  "uuid" text NOT NULL,
  "apis" TEXT,
  "tablename" TEXT,
  "cloumnValue" TEXT,
  "cloumnName" TEXT,
  "newValue" TEXT,
  "oldValue" TEXT,
  "sqls" TEXT,
  "date" DATE,
  "isdel" TEXT,
  PRIMARY KEY ("uuid")
);

-- ----------------------------
-- Indexes structure for table log
-- ----------------------------
CREATE INDEX "index_log_apis"
ON "log" (
  "apis" ASC
);
CREATE INDEX "index_log_cloumnValue"
ON "log" (
  "cloumnValue" ASC
);
CREATE INDEX "index_log_tablename"
ON "log" (
  "tablename" ASC
);
CREATE INDEX "index_log_uuid"
ON "log" (
  "uuid" ASC
);

PRAGMA foreign_keys = true;
