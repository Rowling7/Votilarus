/*
 Navicat Premium Data Transfer

 Source Server         : SQLite-Votilarus
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 09/05/2026 10:03:24
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for icon_search
-- ----------------------------
DROP TABLE IF EXISTS "icon_search";
CREATE TABLE "icon_search" (
  "id" INTEGER NOT NULL,
  "sort_order" integer,
  "title" TEXT,
  "title_en" TEXT,
  "url" TEXT,
  "icon_path" TEXT,
  "created_at" DATE,
  "updated_at" DATE,
  "deleted_at" DATE,
  "delete_flag" TEXT,
  PRIMARY KEY ("id")
);

-- ----------------------------
-- Records of icon_search
-- ----------------------------
INSERT INTO "icon_search" VALUES (1, 2, '百度', 'baidu', 'https://www.baidu.com/s?wd=', 'static/ico/svg-baidu.svg', NULL, NULL, NULL, '0');
INSERT INTO "icon_search" VALUES (2, 1, 'Bing', 'bing', 'https://www.bing.com/search?q=', 'static/ico/bing.png', NULL, NULL, NULL, '0');
INSERT INTO "icon_search" VALUES (3, 10, 'Google', 'google', 'https://www.google.com/search?q=', 'static/ico/google.png', NULL, NULL, NULL, '0');
INSERT INTO "icon_search" VALUES (4, 11, 'Yahoo', 'yahoo', 'https://search.yahoo.com/search?p=', 'static/ico/yahoo.png', NULL, NULL, NULL, '0');
INSERT INTO "icon_search" VALUES (5, 12, 'DuckDuckGo', 'duckduckgo', 'https://duckduckgo.com/?q=', 'static/ico/duckduckgo.png', NULL, NULL, NULL, '0');
INSERT INTO "icon_search" VALUES (6, 13, 'Yandex', 'yandex', 'https://yandex.com/search/?text=', 'static/ico/yandex.png', NULL, NULL, NULL, '0');
INSERT INTO "icon_search" VALUES (7, 14, '小艺', 'xiaoyi', 'https://xiaoyi.huawei.com/?q=', 'static/ico/xiaoyi.png', NULL, NULL, NULL, '0');
INSERT INTO "icon_search" VALUES (8, 9, '搜狗', 'sougou', 'https://www.so.com/s?ie={inputEncoding}&q=', 'static/ico/sougou.png', NULL, NULL, NULL, '0');
INSERT INTO "icon_search" VALUES (9, 8, '知乎', 'zhihu', 'https://www.zhihu.com/search?type=content&q=', 'static/ico/zhihu.png', NULL, NULL, NULL, '0');
INSERT INTO "icon_search" VALUES (10, 7, '微博', 'weibo', 'https://s.weibo.com/weibo?q=', 'static/ico/weibo.png', NULL, NULL, NULL, '0');
INSERT INTO "icon_search" VALUES (11, 5, '小红书', 'xiaohongshu', 'https://www.xiaohongshu.com/search_result?keyword=', 'static/ico/xiaohongshu.png', NULL, NULL, NULL, '0');
INSERT INTO "icon_search" VALUES (12, 6, '豆瓣', 'douban', 'https://www.douban.com/search?source=suggest&q=', 'static/ico/douban.png', NULL, NULL, NULL, '0');
INSERT INTO "icon_search" VALUES (13, 4, '抖音', 'douyin', 'https://www.douyin.com/root/search/', 'static/ico/douyin.png', NULL, NULL, NULL, '0');
INSERT INTO "icon_search" VALUES (14, 3, '哔哩哔哩', 'bilibili', 'https://search.bilibili.com/video?keyword=', 'static/ico/bilibili.png', NULL, NULL, NULL, '0');

PRAGMA foreign_keys = true;
