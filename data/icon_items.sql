/*
 Navicat Premium Data Transfer

 Source Server         : SQLite-Votilarus
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 12/05/2026 22:41:21
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for icon_items
-- ----------------------------
DROP TABLE IF EXISTS "icon_items";
CREATE TABLE "icon_items" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "category_id" INTEGER,
  "title" TEXT,
  "link_url" TEXT,
  "icon_path" TEXT,
  "sort_order" INTEGER,
  "width" NUMBER,
  "height" NUMBER,
  "created_at" DATE,
  "deleted_at" DATE,
  "updated_at" DATE,
  "deleted_flag" TEXT DEFAULT '0'
);

-- ----------------------------
-- Records of icon_items
-- ----------------------------
INSERT INTO "icon_items" VALUES (3, 0, '哔哩哔哩', 'http://www.bilibili.com/', 'bilibili.png', 0, 1, 1, NULL, NULL, '2025-08-06 11:06:33', '0');
INSERT INTO "icon_items" VALUES (4, 0, '抖音', 'https://www.douyin.com/', 'douyin.png', 1, 1, 1, NULL, '2026-05-09 03:34:30', '2025-08-06 11:06:37', '0');
INSERT INTO "icon_items" VALUES (5, 6, '低端影视', 'https://ddys.pro/', 'ddys.png', 3, 1, 1, NULL, NULL, '2025-11-07 10:58:49', '0');
INSERT INTO "icon_items" VALUES (6, 0, '音范丝', 'https://www.yinfans.me/', 'yinfansi.png', 2, 1, 1, NULL, NULL, '2025-08-06 11:06:48', '0');
INSERT INTO "icon_items" VALUES (7, 0, '知乎', 'https://www.zhihu.com/', 'zhihu.png', 3, 1, 1, NULL, NULL, '2025-08-06 10:34:06', '0');
INSERT INTO "icon_items" VALUES (8, 0, '豆瓣', 'https://movie.douban.com/', 'douban.png', 4, 1, 1, NULL, NULL, '2025-08-06 10:34:21', '0');
INSERT INTO "icon_items" VALUES (9, 0, '吾爱破解', 'https://www.52pojie.cn/', '52pojie.png', 5, 1, 1, NULL, NULL, '2025-08-06 10:34:27', '0');
INSERT INTO "icon_items" VALUES (10, 0, '新浪微博', 'http://weibo.com/', 'weibo.png', 6, 1, 1, NULL, NULL, '2025-08-06 10:34:36', '0');
INSERT INTO "icon_items" VALUES (11, 0, '一加ROM', 'https://yun.daxiaamu.com/', '1plusrom.png', 7, 1, 1, NULL, NULL, '2025-08-11 14:19:11', '0');
INSERT INTO "icon_items" VALUES (12, 0, '最右', 'https://www.izuiyou.com/', 'zuiyou.png', 8, 1, 1, NULL, NULL, '2025-08-06 10:35:16', '0');
INSERT INTO "icon_items" VALUES (13, 0, 'lookmovie', 'https://ww1.lookmovie.pn/', 'lookmovie.png', 9, 1, 1, NULL, NULL, '2025-08-06 10:35:21', '0');
INSERT INTO "icon_items" VALUES (14, 0, 'opensubtitles', 'https://www.opensubtitles.org/', 'opensubtitles.png', 10, 1, 1, NULL, NULL, '2025-08-08 13:35:37', '0');
INSERT INTO "icon_items" VALUES (15, 0, '奈飞影视', 'https://www.netflixgc.com/', 'netflixgc.png', 11, 1, 1, NULL, NULL, '2025-08-06 10:36:25', '0');
INSERT INTO "icon_items" VALUES (16, 0, '盘库吧', 'https://panku8.com/', 'pankuba.png', 13, 1, 1, NULL, NULL, '2025-08-06 10:36:30', '0');
INSERT INTO "icon_items" VALUES (17, 0, 'Seedhub', 'https://www.seedhub.cc/', 'seedhub.png', 14, 1, 1, NULL, NULL, '2025-08-06 10:36:38', '0');
INSERT INTO "icon_items" VALUES (18, 0, '80s电影网', 'https://y80s.net/', '80smovies.png', 15, 1, 1, NULL, NULL, '2025-08-11 14:17:24', '0');
INSERT INTO "icon_items" VALUES (19, 0, '低端影视001', 'https://ddys001.com/', 'ddys001.png', 16, 1, 1, NULL, NULL, '2025-08-06 10:37:06', '0');
INSERT INTO "icon_items" VALUES (20, 0, '虎牙直播', 'http://www.huya.com/', 'huya.png', 20, 1, 1, NULL, NULL, '2025-12-29 20:28:02', '0');
INSERT INTO "icon_items" VALUES (21, 0, '斗鱼', 'http://www.douyutv.com/', 'douyu.png', 21, 1, 1, NULL, NULL, '2025-08-12 10:36:42', '0');
INSERT INTO "icon_items" VALUES (22, 0, 'Spotify', 'https://open.spotify.com/browse', 'spotify.png', 19, 1, 1, NULL, NULL, '2025-08-06 10:37:34', '0');
INSERT INTO "icon_items" VALUES (23, 0, 'Instagram', 'https://www.instagram.com/', 'instagram.png', 22, 1, 1, NULL, NULL, '2025-08-06 10:37:40', '0');
INSERT INTO "icon_items" VALUES (24, 2, '游戏下载', 'https://koyso.to/', 'koyso.png', 0, 1, 1, NULL, NULL, '2025-08-06 10:37:53', '0');
INSERT INTO "icon_items" VALUES (25, 2, '资源避难所', 'https://www.flysheep6.com/', 'flysheep6.png', 1, 1, 1, NULL, NULL, '2025-08-06 10:38:06', '0');
INSERT INTO "icon_items" VALUES (26, 2, '9dgames', 'http://www.9dmgamemod.com/', '9dgames.png', 2, 1, 1, NULL, NULL, '2025-08-06 10:38:10', '0');
INSERT INTO "icon_items" VALUES (27, 2, 'CSGO', 'http://www.csgo.com.cn/', 'csgo.png', 3, 1, 1, NULL, NULL, '2025-08-11 14:15:34', '0');
INSERT INTO "icon_items" VALUES (28, 6, 'GBT游戏', 'http://gbtgame.ysepan.com/', 'gbtgame.png', 13, 1, 1, NULL, NULL, '2025-09-25 08:05:25', '0');
INSERT INTO "icon_items" VALUES (29, 2, 'GooglePlay', 'https://play.google.com/', 'googleplay.png', 4, 1, 1, NULL, NULL, '2025-08-06 10:38:34', '0');
INSERT INTO "icon_items" VALUES (30, 2, 'MOD网站', 'https://www.nexusmods.com/', 'nexusmods.png', 5, 1, 1, NULL, NULL, '2025-08-11 16:32:16', '0');
INSERT INTO "icon_items" VALUES (31, 2, 'slowroads', 'https://slowroads.io/', 'slowroads.png', 6, 1, 1, NULL, NULL, '2025-08-11 16:15:51', '0');
INSERT INTO "icon_items" VALUES (32, 2, 'Steam', 'https://store.steampowered.com/', 'steam.png', 7, 1, 1, NULL, NULL, '2025-08-06 10:38:58', '0');
INSERT INTO "icon_items" VALUES (33, 2, 'SteamDB', 'https://steamdb.info/', 'steamdb.png', 11, 1, 1, NULL, NULL, '2025-08-06 10:39:01', '0');
INSERT INTO "icon_items" VALUES (34, 2, 'Twitch', 'https://www.twitch.tv/', 'twitch.png', 12, 1, 1, NULL, NULL, '2025-08-06 10:39:04', '0');
INSERT INTO "icon_items" VALUES (35, 2, 'yorg.io', 'https://yorg.io/', 'yorg.png', 13, 1, 1, NULL, NULL, '2025-08-06 10:39:08', '0');
INSERT INTO "icon_items" VALUES (36, 2, '单机游戏', 'https://steamzg.com/', 'steamzg.png', 14, 1, 1, NULL, NULL, '2025-08-06 10:39:27', '0');
INSERT INTO "icon_items" VALUES (37, 2, '米哈社', 'https://www.scyo123p8191.com/', 'scyo123p8191.png', 15, 1, 1, NULL, NULL, '2025-08-06 10:39:35', '0');
INSERT INTO "icon_items" VALUES (38, 2, '摸鱼小游戏', 'https://poki.com/zh', 'poki.png', 16, 1, 1, NULL, NULL, '2025-08-06 10:39:51', '0');
INSERT INTO "icon_items" VALUES (39, 2, '摸鱼专区', 'https://www.oschina.net/group/fishfish', 'oschinagame.png', 17, 1, 1, NULL, NULL, '2025-08-11 14:21:03', '0');
INSERT INTO "icon_items" VALUES (40, 2, '塔防战争', 'https://kiomet.com/', 'kiomet.png', 18, 1, 1, NULL, NULL, '2025-08-06 10:40:34', '0');
INSERT INTO "icon_items" VALUES (41, 2, '网易BUFF', 'https://buff.163.com/', 'buff.png', 19, 1, 1, NULL, NULL, '2025-08-11 14:20:18', '0');
INSERT INTO "icon_items" VALUES (42, 2, '小黑盒社区', 'https://www.xiaoheihe.cn/app/bbs/home', 'xiaoheihe.png', 20, 1, 1, NULL, NULL, '2025-08-06 10:40:48', '0');
INSERT INTO "icon_items" VALUES (43, 2, '游戏520', 'https://www.gamer520.com/', 'gamer520.png', 21, 1, 1, NULL, NULL, '2025-08-06 10:41:04', '0');
INSERT INTO "icon_items" VALUES (44, 2, '游戏天堂', 'https://www.zzzzz688.com/', 'youxitiantang.png', 22, 1, 1, NULL, NULL, '2025-08-06 10:41:15', '0');
INSERT INTO "icon_items" VALUES (45, 2, '老男人游戏网', 'https://www.oldmantvg.net/', 'oldmantvg.png', 23, 1, 1, NULL, NULL, '2025-08-06 10:41:26', '0');
INSERT INTO "icon_items" VALUES (46, 2, 'play-cs', 'https://play-cs.com/zh/servers', 'playcs.png', 24, 1, 1, NULL, NULL, '2025-08-06 10:41:32', '0');
INSERT INTO "icon_items" VALUES (47, 1, '12306', 'https://kyfw.12306.cn/', '12306.png', 0, 1, 1, NULL, NULL, '2025-08-06 10:42:00', '0');
INSERT INTO "icon_items" VALUES (48, 1, 'Outlook', 'https://outlook.live.com/', 'outlook.png', 1, 1, 1, NULL, NULL, '2025-08-06 10:42:06', '0');
INSERT INTO "icon_items" VALUES (49, 1, '2925无限邮', 'https://www.2925.com/', '2925.png', 2, 1, 1, NULL, NULL, '2025-08-06 10:42:18', '0');
INSERT INTO "icon_items" VALUES (50, 1, 'QQ邮箱', 'https://mail.qq.com/', 'qqmail.png', 3, 1, 1, NULL, NULL, '2025-08-06 10:42:35', '0');
INSERT INTO "icon_items" VALUES (51, 1, '163邮箱', 'http://mail.163.com/', '163mail.png', 4, 1, 1, NULL, NULL, '2025-08-06 10:42:39', '0');
INSERT INTO "icon_items" VALUES (52, 1, '126邮箱', 'http://www.126.com/', '126mail.png', 5, 1, 1, NULL, NULL, '2025-08-06 10:42:42', '0');
INSERT INTO "icon_items" VALUES (53, 1, '花瓣邮箱', 'https://www.petalmail.com/', 'petalmail.png', 6, 1, 1, NULL, NULL, '2025-08-06 10:42:48', '0');
INSERT INTO "icon_items" VALUES (54, 1, '临时邮箱', 'http://24mail.chacuo.net/', '24mail.png', 7, 1, 1, NULL, NULL, '2025-08-06 10:42:58', '0');
INSERT INTO "icon_items" VALUES (55, 1, 'UP云搜', 'https://www.upyunso.com/', 'upyunso.png', 9, 1, 1, NULL, NULL, '2025-08-06 10:43:07', '0');
INSERT INTO "icon_items" VALUES (56, 1, '123云盘', 'https://www.123pan.com/', '123pan.png', 11, 1, 1, NULL, NULL, '2025-08-06 10:43:11', '0');
INSERT INTO "icon_items" VALUES (57, 1, '阿里云盘', 'http://www.aliyundrive.com/', 'aliyundrive.png', 12, 1, 1, NULL, NULL, '2025-08-06 10:43:14', '0');
INSERT INTO "icon_items" VALUES (58, 1, '百度网盘', 'https://pan.baidu.com/', 'baiduyunpan.png', 13, 1, 1, NULL, NULL, '2025-08-06 10:43:18', '0');
INSERT INTO "icon_items" VALUES (59, 1, '夸克云盘', 'https://pan.quark.cn/', 'quark.png', 14, 1, 1, NULL, NULL, '2025-08-06 10:43:36', '0');
INSERT INTO "icon_items" VALUES (60, 1, '蓝奏云', 'http://pan.lanzou.com/', 'lanzou.png', 15, 1, 1, NULL, NULL, '2025-08-06 10:44:01', '0');
INSERT INTO "icon_items" VALUES (61, 1, '天翼云盘', 'https://cloud.189.cn/', '189cloud.png', 16, 1, 1, NULL, NULL, '2025-08-06 10:44:07', '0');
INSERT INTO "icon_items" VALUES (62, 1, '华为云空间', 'https://cloud.huawei.com/', 'huaweicloud.png', 17, 1, 1, NULL, NULL, '2025-08-06 10:52:26', '0');
INSERT INTO "icon_items" VALUES (63, 1, 'OPPO云服务', 'https://cloud.oppo.com/', 'oppocloud.png', 18, 1, 1, NULL, NULL, '2025-08-11 14:25:09', '0');
INSERT INTO "icon_items" VALUES (64, 1, '小布', 'https://xiaobu.coloros.com/chat', 'xiaobu.png', 19, 1, 1, NULL, NULL, '2025-08-11 14:25:52', '0');
INSERT INTO "icon_items" VALUES (65, 1, '豆包AI', 'https://www.doubao.com/', 'doubao.png', 20, 1, 1, NULL, NULL, '2025-08-06 10:44:20', '0');
INSERT INTO "icon_items" VALUES (66, 1, '小艺', 'https://xiaoyi.huawei.com/', 'xiaoyi.png', 21, 1, 1, NULL, NULL, '2025-08-11 14:23:11', '0');
INSERT INTO "icon_items" VALUES (67, 1, '有道翻译', 'http://fanyi.youdao.com/', 'youdao.png', 22, 1, 1, NULL, NULL, '2025-08-06 10:44:34', '0');
INSERT INTO "icon_items" VALUES (68, 1, '腾讯交互翻译', 'https://transmart.qq.com/', 'transmart.png', 23, 1, 1, NULL, NULL, '2025-08-06 10:44:41', '0');
INSERT INTO "icon_items" VALUES (69, 1, '微软翻译', 'https://cn.bing.com/translator/', 'bingtranslator.png', 24, 1, 1, NULL, NULL, '2025-08-08 13:36:44', '0');
INSERT INTO "icon_items" VALUES (70, 1, '问答库', 'https://www.asklib.com/', 'asklib.png', 25, 1, 1, NULL, NULL, '2025-08-06 10:44:55', '0');
INSERT INTO "icon_items" VALUES (71, 0, 'NGA', 'http://bbs.ngacn.cc/', 'ngacn.png', 25, 1, 1, NULL, NULL, '2025-08-11 16:58:55', '0');
INSERT INTO "icon_items" VALUES (72, 0, '天涯社区', 'https://www.tianya.org', 'tianya.png', 26, 1, 1, NULL, NULL, '2025-08-20 09:30:21', '0');
INSERT INTO "icon_items" VALUES (73, 1, '高德地图', 'http://ditu.amap.com/', 'gaode.png', 26, 1, 1, NULL, NULL, '2025-08-11 16:12:59', '0');
INSERT INTO "icon_items" VALUES (74, 0, '知乎盐选库pwd：rydw', 'https://www.yuque.com/dayuyu-ualcu/azo1ge', 'yuque.png', 27, 1, 1, NULL, NULL, '2025-08-11 16:56:41', '0');
INSERT INTO "icon_items" VALUES (75, 0, '我不是盐神', 'https://onehu.xyz/', 'onehu.png', 28, 1, 1, NULL, NULL, '2025-08-11 16:56:46', '0');
INSERT INTO "icon_items" VALUES (76, 0, '盐神居', 'https://saltsgod.com/', 'saltsgod.png', 29, 1, 1, NULL, NULL, '2025-08-11 16:56:49', '0');
INSERT INTO "icon_items" VALUES (77, 0, '沙雕新闻', 'https://shadiao.plus/', 'shadiao.png', 30, 1, 1, NULL, NULL, '2025-08-12 11:04:25', '0');
INSERT INTO "icon_items" VALUES (78, 0, 'ACG港湾', 'https://www.acggw.me/', 'acggw.png', 31, 1, 1, NULL, NULL, '2025-08-13 08:06:18', '0');
INSERT INTO "icon_items" VALUES (79, 1, 'iiice导航', 'https://www.iiice.cn/', 'iiice.png', 27, 1, 1, NULL, NULL, '2025-08-06 10:46:14', '0');
INSERT INTO "icon_items" VALUES (80, 3, '威海社保', 'https://rsjwsfw.weihai.cn/hsp', 'weihaishebao.png', 0, 1, 1, NULL, NULL, '2025-08-06 10:52:50', '0');
INSERT INTO "icon_items" VALUES (81, 3, '威海医保', 'https://whybdwwt.weihai.cn/SmPsc', 'weihaiyibao.png', 1, 1, 1, NULL, NULL, '2025-08-06 10:52:57', '0');
INSERT INTO "icon_items" VALUES (82, 3, '让我帮你百度', 'https://ffis.me/baidu/index.html', 'ff.png', 2, 1, 1, NULL, NULL, '2025-08-06 10:53:13', '0');
INSERT INTO "icon_items" VALUES (83, 3, '无极磁链', 'https://0cili.net/', '0cili.png', 3, 1, 1, NULL, NULL, '2025-08-06 10:53:18', '0');
INSERT INTO "icon_items" VALUES (84, 3, '免费API', 'https://xxapi.cn/', 'xxapi.png', 4, 1, 1, NULL, NULL, '2025-08-06 10:53:29', '0');
INSERT INTO "icon_items" VALUES (85, 3, '在线工具', 'https://tool.lu/', 'zxgj.png', 5, 1, 1, NULL, NULL, '2025-08-06 10:54:25', '0');
INSERT INTO "icon_items" VALUES (86, 3, '即时小工具', 'https://www.67tool.com/', '67tool.png', 6, 1, 1, NULL, NULL, '2025-08-06 10:54:33', '0');
INSERT INTO "icon_items" VALUES (87, 3, '轻工具', 'https://qinggongju.com/', 'qinggongju.png', 7, 1, 1, NULL, NULL, '2025-08-06 10:54:51', '0');
INSERT INTO "icon_items" VALUES (88, 3, '快搜', 'https://search.chongbuluo.com/', 'chongbuluo.png', 8, 1, 1, NULL, NULL, '2025-08-06 10:55:07', '0');
INSERT INTO "icon_items" VALUES (89, 3, '爱搜(盘搜)', 'https://www.esoua.com/', 'esoua.png', 9, 1, 1, NULL, NULL, '2025-08-06 10:55:13', '0');
INSERT INTO "icon_items" VALUES (90, 3, '鸠摩搜索', 'https://www.jiumodiary.com/', 'jiumodiary.png', 10, 1, 1, NULL, NULL, '2025-08-08 13:38:29', '0');
INSERT INTO "icon_items" VALUES (91, 3, '开发者搜索', 'https://kaifa.baidu.com/', 'kaifasearch.png', 11, 1, 1, NULL, NULL, '2025-08-06 10:55:38', '0');
INSERT INTO "icon_items" VALUES (92, 3, 'GreenVideo', 'https://greenvideo.cc/', 'GreenVideo.png', 12, 1, 1, NULL, NULL, '2025-08-06 10:55:41', '0');
INSERT INTO "icon_items" VALUES (93, 3, 'WallpapersCraft', 'https://wallpaperscraft.com/', 'wallpaperscraft.png', 13, 1, 1, NULL, NULL, '2025-08-06 10:55:50', '0');
INSERT INTO "icon_items" VALUES (94, 6, '极简壁纸', 'https://bz.zzzmh.cn/', 'zzzmh.png', 12, 1, 1, NULL, NULL, '2025-08-19 09:47:54', '0');
INSERT INTO "icon_items" VALUES (95, 3, 'iconKit', 'https://iconkit.cn/', 'iconkit.png', 14, 1, 1, NULL, NULL, '2025-08-06 10:56:27', '0');
INSERT INTO "icon_items" VALUES (96, 3, 'appicons', 'https://appicons.co/', 'appicons.png', 15, 1, 1, NULL, NULL, '2025-08-06 10:56:31', '0');
INSERT INTO "icon_items" VALUES (97, 3, '阿里图标库', 'https://www.iconfont.cn/', 'iconfont.png', 16, 1, 1, NULL, NULL, '2025-08-06 10:56:35', '0');
INSERT INTO "icon_items" VALUES (98, 3, '哲风壁纸', 'https://haowallpaper.com/', 'haowallpaper.png', 18, 1, 1, NULL, NULL, '2025-08-06 10:56:39', '0');
INSERT INTO "icon_items" VALUES (99, 3, '雨滴美化社区', 'https://bbs.rainmeter.cn/forum.php', 'rainmeter.png', 19, 1, 1, NULL, NULL, '2025-08-08 13:39:20', '0');
INSERT INTO "icon_items" VALUES (100, 3, '致美化', 'http://zhutix.com/', 'zhutix.png', 20, 1, 1, NULL, NULL, '2025-08-06 10:56:51', '0');
INSERT INTO "icon_items" VALUES (101, 3, '背景生成', 'https://bggenerator.com/', 'bggenerator.png', 21, 1, 1, NULL, NULL, '2025-08-06 10:57:00', '0');
INSERT INTO "icon_items" VALUES (102, 3, '短网址', 'https://www.urlc.cn/user', 'urlc.png', 22, 1, 1, NULL, NULL, '2025-08-11 14:49:12', '0');
INSERT INTO "icon_items" VALUES (103, 3, 'ITDOG', 'https://www.itdog.cn/', 'itdog.png', 23, 1, 1, NULL, NULL, '2025-08-06 10:57:12', '0');
INSERT INTO "icon_items" VALUES (104, 3, '和风天气API', 'https://console.qweather.com/', 'qweather.png', 24, 1, 1, NULL, NULL, '2025-08-06 10:57:20', '0');
INSERT INTO "icon_items" VALUES (105, 3, '各国网址', 'http://www.world68.com/country.asp', 'world68.png', 25, 1, 1, NULL, NULL, '2025-08-06 10:57:26', '0');
INSERT INTO "icon_items" VALUES (106, 3, '奇趣网站收藏', 'https://fuun.fun/', 'fuun.png', 26, 1, 1, NULL, NULL, '2025-08-06 10:57:33', '0');
INSERT INTO "icon_items" VALUES (107, 3, '资源收藏夹', 'https://zyscj.com/', 'zyscj.png', 27, 1, 1, NULL, NULL, '2025-08-06 10:57:38', '0');
INSERT INTO "icon_items" VALUES (108, 3, '书签地球', 'https://www.bookmarkearth.cn/', 'bookmarkearth.png', 28, 1, 1, NULL, NULL, '2025-08-06 10:57:45', '0');
INSERT INTO "icon_items" VALUES (109, 3, '乐于分享', 'https://fffxx.com/', 'fffxx.png', 29, 1, 1, NULL, NULL, '2025-08-06 10:57:50', '0');
INSERT INTO "icon_items" VALUES (110, 3, 'pushkeenai', 'https://pushkeen.ai/', 'pushkeen.png', 30, 1, 1, NULL, NULL, '2025-08-11 16:58:01', '0');
INSERT INTO "icon_items" VALUES (111, 3, '图片转换', 'https://to.imagestool.com/zh-CN/', 'ImagesTool.png', 31, 1, 1, NULL, NULL, '2025-08-06 10:58:09', '0');
INSERT INTO "icon_items" VALUES (112, 3, '中国省份', 'https://vultr.youmu.moe/quiz/', 'chinap.png', 32, 1, 1, NULL, NULL, '2025-08-06 10:58:46', '0');
INSERT INTO "icon_items" VALUES (113, 3, 'OpenWeather', 'https://home.openweathermap.org/', 'openweather.png', 33, 1, 1, NULL, NULL, '2025-08-06 11:07:47', '0');
INSERT INTO "icon_items" VALUES (114, 3, '斗图', 'https://www.doutupk.com/', 'doutupk.png', 34, 1, 1, NULL, NULL, '2025-08-06 10:59:12', '0');
INSERT INTO "icon_items" VALUES (115, 3, '幕布', 'https://mubu.com/list', 'mubu.png', 35, 1, 1, NULL, NULL, '2025-08-06 10:59:20', '0');
INSERT INTO "icon_items" VALUES (116, 3, '墨刀', 'https://modao.cc/', 'modao.png', 36, 1, 1, NULL, NULL, '2025-08-06 10:59:25', '0');
INSERT INTO "icon_items" VALUES (117, 3, '椰子', 'http://h5.yezi86.com:90/#/login', 'yezi.png', 37, 1, 1, NULL, NULL, '2025-08-06 10:59:32', '0');
INSERT INTO "icon_items" VALUES (118, 3, '虫洞传输', 'https://wormhole.app/', 'wormhole.png', 38, 1, 1, NULL, NULL, '2025-08-06 10:59:39', '0');
INSERT INTO "icon_items" VALUES (119, 6, '奶牛快传', 'https://www.cowtransfer.com/', 'cowtransfer.png', 14, 1, 1, NULL, NULL, '2026-03-24 17:27:17', '0');
INSERT INTO "icon_items" VALUES (120, 3, 'versus对比', 'https://versus.com/cn', 'versus.png', 39, 1, 1, NULL, NULL, '2025-08-06 10:59:55', '0');
INSERT INTO "icon_items" VALUES (121, 3, 'CPU天梯图', 'https://topic.expreview.com/CPU/', 'cpugpu.png', 40, 1, 1, NULL, NULL, '2025-08-06 11:00:04', '0');
INSERT INTO "icon_items" VALUES (122, 3, 'GPU天梯图', 'https://topic.expreview.com/GPU/', 'cpugpu.png', 41, 1, 1, NULL, NULL, '2025-08-06 11:00:07', '0');
INSERT INTO "icon_items" VALUES (123, 3, '中科大测速', 'https://test.ustc.edu.cn/', 'zkdcs.png', 42, 1, 1, NULL, NULL, '2025-08-06 11:00:12', '0');
INSERT INTO "icon_items" VALUES (124, 4, 'GitHub', 'https://github.com/', 'github-black.png', 0, 1, 1, NULL, NULL, '2025-08-06 11:00:33', '0');
INSERT INTO "icon_items" VALUES (125, 4, 'Gitee', 'https://gitee.com/', 'gitee.png', 2, 1, 1, NULL, NULL, '2025-08-11 14:43:03', '0');
INSERT INTO "icon_items" VALUES (126, 4, '油叉镜像站', 'https://gf.qytechs.cn/zh-CN', 'greasyfork.png', 3, 1, 1, NULL, NULL, '2025-08-11 14:44:24', '0');
INSERT INTO "icon_items" VALUES (127, 4, 'Greasy', 'https://greasyfork.org/zh-CN', 'greasyfork.png', 4, 1, 1, NULL, NULL, '2025-08-11 14:43:42', '0');
INSERT INTO "icon_items" VALUES (128, 4, 'CSDN', 'http://www.csdn.net/', 'CSDN.png', 5, 1, 1, NULL, NULL, '2025-08-06 11:00:54', '0');
INSERT INTO "icon_items" VALUES (129, 4, '菜鸟教程', 'http://www.runoob.com/', 'runoob.png', 7, 1, 1, NULL, NULL, '2025-08-11 14:45:24', '0');
INSERT INTO "icon_items" VALUES (130, 4, 'Ubuntu中文论坛', 'http://forum.ubuntu.org.cn/', 'ubuntu.png', 8, 1, 1, NULL, NULL, '2025-08-11 14:47:18', '0');
INSERT INTO "icon_items" VALUES (131, 4, 'Rocky Linux', 'https://www.rockylinux.cn/', 'rockylinux.png', 9, 1, 1, NULL, NULL, '2025-08-11 14:46:32', '0');
INSERT INTO "icon_items" VALUES (132, 4, '达梦8下载', 'https://eco.dameng.com/download/', 'dameng.png', 10, 1, 1, NULL, NULL, '2025-08-11 14:47:52', '0');
INSERT INTO "icon_items" VALUES (133, 4, 'OpenEuler(linux)', 'https://www.openeuler.org/zh/learn/mooc/detail/', 'OpenEuler.png', 11, 1, 1, NULL, NULL, '2025-08-11 14:45:54', '0');
INSERT INTO "icon_items" VALUES (134, 4, 'MSDN,我告诉你', 'https://msdn.itellyou.cn/', 'MSDN.png', 12, 1, 1, NULL, NULL, '2025-08-06 11:01:54', '0');
INSERT INTO "icon_items" VALUES (135, 4, '不忘初心win', 'https://www.pc528.net/', 'pc528.png', 13, 1, 1, NULL, NULL, '2025-08-06 11:01:59', '0');
INSERT INTO "icon_items" VALUES (136, 4, '软件开源替代', 'https://openalternative.co/', 'openalternative.png', 14, 1, 1, NULL, NULL, '2025-08-06 11:02:04', '0');
INSERT INTO "icon_items" VALUES (137, 4, '3DM软件', 'https://soft.3dmgame.com/', '3dm.png', 15, 1, 1, NULL, NULL, '2025-08-11 14:42:40', '0');
INSERT INTO "icon_items" VALUES (138, 4, '绿软小站', 'https://www.gndown.com/', 'gndown.png', 16, 1, 1, NULL, NULL, '2025-08-06 11:02:28', '0');
INSERT INTO "icon_items" VALUES (139, 4, '果核剥壳', 'https://www.ghxi.com/', 'ghxi.png', 17, 1, 1, NULL, NULL, '2025-08-06 11:02:32', '0');
INSERT INTO "icon_items" VALUES (140, 4, '开源中国', 'http://www.oschina.net/', 'oschina.png', 18, 1, 1, NULL, NULL, '2025-08-11 14:41:26', '0');
INSERT INTO "icon_items" VALUES (141, 4, '正版中国', 'https://getitfree.cn/', 'getitfree.png', 19, 1, 1, NULL, NULL, '2025-08-11 14:27:07', '0');
INSERT INTO "icon_items" VALUES (142, 4, 'apkPremier', 'https://apkpremier.com/', 'apkpremier.png', 20, 1, 1, NULL, NULL, '2025-08-06 11:03:22', '0');
INSERT INTO "icon_items" VALUES (143, 4, '酷安网', 'http://www.coolapk.com/', 'coolapk.png', 21, 1, 1, NULL, NULL, '2025-08-06 11:03:29', '0');
INSERT INTO "icon_items" VALUES (144, 4, 'ihack软件', 'https://ihacksoft.com/', 'ihacksoft.png', 22, 1, 1, NULL, NULL, '2025-08-06 11:03:41', '0');
INSERT INTO "icon_items" VALUES (145, 4, '异星软件空间', 'http://yx.bsh.me/', 'yxbsh.png', 23, 1, 1, NULL, NULL, '2025-08-06 11:03:51', '0');
INSERT INTO "icon_items" VALUES (146, 4, '专注于Win7', 'https://www.newxitong.com/', 'newxitong.png', 24, 1, 1, NULL, NULL, '2025-08-06 11:03:57', '0');
INSERT INTO "icon_items" VALUES (147, 4, '资源铺', 'https://zypuu.com/', 'zypuu.png', 25, 1, 1, NULL, NULL, '2025-08-06 11:04:03', '0');
INSERT INTO "icon_items" VALUES (148, 4, 'Pitahaya', 'https://rowling7.github.io/Pitahaya/', '', 26, 1, 1, NULL, NULL, '2026-05-06 06:49:17', '0');
INSERT INTO "icon_items" VALUES (149, 5, 'Linux命令', 'https://zhuanlan.zhihu.com/p/560751712', 'zhihu.png', 0, 1, 1, NULL, NULL, '2025-08-06 11:04:16', '0');
INSERT INTO "icon_items" VALUES (150, 5, 'aigei加载图标', 'https://www.aigei.com/lib/gif/jia_zai_xu/', 'aigei.png', 1, 1, 1, NULL, NULL, '2025-08-06 11:04:23', '0');
INSERT INTO "icon_items" VALUES (151, 5, 'LKSSite', 'https://lkssite.vip/', 'LKSSite.png', 2, 1, 1, NULL, NULL, '2025-08-06 11:04:34', '0');
INSERT INTO "icon_items" VALUES (152, 5, 'ik009', 'https://www.ik009.top/', NULL, 3, 1, 1, NULL, NULL, '2025-08-21 09:35:04', '0');
INSERT INTO "icon_items" VALUES (153, 5, 'xx01', 'https://d4.xx01.my/', NULL, 4, 1, 1, NULL, NULL, '2025-08-21 09:34:45', '0');
INSERT INTO "icon_items" VALUES (154, 5, 'xiuren', 'https://w7.xiuren.ee/', NULL, 5, 1, 1, NULL, NULL, '2025-08-21 09:34:11', '0');
INSERT INTO "icon_items" VALUES (155, 5, 'Random', 'http://localhost:3000/random.html', NULL, 6, 1, 1, NULL, '2025-08-08 13:25:37', '2025-08-21 09:33:47', '0');
INSERT INTO "icon_items" VALUES (156, 5, 'Ballerina', 'https://ww1.lookmovie.pn/movies/play/7181546-ballerina-2025?ref=os&utm_source=osub_sub&imdb=tt7181546&term=Ballerina&sub=13174865', NULL, 7, 1, 1, NULL, '2025-08-08 13:25:24', '2025-08-21 09:33:25', '0');
INSERT INTO "icon_items" VALUES (157, 5, 'koipb', 'https://koipb.com/', NULL, 8, 1, 1, NULL, '2025-08-08 13:25:35', '2025-08-21 09:33:00', '0');
INSERT INTO "icon_items" VALUES (158, 5, '----------', 'http://localhost:3000/', '', 10, 1, 1, NULL, '2025-08-08 13:25:32', '2026-05-06 06:50:25', '0');
INSERT INTO "icon_items" VALUES (159, 5, '----------', 'http://localhost:3000/', '', 11, 1, 1, NULL, NULL, '2026-05-06 06:53:42', '0');
INSERT INTO "icon_items" VALUES (160, 6, 'MVCAT', 'https://www.mvcat.com/', 'MVCAT.png', 0, 1, 1, NULL, NULL, '2025-08-06 11:04:39', '0');
INSERT INTO "icon_items" VALUES (161, 6, 'трекер RuTrac', 'http://rutracker.org/forum/index.php', 'rut.png', 1, 1, 1, NULL, NULL, '2025-08-06 11:04:53', '0');
INSERT INTO "icon_items" VALUES (162, 6, '影视', 'https://www.yjys02.com/', 'yjys02.png', 2, 1, 1, NULL, NULL, '2025-08-06 11:05:04', '0');
INSERT INTO "icon_items" VALUES (163, 6, 'Tinywow', 'https://tinywow.com/', 'tinywow.png', 4, 1, 1, NULL, NULL, '2025-08-06 11:05:08', '0');
INSERT INTO "icon_items" VALUES (164, 6, 'FMHY', 'https://fmhy.net/', 'fmhy.png', 5, 1, 1, NULL, NULL, '2025-08-06 11:05:17', '0');
INSERT INTO "icon_items" VALUES (165, 6, '423Down', 'http://www.423down.com/', '423Down.png', 6, 1, 1, NULL, NULL, '2025-08-06 11:05:20', '0');
INSERT INTO "icon_items" VALUES (166, 6, 'APK下载', 'https://apk.bot/', 'apkdn.png', 7, 1, 1, NULL, NULL, '2025-08-06 11:05:23', '0');
INSERT INTO "icon_items" VALUES (167, 6, '蓝鲨', 'https://www.lsapk.com/', 'lsapk.png', 8, 1, 1, NULL, NULL, '2025-08-06 11:05:37', '0');
INSERT INTO "icon_items" VALUES (168, 6, '老殁|殁漂遥', 'https://mpyit.com/', 'mpyit.png', 9, 1, 1, NULL, NULL, '2025-08-06 11:05:40', '0');
INSERT INTO "icon_items" VALUES (169, 6, '绿色软件', 'http://www.xdowns.com/', 'xdowns.png', 10, 1, 1, NULL, NULL, '2025-08-06 11:05:44', '0');
INSERT INTO "icon_items" VALUES (170, 6, '亿破姐', 'https://www.ypojie.com/', 'ypojie.png', 11, 1, 1, NULL, NULL, '2025-08-06 11:05:47', '0');
INSERT INTO "icon_items" VALUES (171, 3, '鼠标测试', 'https://www.mousetester.cn/', 'mousetest.png', 43, 1, 1, NULL, NULL, '2025-08-06 11:00:22', '0');
INSERT INTO "icon_items" VALUES (172, 1, 'BootstrapIcon', 'https://icons.getbootstrap.com/', 'BootstrapIcon.png', 28, 1, 1, '2025-08-05 16:49:59', NULL, '2025-08-05 16:50:38', '0');
INSERT INTO "icon_items" VALUES (173, 5, 'weibo', 'https://icons.getbootstrap.com/?q=weibo', 'weibo.png', 12, 1, 1, '2025-08-05 16:52:59', NULL, '2025-09-25 19:50:06', '0');
INSERT INTO "icon_items" VALUES (174, 3, 'Flaticon', 'https://www.flaticon.com/', 'Flaticon.png', 17, 1, 1, '2025-08-11 14:10:57', NULL, '2025-08-11 15:56:44', '0');
INSERT INTO "icon_items" VALUES (175, 1, '企业邮箱', 'https://mail.weigaogroup.com/', 'qiyeyouxiang.png', 10, 1, 1, '2025-08-11 15:31:51', NULL, '2025-08-11 15:46:03', '0');
INSERT INTO "icon_items" VALUES (176, 0, '发表情', 'https://www.fabiaoqing.com/', 'fabiaoqing.png', 32, 1, 1, '2025-08-14 11:10:06', NULL, '2025-08-15 08:40:40', '0');
INSERT INTO "icon_items" VALUES (177, 3, 'Bing每日壁纸', 'https://bing.ee123.net', 'Bingwallpaper.png', 44, 1, 1, '2025-08-14 11:12:24', NULL, NULL, '0');
INSERT INTO "icon_items" VALUES (178, 3, '菜鸟图标', 'https://icon.sucai999.com/', 'sucai999.png', 45, 1, 1, '2025-08-14 17:20:56', NULL, '2025-08-19 13:28:41', '0');
INSERT INTO "icon_items" VALUES (179, 2, '游戏科学', 'https://gamesci.cn/', 'gamesci.png', 25, 1, 1, '2025-08-20 13:30:26', NULL, '2025-08-20 13:31:33', '0');
INSERT INTO "icon_items" VALUES (180, 2, '黑色沙漠手游', 'https://www.world.blackdesertm.com/', 'blackdesert.png', 26, 1, 1, '2025-08-20 13:42:29', NULL, '2025-08-22 11:00:32', '0');
INSERT INTO "icon_items" VALUES (181, 2, 'Ubisoft', 'https://zh-cn.ubisoft.com/', 'Ubisoft.png', 10, 1, 1, '2025-08-27 09:29:25', NULL, '2025-08-27 10:03:10', '0');
INSERT INTO "icon_items" VALUES (182, 2, 'Epicgames', 'https://store.epicgames.com/zh-CN/', 'Epicgames.png', 9, 1, 1, '2025-08-27 09:35:38', NULL, '2025-08-27 10:03:14', '0');
INSERT INTO "icon_items" VALUES (183, 2, 'EA', 'https://www.ea.com/zh-cn', 'ea.png', 8, 1, 1, '2025-08-27 09:47:28', NULL, '2025-08-27 10:03:17', '0');
INSERT INTO "icon_items" VALUES (184, 2, 'CSOL', 'https://csol.tiancity.com/homepage/v6/index.html', 'csol.png', 27, 1, 1, '2025-08-27 09:53:33', NULL, '2025-08-27 09:54:41', '0');
INSERT INTO "icon_items" VALUES (185, 0, '淘宝', 'https://www.taobao.com', 'taobao.png', 33, 1, 1, '2025-08-27 10:05:02', NULL, NULL, '0');
INSERT INTO "icon_items" VALUES (186, 0, '京东', 'https://www.jd.com', 'jingdong.png', 34, 1, 1, '2025-08-27 10:06:01', NULL, NULL, '0');
INSERT INTO "icon_items" VALUES (187, 0, '拼多多-手机版', 'https://mobile.pinduoduo.com', 'pinduoduo.png', 31, 1, 1, '2025-08-27 10:07:25', '2025-08-27 13:09:30', NULL, '1');
INSERT INTO "icon_items" VALUES (188, 0, '3Q影视', 'https://qqqys.com/', '3q.png', 17, 1, 1, '2025-09-22 19:21:41', NULL, '2025-09-22 19:22:39', '0');
INSERT INTO "icon_items" VALUES (189, 0, 'LibVio', 'https://www.libvio.cc/', 'LibVio.png', 18, 1, 1, '2025-09-25 11:55:35', NULL, '2025-09-25 11:56:54', '0');
INSERT INTO "icon_items" VALUES (190, 4, 'LMDocker', 'https://10.131.3.166:9443/#!/auth', 'LMDocker.png', 27, 1, 1, '2025-09-22 15:44:04', NULL, '2025-09-22 15:44:15', '0');
INSERT INTO "icon_items" VALUES (191, 3, '节假日API', 'https://www.jiejiariapi.com/', 'jiejiariapi.png', 46, 1, 1, '2025-09-16 17:01:22', NULL, '2025-09-16 17:02:46', '0');
INSERT INTO "icon_items" VALUES (192, 0, '一元机场', 'https://cat.xn--4gq62f52gdss.plus//#/?link=LyMvZGFzaGJvYXJk', 'yiyuan.png', 35, 1, 1, '2025-09-25 12:38:22', NULL, NULL, '0');
INSERT INTO "icon_items" VALUES (193, 1, 'Gmail', 'https://mail.google.com/', 'Gmail.png', 8, 1, 1, '2025-09-25 12:43:51', NULL, '2025-09-25 12:45:06', '0');
INSERT INTO "icon_items" VALUES (194, 0, 'Youtube', 'https://youtube.com/', 'youtube.png', 23, 1, 1, '2025-09-25 19:17:04', NULL, '2025-09-25 19:17:18', '0');
INSERT INTO "icon_items" VALUES (195, 1, 'Infinity', 'https://inftab.com/', 'static/ico/loading0.gif', 39, 1, 1, '2025-10-15 21:56:36', '2026-05-04 16:49:08', '2026-05-12 09:31:33', '0');
INSERT INTO "icon_items" VALUES (196, 4, 'Gradle镜像', 'https://mirrors.cloud.tencent.com/gradle/', 'gradlemirrors.png', 6, 1, 1, '2025-10-28 10:55:19', NULL, '2025-10-28 11:06:30', '0');
INSERT INTO "icon_items" VALUES (197, 0, 'X', 'https://x.com/', 'x.png', 24, 1, 1, '2025-11-24 14:38:33', NULL, '2025-11-24 14:39:07', '0');
INSERT INTO "icon_items" VALUES (198, 4, 'Github下载', 'https://github.akams.cn/', 'githubakams.png', 1, 1, 1, '2025-12-24 08:02:57', NULL, '2025-12-24 08:03:41', '0');
INSERT INTO "icon_items" VALUES (199, 3, '光标', 'https://sweezy-cursors.com/', 'guangbiao.png', 47, 1, 1, '2026-01-10 16:26:29', NULL, NULL, '0');
INSERT INTO "icon_items" VALUES (200, 3, '抖音解析', 'http://cnsygh.net/', 'douyin.png', 48, 1, 1, '2026-01-10 17:34:05', NULL, '2026-01-10 17:34:52', '0');
INSERT INTO "icon_items" VALUES (201, 3, 'BILI下载', 'https://snapany.com/zh/bilibili', 'snapany.png', 49, 1, 1, '2026-01-10 17:47:24', NULL, NULL, '0');
INSERT INTO "icon_items" VALUES (202, 3, 'mtldss', 'https://mtldss.top/', 'mtldss.png', 50, 1, 1, '2026-02-23 12:26:46', NULL, NULL, '0');
INSERT INTO "icon_items" VALUES (203, 0, '耐视点播', 'https://nsvod.me/', 'nsvod.png', 12, 1, 1, '2026-04-23 11:32:58', NULL, '2026-04-23 11:33:02', '0');
INSERT INTO "icon_items" VALUES (217, 0, 'ACER鼠标设置', 'https://s2i21.yjx2012.com/detail?productName=USB+Receiver', 'acer.png', 36, 1, 1, NULL, NULL, '2026-05-11 01:16:22', '0');
INSERT INTO "icon_items" VALUES (219, 3, 'SVG转PNG', 'https://svgtopng.com/zh/', 'static/ico/svg2png.png', NULL, 1, 1, NULL, NULL, NULL, '0');
INSERT INTO "icon_items" VALUES (220, 0, '小红书', 'https://www.xiaohongshu.com/', 'static/ico/xiaohongshu.png', 37, 1, 1, NULL, NULL, NULL, '0');
INSERT INTO "icon_items" VALUES (221, 0, 'Twitter', 'https://twitter.com/', 'static/ico/twitter.png', NULL, 1, 1, NULL, '2026-05-12 02:38:18', '2026-05-12 02:35:41', '1');
INSERT INTO "icon_items" VALUES (222, 0, '今日热榜', 'https://tophub.today/', 'static/ico/tophubtopday.png', 38, 1, 1, NULL, NULL, NULL, '0');
INSERT INTO "icon_items" VALUES (223, 0, '1', '1', 'static/ico/111', NULL, 1, 1, NULL, '2026-05-12 09:13:55', NULL, '1');

-- ----------------------------
-- Auto increment value for icon_items
-- ----------------------------
UPDATE "sqlite_sequence" SET seq = 223 WHERE name = 'icon_items';

-- ----------------------------
-- Indexes structure for table icon_items
-- ----------------------------
CREATE INDEX "idx_icon_items_category_id"
ON "icon_items" (
  "category_id" ASC
);
CREATE INDEX "idx_icon_items_deleted_flag"
ON "icon_items" (
  "deleted_flag" ASC
);
CREATE INDEX "idx_icon_items_sort_order"
ON "icon_items" (
  "sort_order" ASC
);

PRAGMA foreign_keys = true;
