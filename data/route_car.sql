/*
 Navicat Premium Data Transfer

 Source Server         : SQLite-Votilarus
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 09/05/2026 10:03:41
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for route_car
-- ----------------------------
DROP TABLE IF EXISTS "route_car";
CREATE TABLE "route_car" (
  "id" text NOT NULL,
  "carid" text,
  "Initialism" TEXT,
  "carname" TEXT,
  "phone" TEXT,
  "notes" TEXT,
  "isdel" TEXT,
  PRIMARY KEY ("id")
);

-- ----------------------------
-- Records of route_car
-- ----------------------------
INSERT INTO "route_car" VALUES ('1', 'gongjiatao', 'gjt', '宫家桃', '13869083738', NULL, '0');
INSERT INTO "route_car" VALUES ('2', 'lujiakuang', 'ljk', '鲁家夼', NULL, NULL, '0');
INSERT INTO "route_car" VALUES ('3', 'qiaojia', 'qj', '乔家', NULL, NULL, '0');
INSERT INTO "route_car" VALUES ('4', 'jinkuang', 'jk', '金矿', '13963103507', NULL, '0');
INSERT INTO "route_car" VALUES ('5', 'maling', 'ml', '马陵', '13290170977', NULL, '0');
INSERT INTO "route_car" VALUES ('6', 'yazi', 'yz', '崖子', '13963157005', NULL, '0');
INSERT INTO "route_car" VALUES ('7', 'mashidian', 'msd', '马石店', NULL, NULL, '0');
INSERT INTO "route_car" VALUES ('8', 'raojian', 'rj', '绕涧', '13034562688', NULL, '0');

PRAGMA foreign_keys = true;
