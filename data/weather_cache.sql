/*
 Navicat Premium Data Transfer

 Source Server         : SQLite-Votilarus
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 20/05/2026 00:40:28
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
  "weather_date" DATE,
  "json_value" TEXT
);

-- ----------------------------
-- Records of weather_cache
-- ----------------------------
INSERT INTO "weather_cache" VALUES (311, 'Weihai', 1791673, 'CN', 122.1136, 37.5017, 804, 'Clouds', '阴，多云', '04n', 15.29, 15.36, 15.29, 15.29, 1010, 95, 1010, 1007, 8.71, 112, 15.48, 100, 10000, NULL, NULL, NULL, NULL, 1779223143, 1779274639, 28800, 200, NULL, '2026-05-19 16:10:51', '2026-05-19 16:40:51', 0, '2026-05-19 16:10:51', '2026-05-19 16:34:55', '2026-05-19', NULL);
INSERT INTO "weather_cache" VALUES (317, 'Weihai', 1791673, 'CN', 122.1136, 37.5017, 500, 'Rain', '小雨', '10n', 14.98, 15.01, 14.98, 14.98, 1009, 95, 1009, 1006, 8.15, 101, 14.43, 100, 10000, NULL, NULL, NULL, NULL, 1779223143, 1779274639, 28800, 200, NULL, '2026-05-20 00:39:02', '2026-05-20 01:09:02', 1, '2026-05-19 16:39:02', '2026-05-19 16:39:02', '2026-05-20', NULL);
INSERT INTO "weather_cache" VALUES (318, 'Wuhan', 1791247, 'CN', 114.2667, 30.5833, 500, 'Rain', '小雨', '10n', 21.05, 21.61, 21.05, 21.05, 1006, 92, 1006, 1003, 3.74, 306, 5.4, 100, 10000, NULL, NULL, NULL, NULL, 1779225957, 1779275591, 28800, 200, NULL, '2026-05-20 00:39:46', '2026-05-20 01:09:46', 1, '2026-05-19 16:39:46', '2026-05-19 16:39:46', '2026-05-20', NULL);

-- ----------------------------
-- Auto increment value for weather_cache
-- ----------------------------
UPDATE "sqlite_sequence" SET seq = 318 WHERE name = 'weather_cache';

-- ----------------------------
-- Indexes structure for table weather_cache
-- ----------------------------
CREATE INDEX "idx_weather_cache_city"
ON "weather_cache" (
  "city_name" ASC
);
CREATE INDEX "idx_weather_cache_city_date"
ON "weather_cache" (
  "city_name" ASC,
  "weather_date" ASC
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
