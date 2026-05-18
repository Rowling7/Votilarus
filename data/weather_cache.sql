/*
 Navicat Premium Data Transfer
 
 Source Server         : SQLite-Votilarus
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main
 
 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001
 
 Date: 2026-05-18
 
 Description: 天气数据缓存表 - 存储从 OpenWeatherMap API 获取的天气信息
 */
PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for weather_cache
-- ----------------------------
DROP TABLE IF EXISTS "weather_cache";

CREATE TABLE "weather_cache" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    -- 城市信息
    "city_name" TEXT NOT NULL,
    -- 城市名称（如：Weihai, Beijing）
    "city_id" INTEGER,
    -- 城市ID（API返回）
    "country_code" TEXT,
    -- 国家代码（如：CN）
    -- 地理位置
    "longitude" REAL,
    -- 经度
    "latitude" REAL,
    -- 纬度
    -- 主要天气信息
    "weather_id" INTEGER,
    -- 天气状况ID
    "weather_main" TEXT,
    -- 天气主类别（如：Clear, Clouds, Rain）
    "weather_description" TEXT,
    -- 天气详细描述（如：晴朗, 多云）
    "weather_icon" TEXT,
    -- 天气图标代码（如：01d, 02n）
    -- 温度数据（摄氏度）
    "temperature" REAL,
    -- 当前温度
    "feels_like" REAL,
    -- 体感温度
    "temp_min" REAL,
    -- 最低温度
    "temp_max" REAL,
    -- 最高温度
    -- 气压和湿度
    "pressure" INTEGER,
    -- 大气压（hPa）
    "humidity" INTEGER,
    -- 湿度（%）
    "sea_level" INTEGER,
    -- 海平面气压（hPa，可选）
    "grnd_level" INTEGER,
    -- 地面气压（hPa，可选）
    -- 风的数据
    "wind_speed" REAL,
    -- 风速（m/s）
    "wind_deg" INTEGER,
    -- 风向角度（度）
    "wind_gust" REAL,
    -- 阵风风速（m/s，可选）
    -- 云量
    "clouds_all" INTEGER,
    -- 云量百分比（0-100）
    -- 能见度
    "visibility" INTEGER,
    -- 能见度（米）
    -- 降水数据（可选，最近1小时/3小时）
    "rain_1h" REAL,
    -- 1小时降水量（mm）
    "rain_3h" REAL,
    -- 3小时降水量（mm）
    "snow_1h" REAL,
    -- 1小时降雪量（mm）
    "snow_3h" REAL,
    -- 3小时降雪量（mm）
    -- 时间信息
    "sunrise" INTEGER,
    -- 日出时间（Unix时间戳）
    "sunset" INTEGER,
    -- 日落时间（Unix时间戳）
    "timezone_offset" INTEGER,
    -- 时区偏移（秒）
    -- API响应元数据
    "api_cod" INTEGER,
    -- API响应代码（200表示成功）
    "api_message" TEXT,
    -- API消息（如有错误）
    -- 缓存管理
    "cached_at" DATETIME NOT NULL,
    -- 缓存创建时间
    "expires_at" DATETIME NOT NULL,
    -- 缓存过期时间
    "is_valid" INTEGER DEFAULT 1,
    -- 是否有效（1=有效，0=已过期）
    -- 审计字段
    "created_at" DATETIME DEFAULT (datetime('now', 'localtime')),
    "updated_at" DATETIME DEFAULT (datetime('now', 'localtime'))
);

-- ----------------------------
-- Indexes for weather_cache
-- ----------------------------
-- 城市名称索引（加速按城市查询）
CREATE INDEX IF NOT EXISTS "idx_weather_cache_city" ON "weather_cache" ("city_name");

-- 过期时间索引（加速清理过期数据）
CREATE INDEX IF NOT EXISTS "idx_weather_cache_expires" ON "weather_cache" ("expires_at");

-- 有效性索引（加速查询有效数据）
CREATE INDEX IF NOT EXISTS "idx_weather_cache_valid" ON "weather_cache" ("is_valid");

-- 复合索引（城市+有效性，最常用的查询组合）
CREATE INDEX IF NOT EXISTS "idx_weather_cache_city_valid" ON "weather_cache" ("city_name", "is_valid");

-- ----------------------------
-- 示例数据
-- ----------------------------
INSERT INTO
    "weather_cache"
VALUES
    (
        1,
        -- id
        'Weihai',
        -- city_name
        1792947,
        -- city_id
        'CN',
        -- country_code
        122.1167,
        -- longitude
        37.5167,
        -- latitude
        800,
        -- weather_id
        'Clear',
        -- weather_main
        '晴朗',
        -- weather_description
        '01d',
        -- weather_icon
        20.5,
        -- temperature
        19.8,
        -- feels_like
        18.2,
        -- temp_min
        22.1,
        -- temp_max
        1015,
        -- pressure
        65,
        -- humidity
        NULL,
        -- sea_level
        NULL,
        -- grnd_level
        3.5,
        -- wind_speed
        180,
        -- wind_deg
        NULL,
        -- wind_gust
        10,
        -- clouds_all
        10000,
        -- visibility
        NULL,
        -- rain_1h
        NULL,
        -- rain_3h
        NULL,
        -- snow_1h
        NULL,
        -- snow_3h
        1620000000,
        -- sunrise
        1620050000,
        -- sunset
        28800,
        -- timezone_offset (UTC+8)
        200,
        -- api_cod
        NULL,
        -- api_message
        datetime('now', 'localtime'),
        -- cached_at
        datetime('now', '+30 minutes', 'localtime'),
        -- expires_at (30分钟后过期)
        1,
        -- is_valid
        datetime('now', 'localtime'),
        -- created_at
        datetime('now', 'localtime') -- updated_at
    );

PRAGMA foreign_keys = true;