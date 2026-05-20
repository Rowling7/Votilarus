/*
 Navicat Premium Data Transfer

 Source Server         : SQLite-Votilarus
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 21/05/2026 00:07:56
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for icon_widgets
-- ----------------------------
DROP TABLE IF EXISTS "icon_widgets";
CREATE TABLE "icon_widgets" (
  "id" INTEGER NOT NULL,
  "category_id" integer,
  "sort_order" integer,
  "title" TEXT,
  "width" NUMBER,
  "height" NUMBER,
  "active_flag" integer,
  "created_at" DATE,
  "updated_at" DATE,
  "deleted_at" DATE,
  "deleted_flag" integer,
  "title_cn" TEXT,
  PRIMARY KEY ("id")
);

-- ----------------------------
-- Records of icon_widgets
-- ----------------------------
INSERT INTO "icon_widgets" VALUES (9001, -1, 0, 'ClockWidget', 2, 2, 1, '2026-05-10 09:03:11', '2026-05-19 18:52:17', NULL, 0, '时钟');
INSERT INTO "icon_widgets" VALUES (9002, -1, 1, 'CalendarWidget', 2, 2, 1, '2026-05-10 12:44:15', '2026-05-20 15:40:58', NULL, 0, '日历');
INSERT INTO "icon_widgets" VALUES (9003, -1, 2, 'WeatherWidget', 2, 4, 1, '2026-05-10 13:14:22', '2026-05-20 15:49:22', NULL, 0, '天气');
INSERT INTO "icon_widgets" VALUES (9005, -1, 3, 'NotebookWidget', 2, 4, 1, '2026-05-12 16:30:30', '2026-05-20 15:49:22', NULL, 0, '备忘录');
INSERT INTO "icon_widgets" VALUES (9006, -1, 4, 'SearchWidget', 2, 1, 1, '2026-05-20 08:21:14', '2026-05-20 15:49:32', NULL, 0, '搜索');
INSERT INTO "icon_widgets" VALUES (9007, -1, 5, 'HotPointWidget', 2, 4, 1, '2026-05-20 08:21:14	2026-05-20 09:08:06', '2026-05-20 15:51:13', NULL, 0, '热搜');

PRAGMA foreign_keys = true;
