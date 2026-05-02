/*
 Navicat Premium Data Transfer

 Source Server         : Pitaya-Main
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 02/05/2026 01:46:57
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for background
-- ----------------------------
DROP TABLE IF EXISTS "background";
CREATE TABLE "background" (
  "uuid" INTEGER NOT NULL,
  "id" INTEGER,
  "name" TEXT,
  "background" blob,
  "isdel" TEXT,
  PRIMARY KEY ("uuid")
);

-- ----------------------------
-- Records of background
-- ----------------------------

PRAGMA foreign_keys = true;
