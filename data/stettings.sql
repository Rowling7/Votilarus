/*
 Navicat Premium Data Transfer

 Source Server         : Pitaya-Main
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 02/05/2026 01:47:54
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for stettings
-- ----------------------------
DROP TABLE IF EXISTS "stettings";
CREATE TABLE "stettings" (
  "id" INTEGER NOT NULL,
  "key" TEXT,
  "value" TEXT,
  "type" TEXT,
  "notes" TEXT,
  "isdisplay" TEXT,
  "isdel" TEXT,
  PRIMARY KEY ("id")
);

-- ----------------------------
-- Records of stettings
-- ----------------------------
INSERT INTO "stettings" VALUES (1, 'ClockWidget', 'clockContainer', 'widget', NULL, '1', '0');
INSERT INTO "stettings" VALUES (2, 'CalendarWidget', 'calendarContainer', 'widget', NULL, '1', '0');
INSERT INTO "stettings" VALUES (3, 'WorkTimeWidget', 'workTimeContainer', 'widget', '2025-12-24 10:40:06', '1', '0');
INSERT INTO "stettings" VALUES (4, 'WeatherWidget', 'weatherContainer', 'widget', '2025-12-24 10:40:07', '1', '0');
INSERT INTO "stettings" VALUES (5, 'ShortcutWidget', 'shortcutContainer', 'widget', NULL, '1', '0');
INSERT INTO "stettings" VALUES (6, 'HotPointWidget', 'hotPointContainer', 'widget', NULL, '1', '0');
INSERT INTO "stettings" VALUES (7, 'NotebookWidget', 'notebookContainer', 'widget', NULL, '1', '0');
INSERT INTO "stettings" VALUES (8, 'YiyanWidget', 'yiyanContainer', 'widget', NULL, '1', '0');
INSERT INTO "stettings" VALUES (9, 'CompLeaveWidget', 'compLeaveContainer', 'widget', '2025-12-24 10:40:09', '1', '0');
INSERT INTO "stettings" VALUES (10, 'WoodenFishWidget', 'woodenFishContainer', 'widget', '2026-04-01 11:44:49', '1', '0');
INSERT INTO "stettings" VALUES (11, 'Daily60sWidget', 'daily60sContainer', 'widget', NULL, '1', '0');
INSERT INTO "stettings" VALUES (12, 'BuslineWidget', 'BuslineContainer', 'widget', '2026-04-23 10:41:18', '1', '0');
INSERT INTO "stettings" VALUES (13, 'HistoryWidget', 'HistoryContainer', 'widget', '2025-12-29 17:34:20', '1', '0');
INSERT INTO "stettings" VALUES (9900, 'color', NULL, 'personal', NULL, NULL, '0');
INSERT INTO "stettings" VALUES (9901, 'darkmode', NULL, 'personal', NULL, NULL, '0');

PRAGMA foreign_keys = true;
