/*
 Navicat Premium Data Transfer

 Source Server         : SQLite-Votilarus
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 09/05/2026 10:03:44
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for route_line
-- ----------------------------
DROP TABLE IF EXISTS "route_line";
CREATE TABLE "route_line" (
  "id" integer NOT NULL,
  "linenumber" TEXT,
  "linetype" TEXT,
  "isforhome" TEXT,
  "timezone" TEXT,
  "cartype" TEXT,
  "carid" TEXT,
  "pointid" TEXT,
  "arrivatime" DATE,
  "notes" TEXT,
  "isdel" TEXT,
  PRIMARY KEY ("id")
);

-- ----------------------------
-- Records of route_line
-- ----------------------------
INSERT INTO "route_line" VALUES (1, 'rw-gjt-am-1', 'rw', '0', 'am', '1', 'gongjiatao', 'ruimushan', '5:55', '回威海', '0');
INSERT INTO "route_line" VALUES (2, 'rw-gjt-am-2', 'rw', '0', 'am', '2', 'gongjiatao', 'ruimushan', '10:20', '回威海', '0');
INSERT INTO "route_line" VALUES (3, 'wr-gjt-am-1', 'wr', '1', 'am', '1', 'gongjiatao', 'weihaizhan', '7:45', '回家', '0');
INSERT INTO "route_line" VALUES (4, 'wr-gjt-pm-1', 'wr', '1', 'pm', '1', 'gongjiatao', 'weihaizhan', '13:58', '回家', '0');
INSERT INTO "route_line" VALUES (5, 'wr-gjt-pm-1', 'wr', '1', 'pm', '1', 'gongjiatao', 'nanqufu', '14:16', '回家', '0');
INSERT INTO "route_line" VALUES (6, 'rw-ljk-am-1', 'rw', '0', 'am', '1', 'lujiakuang', 'chedao', '6:20', '回威海', '0');
INSERT INTO "route_line" VALUES (7, 'wr-ljk-am-1', 'wr', '1', 'am', '1', 'lujiakuang', 'haopo', '9:00', '回家', '0');
INSERT INTO "route_line" VALUES (8, 'rw-qj-pm-1', 'rw', '0', 'pm', '1', 'qiaojia', 'ruimushan', '15:20', '回威海', '0');
INSERT INTO "route_line" VALUES (9, 'wr-qj-am-1', 'wr', '1', 'am', '1', 'qiaojia', 'nanqufu', '11:35', '回家', '0');
INSERT INTO "route_line" VALUES (10, 'wr-qj-am-1', 'wr', '1', 'am', '1', 'qiaojia', 'haopo', '11:29', '回家', '0');
INSERT INTO "route_line" VALUES (11, 'wr-qj-am-1', 'wr', '1', 'am', '1', 'qiaojia', 'wehaizhan', '11:25', '回家', '0');
INSERT INTO "route_line" VALUES (12, 'wr-qj-am-2', 'wr', '1', 'am', '2', 'qiaojia', 'weihaizhan', '5:25', '回家', '0');
INSERT INTO "route_line" VALUES (13, 'rw-jk-am-1', 'rw', '0', 'am', '1', 'jinkuang', 'ruimushan', '6:00', '回威海', '0');
INSERT INTO "route_line" VALUES (14, 'rw-jk-am-2', 'rw', '0', 'am', '2', 'jinkuang', 'ruimushan', '6:25', '回威海', '0');
INSERT INTO "route_line" VALUES (15, 'wr-jk-am-1', 'wr', '1', 'am', '1', 'jinkuang', 'weihaizhan', '7:55', '回家', '0');
INSERT INTO "route_line" VALUES (16, 'rw-ml-am-1', 'rw', '0', 'am', '1', 'maling', 'ruimushan', '7:28', '回威海', '0');
INSERT INTO "route_line" VALUES (17, 'wr-ml-am-1', 'wr', '1', 'am', '1', 'maling', 'weihaizhan', '10:02', '回家', '0');
INSERT INTO "route_line" VALUES (18, 'rw-yz-am-1', 'rw', '0', 'am', '1', 'yazi', 'chedao', '10:05', '回威海', '0');
INSERT INTO "route_line" VALUES (19, 'rw-yz-pm-1', 'rw', '0', 'pm', '1', 'yazi', 'chedao', '16:10', '回威海', '0');
INSERT INTO "route_line" VALUES (20, 'rw-yz-am-1', 'rw', '0', 'am', '1', 'yazi', 'ruimushan', '10:25', '回威海', '0');
INSERT INTO "route_line" VALUES (21, 'rw-yz-pm-1', 'rw', '0', 'pm', '1', 'yazi', 'ruimushan', '16:38', '回威海', '0');
INSERT INTO "route_line" VALUES (22, 'rw-yz-am-1', 'rw', '1', 'am', '1', 'yazi', 'haopo', '6:50', '回家', '0');
INSERT INTO "route_line" VALUES (23, 'rw-yz-pm-1', 'rw', '1', 'pm', '1', 'yazi', 'haopo', '12:25', '回家', '0');
INSERT INTO "route_line" VALUES (24, 'wr-yz-am-1', 'wr', '1', 'am', '1', 'yazi', 'weihaizhan', '6:35', '回家', '0');
INSERT INTO "route_line" VALUES (25, 'wr-yz-pm-1', 'wr', '1', 'pm', '1', 'yazi', 'weihaizhan', '12:20', '回家', '0');
INSERT INTO "route_line" VALUES (26, 'rw-msd-am-1', 'rw', '0', 'am', '1', 'mashidian', 'chedao', '11:10', '回威海', '0');
INSERT INTO "route_line" VALUES (27, 'rw-msd-pm-1', 'rw', '0', 'pm', '1', 'mashidian', 'chedao', '17:10', '回威海', '0');
INSERT INTO "route_line" VALUES (28, 'rw-msd-am-1', 'rw', '0', 'am', '1', 'mashidian', 'ruimushan', '11:35', '回威海', '0');
INSERT INTO "route_line" VALUES (29, 'rw-msd-pm-1', 'rw', '0', 'pm', '1', 'mashidian', 'ruimushan', '17:35', '回威海', '0');
INSERT INTO "route_line" VALUES (30, 'wr-msd-pm-1', 'wr', '1', 'pm', '1', 'mashidian', 'weihaizhan', '13:00', '回家', '0');
INSERT INTO "route_line" VALUES (31, 'wr-msd-pm-2', 'wr', '1', 'pm', '2', 'mashidian', 'weihaizhan', '18:15', '回家', '0');
INSERT INTO "route_line" VALUES (32, 'rw-rj-am-1', 'rw', '0', 'am', '1', 'raojian', 'chedao', '9:10', '回威海', '0');
INSERT INTO "route_line" VALUES (33, 'rw-rj-am-2', 'rw', '0', 'am', '2', 'raojian', 'chedao', '4:30', '回威海', '0');
INSERT INTO "route_line" VALUES (34, 'rw-rj-am-1', 'rw', '0', 'am', '1', 'raojian', 'ruimushan', '9:35', '回威海', '0');
INSERT INTO "route_line" VALUES (35, 'rw-rj-pm-1', 'rw', '0', 'pm', '1', 'raojian', 'ruimushan', '17:00', '回威海', '0');
INSERT INTO "route_line" VALUES (36, 'wr-rj-am-1', 'wr', '1', 'am', '1', 'raojian', 'weihaizhan', '6:00', '回家', '0');
INSERT INTO "route_line" VALUES (37, 'wr-rj-pm-1', 'wr', '1', 'pm', '1', 'raojian', 'weihaizhan', '13:10', '回家', '0');

PRAGMA foreign_keys = true;
