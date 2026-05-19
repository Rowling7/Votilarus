/*
 Navicat Premium Data Transfer

 Source Server         : SQLite-Votilarus
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 19/05/2026 15:46:06
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for weather_cache
-- ----------------------------
DROP TABLE IF EXISTS "weather_cache";
CREATE TABLE "weather_cache" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "city_name" TEXT NOT NULL,
  "city_id" INTEGER,
  "country_code" TEXT,
  "longitude" REAL,
  "latitude" REAL,
  "weather_id" INTEGER,
  "weather_main" TEXT,
  "weather_description" TEXT,
  "weather_icon" TEXT,
  "temperature" REAL,
  "feels_like" REAL,
  "temp_min" REAL,
  "temp_max" REAL,
  "pressure" INTEGER,
  "humidity" INTEGER,
  "sea_level" INTEGER,
  "grnd_level" INTEGER,
  "wind_speed" REAL,
  "wind_deg" INTEGER,
  "wind_gust" REAL,
  "clouds_all" INTEGER,
  "visibility" INTEGER,
  "rain_1h" REAL,
  "rain_3h" REAL,
  "snow_1h" REAL,
  "snow_3h" REAL,
  "sunrise" INTEGER,
  "sunset" INTEGER,
  "timezone_offset" INTEGER,
  "api_cod" INTEGER,
  "api_message" TEXT,
  "cached_at" DATETIME NOT NULL,
  "expires_at" DATETIME NOT NULL,
  "is_valid" INTEGER DEFAULT 1,
  "created_at" DATETIME DEFAULT (datetime('now', 'localtime')),
  "updated_at" DATETIME DEFAULT (datetime('now', 'localtime')),
  "weather_date" DATE
);

-- ----------------------------
-- Records of weather_cache
-- ----------------------------

-- ----------------------------
-- Auto increment value for weather_cache
-- ----------------------------
UPDATE "sqlite_sequence" SET seq = 102 WHERE name = 'weather_cache';

-- ----------------------------
-- Indexes structure for table weather_cache
-- ----------------------------
CREATE INDEX "idx_weather_cache_city"
ON "weather_cache" (
  "city_name" ASC
);
CREATE INDEX "idx_weather_cache_city_valid"
ON "weather_cache" (
  "city_name" ASC,
  "is_valid" ASC
);
CREATE INDEX "idx_weather_cache_expires"
ON "weather_cache" (
  "expires_at" ASC
);
CREATE INDEX "idx_weather_cache_valid"
ON "weather_cache" (
  "is_valid" ASC
);

PRAGMA foreign_keys = true;
