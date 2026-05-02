/*
 Navicat Premium Data Transfer

 Source Server         : Pitaya-Main
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 02/05/2026 01:47:02
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for backupACC
-- ----------------------------
DROP TABLE IF EXISTS "backupACC";
CREATE TABLE "backupACC" (
  "id" INTEGER NOT NULL,
  "name" TEXT,
  "account" TEXT,
  "password" TEXT,
  "isdel" TEXT,
  PRIMARY KEY ("id")
);

-- ----------------------------
-- Records of backupACC
-- ----------------------------
INSERT INTO "backupACC" VALUES (1, 'ea', '18877322323', 'CKMs@9827', NULL);

PRAGMA foreign_keys = true;
