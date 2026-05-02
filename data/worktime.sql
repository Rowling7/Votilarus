/*
 Navicat Premium Data Transfer

 Source Server         : Pitaya-Main
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 02/05/2026 01:47:58
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for worktime
-- ----------------------------
DROP TABLE IF EXISTS "worktime";
CREATE TABLE "worktime" (
  "id" INTEGER NOT NULL,
  "starttime" DATE,
  "lunchtime" DATE,
  "endtime" DATE,
  "dailysalary" NUMBER,
  "type" text,
  "isdel" TEXT,
  PRIMARY KEY ("id")
);

-- ----------------------------
-- Records of worktime
-- ----------------------------
INSERT INTO "worktime" VALUES (0, NULL, NULL, NULL, NULL, 'DST:夏令时 ST:冬令时', '1');
INSERT INTO "worktime" VALUES (1, '07:50', '11:20', '17:20', '250', 'DST', '0');
INSERT INTO "worktime" VALUES (2, '07:50', '11:20', '16:50', '250', 'ST', '0');

PRAGMA foreign_keys = true;
