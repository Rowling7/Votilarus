/*
 Navicat Premium Data Transfer

 Source Server         : Pitaya-Main
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 02/05/2026 01:47:35
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for notebook
-- ----------------------------
DROP TABLE IF EXISTS "notebook";
CREATE TABLE "notebook" (
  "uuid" text NOT NULL,
  "title" TEXT,
  "content" text,
  "starttime" DATE,
  "endtime" DATE,
  "urgent" TEXT,
  "important" TEXT,
  "type" TEXT,
  "isdone" TEXT,
  "crttime" DATE,
  "updtime" DATE,
  "deltime" DATE,
  "indexNum" TEXT,
  "istop" TEXT,
  "isdel" TEXT,
  PRIMARY KEY ("uuid")
);

-- ----------------------------
-- Records of notebook
-- ----------------------------
INSERT INTO "notebook" VALUES ('981e57c0-7aff-41f6-a6de-c939e4d3e305', '写一个体检问题处理文档', '写一个体检问题处理文档', '2025-10-24 00:33:33', '2025-12-25 00:33', '0', '1', 'work', '1', '2025-10-24 00:33:31', '2026-04-23 10:42:59', NULL, '9', '0', '0');
INSERT INTO "notebook" VALUES ('4d35003a-d5c9-4117-b234-acd970cf715f', '骑行速度拆解', '一小时骑行25公里，平均每分钟需要骑416.7米；每公里花费 2分钟 24秒', '2025-11-07 09:51', '2025-11-08 09:51', NULL, NULL, 'life', '0', '2025-11-07 09:51:56', NULL, NULL, '10', '0', '0');
INSERT INTO "notebook" VALUES ('71eb2d10-7e7c-4bf4-ae6a-1bac7e00f009', '给妈妈买车', '给妈妈买车，回家调好', '2025-11-12 16:38', '2025-11-15 16:38', '1', '1', 'life', '1', '2025-11-07 16:38:47', '2025-11-24 14:34:51', NULL, '11', '0', '0');
INSERT INTO "notebook" VALUES ('042c2f14-f349-48f5-b9c2-26cf22b5c665', '修改体检流程图', '1.将[项目作废]和[选择项目]加入团检流程图
2.将修改价格加入所有的流程图中', '2025-12-23 15:41', '2025-12-24 15:41', NULL, '1', 'work', '1', '2025-12-23 15:41:48', '2026-04-23 10:43:06', NULL, '12', '0', '0');
INSERT INTO "notebook" VALUES ('1f638257-b161-4833-9592-e4b8074217bb', 'douyin-link', 'https://v.douyin.com/-9hmGG6yGec/

https://v.douyin.com/clVRu3Xm_0s/

https://v.douyin.com/ej-Zv-gSjlE/

https://v.douyin.com/9LxW0ibcj1o/

https://v.douyin.com/oxJs6DGxH3Q/

https://v.douyin.com/UKVQed9V4lM/

https://v.douyin.com/KCeciPgtekA/

https://v.douyin.com/h_TxVAyNzGQ/

https://v.douyin.com/RXggliBNGvw/

https://v.douyin.com/EfRpYQwzI08/

https://v.douyin.com/BA3YWpxnS7A/

https://v.douyin.com/ggsQdfDlYis/

https://v.douyin.com/dTc_APTDuhA/

https://v.douyin.com/t9v_m2bay2c/', '2026-01-03 16:43', '2026-01-04 16:43', NULL, NULL, 'fun', '1', '2026-01-03 16:43:30', '2026-01-27 09:53:40', NULL, '13', '0', '0');
INSERT INTO "notebook" VALUES ('762e65fe-4107-450b-8365-2ee46354cd3a', 'bilibili-link', 'https://www.bilibili.com/video/BV1vhiqBWEd4/?share_source=copy_web&vd_source=8fc31552091808c5a34c60861de34f30

https://www.bilibili.com/video/BV1DiicB5Eug/?share_source=copy_web&vd_source=8fc31552091808c5a34c60861de34f30', '2026-01-05 18:16', '2026-01-06 18:16', NULL, NULL, 'fun', '1', '2026-01-05 18:16:47', '2026-01-27 09:53:38', NULL, '14', '0', '0');

-- ----------------------------
-- Triggers structure for table notebook
-- ----------------------------
CREATE TRIGGER "trg_notebook_insert"
AFTER INSERT
ON "notebook"
FOR EACH ROW
BEGIN
    INSERT INTO "log" (
        "uuid",
        "apis",
        "tablename",
        "cloumnValue",
        "cloumnName",
        "newValue",
        "oldValue",
        "sqls",
        "date",
        "isdel"
    ) VALUES (
        (hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(6))),
        'insert',
        'notebook',
        NEW."uuid",
        null,
        null,
        null,
        null,
        datetime('now', '+8 hours'),
        '0'
    );
END;
CREATE TRIGGER "trg_notebook_update"
AFTER UPDATE
ON "notebook"
FOR EACH ROW
BEGIN
    -- 记录各字段变更
    INSERT INTO "log" (
        "uuid",
        "apis",
        "tablename",
        "cloumnValue",
        "cloumnName",
        "newValue",
        "oldValue",
        "sqls",
        "date",
        "isdel"
    ) 
    SELECT 
        (hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(6))) as uuid,
        CASE 
            WHEN NEW."isdel" = '1' AND OLD."isdel" != '1' THEN 'delete'
            ELSE 'update'
        END as apis,
        'notebook' as tablename,
        NEW."uuid" as cloumnValue,
        "cloumnName",
        "newValue",
        "oldValue",
        null as sqls,
        datetime('now', '+8 hours') as date,
        '0' as isdel
    FROM (
        SELECT 'uuid' as "cloumnName", NEW."uuid" as "newValue", OLD."uuid" as "oldValue" WHERE NEW."uuid" != OLD."uuid"
        UNION ALL
        SELECT 'title', NEW."title", OLD."title" WHERE NEW."title" != OLD."title" OR (NEW."title" IS NULL AND OLD."title" IS NOT NULL) OR (NEW."title" IS NOT NULL AND OLD."title" IS NULL)
        UNION ALL
        SELECT 'content', NEW."content", OLD."content" WHERE NEW."content" != OLD."content" OR (NEW."content" IS NULL AND OLD."content" IS NOT NULL) OR (NEW."content" IS NOT NULL AND OLD."content" IS NULL)
        UNION ALL
        SELECT 'starttime', NEW."starttime", OLD."starttime" WHERE NEW."starttime" != OLD."starttime" OR (NEW."starttime" IS NULL AND OLD."starttime" IS NOT NULL) OR (NEW."starttime" IS NOT NULL AND OLD."starttime" IS NULL)
        UNION ALL
        SELECT 'endtime', NEW."endtime", OLD."endtime" WHERE NEW."endtime" != OLD."endtime" OR (NEW."endtime" IS NULL AND OLD."endtime" IS NOT NULL) OR (NEW."endtime" IS NOT NULL AND OLD."endtime" IS NULL)
        UNION ALL
        SELECT 'urgent', NEW."urgent", OLD."urgent" WHERE NEW."urgent" != OLD."urgent" OR (NEW."urgent" IS NULL AND OLD."urgent" IS NOT NULL) OR (NEW."urgent" IS NOT NULL AND OLD."urgent" IS NULL)
        UNION ALL
        SELECT 'important', NEW."important", OLD."important" WHERE NEW."important" != OLD."important" OR (NEW."important" IS NULL AND OLD."important" IS NOT NULL) OR (NEW."important" IS NOT NULL AND OLD."important" IS NULL)
        UNION ALL
        SELECT 'type', NEW."type", OLD."type" WHERE NEW."type" != OLD."type" OR (NEW."type" IS NULL AND OLD."type" IS NOT NULL) OR (NEW."type" IS NOT NULL AND OLD."type" IS NULL)
        UNION ALL
        SELECT 'isdone', NEW."isdone", OLD."isdone" WHERE NEW."isdone" != OLD."isdone" OR (NEW."isdone" IS NULL AND OLD."isdone" IS NOT NULL) OR (NEW."isdone" IS NOT NULL AND OLD."isdone" IS NULL)
        UNION ALL
        SELECT 'crttime', NEW."crttime", OLD."crttime" WHERE NEW."crttime" != OLD."crttime" OR (NEW."crttime" IS NULL AND OLD."crttime" IS NOT NULL) OR (NEW."crttime" IS NOT NULL AND OLD."crttime" IS NULL)
        UNION ALL
        SELECT 'updtime', NEW."updtime", OLD."updtime" WHERE NEW."updtime" != OLD."updtime" OR (NEW."updtime" IS NULL AND OLD."updtime" IS NOT NULL) OR (NEW."updtime" IS NOT NULL AND OLD."updtime" IS NULL)
        UNION ALL
        SELECT 'deltime', NEW."deltime", OLD."deltime" WHERE NEW."deltime" != OLD."deltime" OR (NEW."deltime" IS NULL AND OLD."deltime" IS NOT NULL) OR (NEW."deltime" IS NOT NULL AND OLD."deltime" IS NULL)
        UNION ALL
        SELECT 'indexNum', NEW."indexNum", OLD."indexNum" WHERE NEW."indexNum" != OLD."indexNum" OR (NEW."indexNum" IS NULL AND OLD."indexNum" IS NOT NULL) OR (NEW."indexNum" IS NOT NULL AND OLD."indexNum" IS NULL)
        UNION ALL
        SELECT 'istop', NEW."istop", OLD."istop" WHERE NEW."istop" != OLD."istop" OR (NEW."istop" IS NULL AND OLD."istop" IS NOT NULL) OR (NEW."istop" IS NOT NULL AND OLD."istop" IS NULL)
        UNION ALL
        SELECT 'isdel', NEW."isdel", OLD."isdel" WHERE NEW."isdel" != OLD."isdel" OR (NEW."isdel" IS NULL AND OLD."isdel" IS NOT NULL) OR (NEW."isdel" IS NOT NULL AND OLD."isdel" IS NULL)
    );
END;

PRAGMA foreign_keys = true;
