/*
 Navicat Premium Data Transfer

 Source Server         : Pitaya-Main
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 02/05/2026 01:47:19
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for hotPoint
-- ----------------------------
DROP TABLE IF EXISTS "hotPoint";
CREATE TABLE "hotPoint" (
  "id" INTEGER NOT NULL,
  "date" DATE,
  "hot" TEXT,
  "hindex" TEXT,
  "title" TEXT,
  "url" TEXT,
  "website" TEXT,
  "isdel" TEXT,
  PRIMARY KEY ("id")
);

-- ----------------------------
-- Records of hotPoint
-- ----------------------------

PRAGMA foreign_keys = true;
