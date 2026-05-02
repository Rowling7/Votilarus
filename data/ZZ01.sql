/*
 Navicat Premium Data Transfer

 Source Server         : Pitaya-Main
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 02/05/2026 01:48:07
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for ZZ01
-- ----------------------------
DROP TABLE IF EXISTS "ZZ01";
CREATE TABLE "ZZ01" (
  "id" INTEGER NOT NULL,
  "tableID" INTEGER,
  "tableName" TEXT,
  "explain" TEXT,
  PRIMARY KEY ("id")
);

-- ----------------------------
-- Records of ZZ01
-- ----------------------------
INSERT INTO "ZZ01" VALUES (1, 'A70', 'A70', '图标父级元素');
INSERT INTO "ZZ01" VALUES (2, 'A7001', 'A7001', '图标子级元素');
INSERT INTO "ZZ01" VALUES (3, 'background', 'background', '背景图片');
INSERT INTO "ZZ01" VALUES (4, 'stettings', 'stettings', '本地设置');
INSERT INTO "ZZ01" VALUES (5, 'yiyan', 'yiyan', '一言存储');
INSERT INTO "ZZ01" VALUES (6, 'ZZ01', 'ZZ01', '对照表');
INSERT INTO "ZZ01" VALUES (7, 'holiday', 'holiday', '节假日');
INSERT INTO "ZZ01" VALUES (8, 'hotpoint', 'hotpoint', '热搜');
INSERT INTO "ZZ01" VALUES (9, 'worktime', 'worktime', '工作时间');
INSERT INTO "ZZ01" VALUES (10, 'log', 'log', '日志');
INSERT INTO "ZZ01" VALUES (11, 'images', 'images', '保存图片');
INSERT INTO "ZZ01" VALUES (12, 'notebook', 'notebook', '笔记本');
INSERT INTO "ZZ01" VALUES (13, 'backup ACC', 'backup ACC', '账号备份');

PRAGMA foreign_keys = true;
