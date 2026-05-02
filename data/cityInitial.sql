/*
 Navicat Premium Data Transfer

 Source Server         : SQLite-Piitahaya
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 30/04/2026 11:15:11
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for cityInitial
-- ----------------------------
DROP TABLE IF EXISTS "cityInitial";
CREATE TABLE "cityInitial" (
  "id" INTEGER NOT NULL,
  "initial" TEXT,
  "listid" INTEGER,
  "isdel" TEXT,
  PRIMARY KEY ("id")
);

-- ----------------------------
-- Records of cityInitial
-- ----------------------------
INSERT INTO "cityInitial" VALUES (1, 'A', 'L1', '0');
INSERT INTO "cityInitial" VALUES (2, 'B', 'L2', '0');
INSERT INTO "cityInitial" VALUES (3, 'C', 'L3', '0');
INSERT INTO "cityInitial" VALUES (4, 'D', 'L4', '0');
INSERT INTO "cityInitial" VALUES (5, 'E', 'L5', '0');
INSERT INTO "cityInitial" VALUES (6, 'F', 'L6', '0');
INSERT INTO "cityInitial" VALUES (7, 'G', 'L7', '0');
INSERT INTO "cityInitial" VALUES (8, 'H', 'L8', '0');
INSERT INTO "cityInitial" VALUES (9, 'I', 'L9', '0');
INSERT INTO "cityInitial" VALUES (10, 'J', 'L10', '0');
INSERT INTO "cityInitial" VALUES (11, 'K', 'L11', '0');
INSERT INTO "cityInitial" VALUES (12, 'L', 'L12', '0');
INSERT INTO "cityInitial" VALUES (13, 'M', 'L13', '0');
INSERT INTO "cityInitial" VALUES (14, 'N', 'L14', '0');
INSERT INTO "cityInitial" VALUES (15, 'O', 'L15', '0');
INSERT INTO "cityInitial" VALUES (16, 'P', 'L16', '0');
INSERT INTO "cityInitial" VALUES (17, 'Q', 'L17', '0');
INSERT INTO "cityInitial" VALUES (18, 'R', 'L18', '0');
INSERT INTO "cityInitial" VALUES (19, 'S', 'L19', '0');
INSERT INTO "cityInitial" VALUES (20, 'T', 'L20', '0');
INSERT INTO "cityInitial" VALUES (21, 'U', 'L21', '0');
INSERT INTO "cityInitial" VALUES (22, 'V', 'L22', '0');
INSERT INTO "cityInitial" VALUES (23, 'W', 'L23', '0');
INSERT INTO "cityInitial" VALUES (24, 'X', 'L24', '0');
INSERT INTO "cityInitial" VALUES (25, 'Y', 'L25', '0');
INSERT INTO "cityInitial" VALUES (26, 'Z', 'L26', '0');

PRAGMA foreign_keys = true;
