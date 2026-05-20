/*
 Navicat Premium Data Transfer
 
 Source Server         : SQLite-Votilarus
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main
 
 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001
 
 Date: 20/05/2026 12:19:13
 */
PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for weather_json
-- ----------------------------
DROP TABLE IF EXISTS "weather_json";

CREATE TABLE "weather_json" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "city_name" TEXT NOT NULL,
  "layer_type" TEXT NOT NULL,
  -- 图层类型: temp_new, wind_new, precipitation_new, clouds_new, pressure_new, snow_new
  "zoom_level" INTEGER NOT NULL,
  -- 缩放级别 z
  "tile_x" INTEGER NOT NULL,
  -- 瓦片 x 坐标
  "tile_y" INTEGER NOT NULL,
  -- 瓦片 y 坐标
  "tile_data" BLOB NOT NULL,
  -- 瓦片图片数据（PNG）
  "cached_at" DATETIME NOT NULL,
  "expires_at" DATETIME NOT NULL,
  "created_at" DATETIME DEFAULT (datetime('now', 'localtime')),
  "updated_at" DATETIME DEFAULT (datetime('now', 'localtime'))
);

-- ----------------------------
-- Records of weather_json
-- ----------------------------
-- ----------------------------
-- Auto increment value for weather_json
-- ----------------------------
UPDATE
  "sqlite_sequence"
SET
  seq = 6
WHERE
  name = 'weather_json';

-- ----------------------------
-- Indexes structure for table weather_json
-- ----------------------------
CREATE INDEX "idx_weather_json_city" ON "weather_json" ("city_name" ASC);

CREATE INDEX "idx_weather_json_layer" ON "weather_json" ("layer_type" ASC);

CREATE INDEX "idx_weather_json_tile" ON "weather_json" (
  "zoom_level" ASC,
  "tile_x" ASC,
  "tile_y" ASC
);

CREATE INDEX "idx_weather_json_expires" ON "weather_json" ("expires_at" ASC);

PRAGMA foreign_keys = true;