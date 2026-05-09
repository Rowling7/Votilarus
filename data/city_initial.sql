/*
 Navicat Premium Data Transfer

 Source Server         : SQLite-Votilarus
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 09/05/2026 10:03:04
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for city_initial
-- ----------------------------
DROP TABLE IF EXISTS "city_initial";
CREATE TABLE "city_initial" (
  "id" INTEGER NOT NULL,
  "initial" TEXT,
  "listid" INTEGER,
  "isdel" TEXT,
  PRIMARY KEY ("id")
);

-- ----------------------------
-- Records of city_initial
-- ----------------------------
INSERT INTO "city_initial" VALUES (1, 'A', 'L1', '0');
INSERT INTO "city_initial" VALUES (2, 'B', 'L2', '0');
INSERT INTO "city_initial" VALUES (3, 'C', 'L3', '0');
INSERT INTO "city_initial" VALUES (4, 'D', 'L4', '0');
INSERT INTO "city_initial" VALUES (5, 'E', 'L5', '0');
INSERT INTO "city_initial" VALUES (6, 'F', 'L6', '0');
INSERT INTO "city_initial" VALUES (7, 'G', 'L7', '0');
INSERT INTO "city_initial" VALUES (8, 'H', 'L8', '0');
INSERT INTO "city_initial" VALUES (9, 'I', 'L9', '0');
INSERT INTO "city_initial" VALUES (10, 'J', 'L10', '0');
INSERT INTO "city_initial" VALUES (11, 'K', 'L11', '0');
INSERT INTO "city_initial" VALUES (12, 'L', 'L12', '0');
INSERT INTO "city_initial" VALUES (13, 'M', 'L13', '0');
INSERT INTO "city_initial" VALUES (14, 'N', 'L14', '0');
INSERT INTO "city_initial" VALUES (15, 'O', 'L15', '0');
INSERT INTO "city_initial" VALUES (16, 'P', 'L16', '0');
INSERT INTO "city_initial" VALUES (17, 'Q', 'L17', '0');
INSERT INTO "city_initial" VALUES (18, 'R', 'L18', '0');
INSERT INTO "city_initial" VALUES (19, 'S', 'L19', '0');
INSERT INTO "city_initial" VALUES (20, 'T', 'L20', '0');
INSERT INTO "city_initial" VALUES (21, 'U', 'L21', '0');
INSERT INTO "city_initial" VALUES (22, 'V', 'L22', '0');
INSERT INTO "city_initial" VALUES (23, 'W', 'L23', '0');
INSERT INTO "city_initial" VALUES (24, 'X', 'L24', '0');
INSERT INTO "city_initial" VALUES (25, 'Y', 'L25', '0');
INSERT INTO "city_initial" VALUES (26, 'Z', 'L26', '0');

PRAGMA foreign_keys = true;
