/*
 Navicat Premium Data Transfer

 Source Server         : SQLite-Votilarus
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 09/05/2026 10:03:37
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
  "sort_order" TEXT,
  "top_flag" TEXT,
  "urgent_flag" TEXT,
  "done_flag" TEXT,
  "important_flag" TEXT,
  "type" TEXT,
  "created_at" DATE,
  "updated_at" DATE,
  "delete_at" DATE,
  "delete_flag" TEXT,
  PRIMARY KEY ("uuid")
);

-- ----------------------------
-- Records of notebook
-- ----------------------------
INSERT INTO "notebook" VALUES ('981e57c0-7aff-41f6-a6de-c939e4d3e305', '写一个体检问题处理文档', '写一个体检问题处理文档', '2025-10-24 00:33:33', '2025-12-25 00:33', '9', '0', '0', '1', '1', 'work', '2025-10-24 00:33:31', '2026-04-23 10:42:59', NULL, '0');
INSERT INTO "notebook" VALUES ('4d35003a-d5c9-4117-b234-acd970cf715f', '骑行速度拆解', '一小时骑行25公里，平均每分钟需要骑416.7米；每公里花费 2分钟 24秒', '2025-11-07 09:51', '2025-11-08 09:51', '10', '0', NULL, '0', NULL, 'life', '2025-11-07 09:51:56', NULL, NULL, '0');
INSERT INTO "notebook" VALUES ('71eb2d10-7e7c-4bf4-ae6a-1bac7e00f009', '给妈妈买车', '给妈妈买车，回家调好', '2025-11-12 16:38', '2025-11-15 16:38', '11', '0', '1', '1', '1', 'life', '2025-11-07 16:38:47', '2025-11-24 14:34:51', NULL, '0');
INSERT INTO "notebook" VALUES ('042c2f14-f349-48f5-b9c2-26cf22b5c665', '修改体检流程图', '1.将[项目作废]和[选择项目]加入团检流程图
2.将修改价格加入所有的流程图中', '2025-12-23 15:41', '2025-12-24 15:41', '12', '0', NULL, '1', '1', 'work', '2025-12-23 15:41:48', '2026-04-23 10:43:06', NULL, '0');
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

https://v.douyin.com/t9v_m2bay2c/', '2026-01-03 16:43', '2026-01-04 16:43', '13', '0', NULL, '1', NULL, 'fun', '2026-01-03 16:43:30', '2026-01-27 09:53:40', NULL, '0');
INSERT INTO "notebook" VALUES ('762e65fe-4107-450b-8365-2ee46354cd3a', 'bilibili-link', 'https://www.bilibili.com/video/BV1vhiqBWEd4/?share_source=copy_web&vd_source=8fc31552091808c5a34c60861de34f30

https://www.bilibili.com/video/BV1DiicB5Eug/?share_source=copy_web&vd_source=8fc31552091808c5a34c60861de34f30', '2026-01-05 18:16', '2026-01-06 18:16', '14', '0', NULL, '1', NULL, 'fun', '2026-01-05 18:16:47', '2026-01-27 09:53:38', NULL, '0');

PRAGMA foreign_keys = true;
