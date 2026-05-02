/*
 Navicat Premium Data Transfer

 Source Server         : Pitaya-Main
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 02/05/2026 01:47:49
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for routePoint
-- ----------------------------
DROP TABLE IF EXISTS "routePoint";
CREATE TABLE "routePoint" (
  "uuid" text NOT NULL,
  "pointid" text,
  "pointname" TEXT,
  "notes" TEXT,
  "indexNum" text,
  "isboard" TEXT,
  "isorigin" TEXT,
  "isdel" TEXT,
  PRIMARY KEY ("uuid")
);

-- ----------------------------
-- Records of routePoint
-- ----------------------------
INSERT INTO "routePoint" VALUES ('1', 'weihaizhan', '威海汽车站', NULL, '1', '1', '1', '0');
INSERT INTO "routePoint" VALUES ('2', 'chedao', '车道', '乳山站', '5', '1', '0', '0');
INSERT INTO "routePoint" VALUES ('3', 'ruimushan', '瑞木山村', '家', '4', '1', '0', '0');
INSERT INTO "routePoint" VALUES ('4', 'nanqufu', '南曲阜', '姐姐家', '3', '1', '0', '0');
INSERT INTO "routePoint" VALUES ('5', 'haopo', '蒿泊', NULL, '2', '1', '0', '0');
INSERT INTO "routePoint" VALUES ('6', 'gongjiatao', '宫家桃', NULL, NULL, '0', '1', '0');
INSERT INTO "routePoint" VALUES ('7', 'lujiakuang', '鲁家夼', NULL, NULL, '0', '1', '0');
INSERT INTO "routePoint" VALUES ('8', 'qiaojia', '乔家', NULL, NULL, '0', '1', '0');
INSERT INTO "routePoint" VALUES ('9', 'jinkuang', '金矿', NULL, NULL, '0', '1', '0');
INSERT INTO "routePoint" VALUES ('10', 'maling', '马陵', NULL, NULL, '0', '1', '0');
INSERT INTO "routePoint" VALUES ('11', 'yazi', '崖子', NULL, NULL, '0', '1', '0');
INSERT INTO "routePoint" VALUES ('12', 'mashidian', '马石店', NULL, NULL, '0', '1', '0');
INSERT INTO "routePoint" VALUES ('13', 'raojian', '绕涧', NULL, NULL, '0', '1', '0');
INSERT INTO "routePoint" VALUES ('14', 'shifazhan', '始发站', NULL, '6', '0', '0', '0');
INSERT INTO "routePoint" VALUES ('15', 'zhongdianzhan', '终点站', NULL, '6', '0', '0', '0');
INSERT INTO "routePoint" VALUES ('16', 'weihai', '威海', NULL, '0', '1', '0', '0');

PRAGMA foreign_keys = true;
