/*
 Navicat Premium Data Transfer

 Source Server         : SQLite-Votilarus
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 09/05/2026 16:44:57
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
  "pos_x" NUMBER,
  "pos_y" NUMBER,
  "width" NUMBER,
  "height" NUMBER,
  "active_flag" integer,
  "created_at" DATE,
  "updated_at" DATE,
  "deleted_at" DATE,
  "deleted_flag" integer,
  PRIMARY KEY ("id")
);

-- ----------------------------
-- Records of icon_widgets
-- ----------------------------
INSERT INTO "icon_widgets" VALUES (1, -1, 1, 'ClockWidget', 0, 0, 2, 2, 1, NULL, NULL, NULL, 0);

PRAGMA foreign_keys = true;
