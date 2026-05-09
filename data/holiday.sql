/*
 Navicat Premium Data Transfer

 Source Server         : SQLite-Votilarus
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 09/05/2026 10:03:18
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for holiday
-- ----------------------------
DROP TABLE IF EXISTS "holiday";
CREATE TABLE "holiday" (
  "id" text NOT NULL,
  "name" TEXT,
  "hours" integer,
  "minutes" integer,
  "date" DATE,
  "type" TEXT,
  "isdel" TEXT,
  PRIMARY KEY ("id")
);

-- ----------------------------
-- Records of holiday
-- ----------------------------
INSERT INTO "holiday" VALUES ('0', '原始时间', 0, 0, NULL, '0', '0');
INSERT INTO "holiday" VALUES ('1', '加班', 28, 46, NULL, '1', '0');
INSERT INTO "holiday" VALUES ('2', '调休', 8, 0, NULL, '-1', '0');
INSERT INTO "holiday" VALUES ('45f362fe-82f0-4431-8ebe-1e0f6917567f', '加班', 8, 0, '2025-09-12 09:39:12', '1', '0');
INSERT INTO "holiday" VALUES ('79a4f9e3-ef89-4e24-8acb-797c9f8f422d', '加班', 9, 40, '2025-09-12 09:37:32', '1', '0');
INSERT INTO "holiday" VALUES ('b146784b-79b3-4fd4-a20f-0576f5d09916', '加班', 5, 35, '2025-09-16 11:15:03', '1', '0');
INSERT INTO "holiday" VALUES ('dd49e17f-0307-451d-9bea-14ba363fe1cb', '加班', 5, 0, '2025-10-09 20:34:21', '1', '0');
INSERT INTO "holiday" VALUES ('37c76733-9309-45d0-9488-eb68050043e7', '调休', 8, 0, '2025-10-29 08:49:46', '-1', '0');
INSERT INTO "holiday" VALUES ('67263e52-a12f-4532-bca0-7d3dea1114fa', '调休', 8, 0, '2025-12-15 14:02:08', '-1', '0');
INSERT INTO "holiday" VALUES ('16d54224-9312-4736-8f06-063eb2279e7b', '调休', 8, 0, '2025-12-27 12:30:13', '-1', '0');
INSERT INTO "holiday" VALUES ('0ebc84ac-e7ab-42bb-a5ac-ac5b0a3c69ea', '调休', 8, 0, '2026-01-01 01:28:21', '-1', '0');
INSERT INTO "holiday" VALUES ('d707d1a1-082c-4021-9190-3164160b9140', '调休', 17, 1, '2026-01-05 19:06:32', '-1', '0');
INSERT INTO "holiday" VALUES ('5498f2b1-dcc2-4a93-8dab-85a6a83cc9bf', '加班', 3, 0, '2026-01-27 09:51:30', '1', '0');

PRAGMA foreign_keys = true;
