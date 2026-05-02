/*
 Navicat Premium Data Transfer

 Source Server         : Pitaya-Main
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 02/05/2026 01:46:44
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for A70
-- ----------------------------
DROP TABLE IF EXISTS "A70";
CREATE TABLE "A70" (
  "uuid" text NOT NULL,
  "id" INTEGER,
  "aindex" integer,
  "name" TEXT,
  "crtDate" DATE,
  "upDate" DATE,
  "delDate" DATE,
  "isdel" TEXT,
  PRIMARY KEY ("uuid")
);

-- ----------------------------
-- Records of A70
-- ----------------------------
INSERT INTO "A70" VALUES ('0', 'fun', '娱乐', 'yule', NULL, NULL, NULL, '0');
INSERT INTO "A70" VALUES ('1', 'network', '网络', 'wangluo', NULL, NULL, NULL, '0');
INSERT INTO "A70" VALUES ('3', 'tools', '工具', 'gongju', NULL, NULL, NULL, '0');
INSERT INTO "A70" VALUES ('4', 'software', '软件', 'ruanjian', NULL, NULL, NULL, '0');
INSERT INTO "A70" VALUES ('5', 'temp', '临时', 'linshi', NULL, NULL, NULL, '0');
INSERT INTO "A70" VALUES ('6', 'trash', '垃圾桶', 'lajitong', NULL, NULL, NULL, '0');
INSERT INTO "A70" VALUES ('999', 'ys', '其他', 'qita', NULL, NULL, NULL, '1');
INSERT INTO "A70" VALUES ('2', 'game', '游戏', 'youxi', NULL, NULL, NULL, '0');

-- ----------------------------
-- Indexes structure for table A70
-- ----------------------------
CREATE INDEX "index_a70_id"
ON "A70" (
  "id" ASC
);
CREATE INDEX "index_a70_uuid"
ON "A70" (
  "uuid" ASC
);

PRAGMA foreign_keys = true;
