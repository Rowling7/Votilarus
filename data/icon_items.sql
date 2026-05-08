/*
 Navicat Premium Data Transfer

 Source Server         : SQLite-Votilarus
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 08/05/2026 16:41:23
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for icon_items
-- ----------------------------
DROP TABLE IF EXISTS "icon_items";
CREATE TABLE "icon_items" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "sort_order" INTEGER,
  "category_id" INTEGER,
  "title" TEXT,
  "link_url" TEXT,
  "icon_path" TEXT,
  "created_at" DATE,
  "deleted_at" DATE,
  "updated_at" DATE,
  "deleted_flag" TEXT DEFAULT '0',
  FOREIGN KEY ("category_id") REFERENCES "icon_categories" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- ----------------------------
-- Records of icon_items
-- ----------------------------
INSERT INTO "icon_items" VALUES (3, 0, 0, '哔哩哔哩', 'http://www.bilibili.com/', 'static\ico\bilibili.png', NULL, NULL, '2025-08-06 11:06:33', '0');
INSERT INTO "icon_items" VALUES (4, 1, 0, '抖音', 'https://www.douyin.com/', 'static\ico\douyin.png', NULL, NULL, '2025-08-06 11:06:37', '0');
INSERT INTO "icon_items" VALUES (5, 3, 6, '低端影视', 'https://ddys.pro/', 'static\ico\ddys.png', NULL, NULL, '2025-11-07 10:58:49', '0');
INSERT INTO "icon_items" VALUES (6, 2, 0, '音范丝', 'https://www.yinfans.me/', 'static\ico\yinfansi.png', NULL, NULL, '2025-08-06 11:06:48', '0');
INSERT INTO "icon_items" VALUES (7, 3, 0, '知乎', 'https://www.zhihu.com/', 'static\ico\zhihu.png', NULL, NULL, '2025-08-06 10:34:06', '0');
INSERT INTO "icon_items" VALUES (8, 4, 0, '豆瓣', 'https://movie.douban.com/', 'static\ico\douban.png', NULL, NULL, '2025-08-06 10:34:21', '0');
INSERT INTO "icon_items" VALUES (9, 5, 0, '吾爱破解', 'https://www.52pojie.cn/', 'static\ico\52pojie.png', NULL, NULL, '2025-08-06 10:34:27', '0');
INSERT INTO "icon_items" VALUES (10, 6, 0, '新浪微博', 'http://weibo.com/', 'static\ico\weibo.png', NULL, NULL, '2025-08-06 10:34:36', '0');
INSERT INTO "icon_items" VALUES (11, 7, 0, '一加ROM', 'https://yun.daxiaamu.com/', 'static\ico\1plusrom.png', NULL, NULL, '2025-08-11 14:19:11', '0');
INSERT INTO "icon_items" VALUES (12, 8, 0, '最右', 'https://www.izuiyou.com/', 'static\ico\zuiyou.png', NULL, NULL, '2025-08-06 10:35:16', '0');
INSERT INTO "icon_items" VALUES (13, 9, 0, 'lookmovie', 'https://ww1.lookmovie.pn/', 'static\ico\lookmovie.png', NULL, NULL, '2025-08-06 10:35:21', '0');
INSERT INTO "icon_items" VALUES (14, 10, 0, 'opensubtitles', 'https://www.opensubtitles.org/', 'static\ico\opensubtitles.png', NULL, NULL, '2025-08-08 13:35:37', '0');
INSERT INTO "icon_items" VALUES (15, 11, 0, '奈飞影视', 'https://www.netflixgc.com/', 'static\ico\netflixgc.png', NULL, NULL, '2025-08-06 10:36:25', '0');
INSERT INTO "icon_items" VALUES (16, 13, 0, '盘库吧', 'https://panku8.com/', 'static\ico\pankuba.png', NULL, NULL, '2025-08-06 10:36:30', '0');
INSERT INTO "icon_items" VALUES (17, 14, 0, 'Seedhub', 'https://www.seedhub.cc/', 'static\ico\seedhub.png', NULL, NULL, '2025-08-06 10:36:38', '0');
INSERT INTO "icon_items" VALUES (18, 15, 0, '80s电影网', 'https://y80s.net/', 'static\ico\80smovies.png', NULL, NULL, '2025-08-11 14:17:24', '0');
INSERT INTO "icon_items" VALUES (19, 16, 0, '低端影视001', 'https://ddys001.com/', 'static\ico\ddys001.png', NULL, NULL, '2025-08-06 10:37:06', '0');
INSERT INTO "icon_items" VALUES (20, 20, 0, '虎牙直播', 'http://www.huya.com/', 'static\ico\huya.png', NULL, NULL, '2025-12-29 20:28:02', '0');
INSERT INTO "icon_items" VALUES (21, 21, 0, '斗鱼', 'http://www.douyutv.com/', 'static\ico\douyu.png', NULL, NULL, '2025-08-12 10:36:42', '0');
INSERT INTO "icon_items" VALUES (22, 19, 0, 'Spotify', 'https://open.spotify.com/browse', 'static\ico\spotify.png', NULL, NULL, '2025-08-06 10:37:34', '0');
INSERT INTO "icon_items" VALUES (23, 22, 0, 'Instagram', 'https://www.instagram.com/', 'static\ico\instagram.png', NULL, NULL, '2025-08-06 10:37:40', '0');
INSERT INTO "icon_items" VALUES (24, 0, 2, '游戏下载', 'https://koyso.to/', 'static\ico\koyso.png', NULL, NULL, '2025-08-06 10:37:53', '0');
INSERT INTO "icon_items" VALUES (25, 1, 2, '资源避难所', 'https://www.flysheep6.com/', 'static\ico\flysheep6.png', NULL, NULL, '2025-08-06 10:38:06', '0');
INSERT INTO "icon_items" VALUES (26, 2, 2, '9dgames', 'http://www.9dmgamemod.com/', 'static\ico\9dgames.png', NULL, NULL, '2025-08-06 10:38:10', '0');
INSERT INTO "icon_items" VALUES (27, 3, 2, 'CSGO', 'http://www.csgo.com.cn/', 'static\ico\csgo.png', NULL, NULL, '2025-08-11 14:15:34', '0');
INSERT INTO "icon_items" VALUES (28, 13, 6, 'GBT游戏', 'http://gbtgame.ysepan.com/', 'static\ico\gbtgame.png', NULL, NULL, '2025-09-25 08:05:25', '0');
INSERT INTO "icon_items" VALUES (29, 4, 2, 'GooglePlay', 'https://play.google.com/', 'static\ico\googleplay.png', NULL, NULL, '2025-08-06 10:38:34', '0');
INSERT INTO "icon_items" VALUES (30, 5, 2, 'MOD网站', 'https://www.nexusmods.com/', 'static\ico\nexusmods.png', NULL, NULL, '2025-08-11 16:32:16', '0');
INSERT INTO "icon_items" VALUES (31, 6, 2, 'slowroads', 'https://slowroads.io/', 'static\ico\slowroads.png', NULL, NULL, '2025-08-11 16:15:51', '0');
INSERT INTO "icon_items" VALUES (32, 7, 2, 'Steam', 'https://store.steampowered.com/', 'static\ico\steam.png', NULL, NULL, '2025-08-06 10:38:58', '0');
INSERT INTO "icon_items" VALUES (33, 11, 2, 'SteamDB', 'https://steamdb.info/', 'static\ico\steamdb.png', NULL, NULL, '2025-08-06 10:39:01', '0');
INSERT INTO "icon_items" VALUES (34, 12, 2, 'Twitch', 'https://www.twitch.tv/', 'static\ico\twitch.png', NULL, NULL, '2025-08-06 10:39:04', '0');
INSERT INTO "icon_items" VALUES (35, 13, 2, 'yorg.io', 'https://yorg.io/', 'static\ico\yorg.png', NULL, NULL, '2025-08-06 10:39:08', '0');
INSERT INTO "icon_items" VALUES (36, 14, 2, '单机游戏', 'https://steamzg.com/', 'static\ico\steamzg.png', NULL, NULL, '2025-08-06 10:39:27', '0');
INSERT INTO "icon_items" VALUES (37, 15, 2, '米哈社', 'https://www.scyo123p8191.com/', 'static\ico\scyo123p8191.png', NULL, NULL, '2025-08-06 10:39:35', '0');
INSERT INTO "icon_items" VALUES (38, 16, 2, '摸鱼小游戏', 'https://poki.com/zh', 'static\ico\poki.png', NULL, NULL, '2025-08-06 10:39:51', '0');
INSERT INTO "icon_items" VALUES (39, 17, 2, '摸鱼专区', 'https://www.oschina.net/group/fishfish', 'static\ico\oschinagame.png', NULL, NULL, '2025-08-11 14:21:03', '0');
INSERT INTO "icon_items" VALUES (40, 18, 2, '塔防战争', 'https://kiomet.com/', 'static\ico\kiomet.png', NULL, NULL, '2025-08-06 10:40:34', '0');
INSERT INTO "icon_items" VALUES (41, 19, 2, '网易BUFF', 'https://buff.163.com/', 'static\ico\buff.png', NULL, NULL, '2025-08-11 14:20:18', '0');
INSERT INTO "icon_items" VALUES (42, 20, 2, '小黑盒社区', 'https://www.xiaoheihe.cn/app/bbs/home', 'static\ico\xiaoheihe.png', NULL, NULL, '2025-08-06 10:40:48', '0');
INSERT INTO "icon_items" VALUES (43, 21, 2, '游戏520', 'https://www.gamer520.com/', 'static\ico\gamer520.png', NULL, NULL, '2025-08-06 10:41:04', '0');
INSERT INTO "icon_items" VALUES (44, 22, 2, '游戏天堂', 'https://www.zzzzz688.com/', 'static\ico\youxitiantang.png', NULL, NULL, '2025-08-06 10:41:15', '0');
INSERT INTO "icon_items" VALUES (45, 23, 2, '老男人游戏网', 'https://www.oldmantvg.net/', 'static\ico\oldmantvg.png', NULL, NULL, '2025-08-06 10:41:26', '0');
INSERT INTO "icon_items" VALUES (46, 24, 2, 'play-cs', 'https://play-cs.com/zh/servers', 'static\ico\playcs.png', NULL, NULL, '2025-08-06 10:41:32', '0');
INSERT INTO "icon_items" VALUES (47, 0, 1, '12306', 'https://kyfw.12306.cn/', 'static\ico\12306.png', NULL, NULL, '2025-08-06 10:42:00', '0');
INSERT INTO "icon_items" VALUES (48, 1, 1, 'Outlook', 'https://outlook.live.com/', 'static\ico\outlook.png', NULL, NULL, '2025-08-06 10:42:06', '0');
INSERT INTO "icon_items" VALUES (49, 2, 1, '2925无限邮', 'https://www.2925.com/', 'static\ico\2925.png', NULL, NULL, '2025-08-06 10:42:18', '0');
INSERT INTO "icon_items" VALUES (50, 3, 1, 'QQ邮箱', 'https://mail.qq.com/', 'static\ico\qqmail.png', NULL, NULL, '2025-08-06 10:42:35', '0');
INSERT INTO "icon_items" VALUES (51, 4, 1, '163邮箱', 'http://mail.163.com/', 'static\ico\163mail.png', NULL, NULL, '2025-08-06 10:42:39', '0');
INSERT INTO "icon_items" VALUES (52, 5, 1, '126邮箱', 'http://www.126.com/', 'static\ico\126mail.png', NULL, NULL, '2025-08-06 10:42:42', '0');
INSERT INTO "icon_items" VALUES (53, 6, 1, '花瓣邮箱', 'https://www.petalmail.com/', 'static\ico\petalmail.png', NULL, NULL, '2025-08-06 10:42:48', '0');
INSERT INTO "icon_items" VALUES (54, 7, 1, '临时邮箱', 'http://24mail.chacuo.net/', 'static\ico\24mail.png', NULL, NULL, '2025-08-06 10:42:58', '0');
INSERT INTO "icon_items" VALUES (55, 9, 1, 'UP云搜', 'https://www.upyunso.com/', 'static\ico\upyunso.png', NULL, NULL, '2025-08-06 10:43:07', '0');
INSERT INTO "icon_items" VALUES (56, 11, 1, '123云盘', 'https://www.123pan.com/', 'static\ico\123pan.png', NULL, NULL, '2025-08-06 10:43:11', '0');
INSERT INTO "icon_items" VALUES (57, 12, 1, '阿里云盘', 'http://www.aliyundrive.com/', 'static\ico\aliyundrive.png', NULL, NULL, '2025-08-06 10:43:14', '0');
INSERT INTO "icon_items" VALUES (58, 13, 1, '百度网盘', 'https://pan.baidu.com/', 'static\ico\baiduyunpan.png', NULL, NULL, '2025-08-06 10:43:18', '0');
INSERT INTO "icon_items" VALUES (59, 14, 1, '夸克云盘', 'https://pan.quark.cn/', 'static\ico\quark.png', NULL, NULL, '2025-08-06 10:43:36', '0');
INSERT INTO "icon_items" VALUES (60, 15, 1, '蓝奏云', 'http://pan.lanzou.com/', 'static\ico\lanzou.png', NULL, NULL, '2025-08-06 10:44:01', '0');
INSERT INTO "icon_items" VALUES (61, 16, 1, '天翼云盘', 'https://cloud.189.cn/', 'static\ico\189cloud.png', NULL, NULL, '2025-08-06 10:44:07', '0');
INSERT INTO "icon_items" VALUES (62, 17, 1, '华为云空间', 'https://cloud.huawei.com/', 'static\ico\huaweicloud.png', NULL, NULL, '2025-08-06 10:52:26', '0');
INSERT INTO "icon_items" VALUES (63, 18, 1, 'OPPO云服务', 'https://cloud.oppo.com/', 'static\ico\oppocloud.png', NULL, NULL, '2025-08-11 14:25:09', '0');
INSERT INTO "icon_items" VALUES (64, 19, 1, '小布', 'https://xiaobu.coloros.com/chat', 'static\ico\xiaobu.png', NULL, NULL, '2025-08-11 14:25:52', '0');
INSERT INTO "icon_items" VALUES (65, 20, 1, '豆包AI', 'https://www.doubao.com/', 'static\ico\doubao.png', NULL, NULL, '2025-08-06 10:44:20', '0');
INSERT INTO "icon_items" VALUES (66, 21, 1, '小艺', 'https://xiaoyi.huawei.com/', 'static\ico\xiaoyi.png', NULL, NULL, '2025-08-11 14:23:11', '0');
INSERT INTO "icon_items" VALUES (67, 22, 1, '有道翻译', 'http://fanyi.youdao.com/', 'static\ico\youdao.png', NULL, NULL, '2025-08-06 10:44:34', '0');
INSERT INTO "icon_items" VALUES (68, 23, 1, '腾讯交互翻译', 'https://transmart.qq.com/', 'static\ico\transmart.png', NULL, NULL, '2025-08-06 10:44:41', '0');
INSERT INTO "icon_items" VALUES (69, 24, 1, '微软翻译', 'https://cn.bing.com/translator/', 'static\ico\bingtranslator.png', NULL, NULL, '2025-08-08 13:36:44', '0');
INSERT INTO "icon_items" VALUES (70, 25, 1, '问答库', 'https://www.asklib.com/', 'static\ico\asklib.png', NULL, NULL, '2025-08-06 10:44:55', '0');
INSERT INTO "icon_items" VALUES (71, 25, 0, 'NGA', 'http://bbs.ngacn.cc/', 'static\ico\ngacn.png', NULL, NULL, '2025-08-11 16:58:55', '0');
INSERT INTO "icon_items" VALUES (72, 26, 0, '天涯社区', 'https://www.tianya.org', 'static\ico\tianya.png', NULL, NULL, '2025-08-20 09:30:21', '0');
INSERT INTO "icon_items" VALUES (73, 26, 1, '高德地图', 'http://ditu.amap.com/', 'static\ico\gaode.png', NULL, NULL, '2025-08-11 16:12:59', '0');
INSERT INTO "icon_items" VALUES (74, 27, 0, '知乎盐选库pwd：rydw', 'https://www.yuque.com/dayuyu-ualcu/azo1ge', 'static\ico\yuque.png', NULL, NULL, '2025-08-11 16:56:41', '0');
INSERT INTO "icon_items" VALUES (75, 28, 0, '我不是盐神', 'https://onehu.xyz/', 'static\ico\onehu.png', NULL, NULL, '2025-08-11 16:56:46', '0');
INSERT INTO "icon_items" VALUES (76, 29, 0, '盐神居', 'https://saltsgod.com/', 'static\ico\saltsgod.png', NULL, NULL, '2025-08-11 16:56:49', '0');
INSERT INTO "icon_items" VALUES (77, 30, 0, '沙雕新闻', 'https://shadiao.plus/', 'static\ico\shadiao.png', NULL, NULL, '2025-08-12 11:04:25', '0');
INSERT INTO "icon_items" VALUES (78, 31, 0, 'ACG港湾', 'https://www.acggw.me/', 'static\ico\acggw.png', NULL, NULL, '2025-08-13 08:06:18', '0');
INSERT INTO "icon_items" VALUES (79, 27, 1, 'iiice导航', 'https://www.iiice.cn/', 'static\ico\iiice.png', NULL, NULL, '2025-08-06 10:46:14', '0');
INSERT INTO "icon_items" VALUES (80, 0, 3, '威海社保', 'https://rsjwsfw.weihai.cn/hsp', 'static\ico\weihaishebao.png', NULL, NULL, '2025-08-06 10:52:50', '0');
INSERT INTO "icon_items" VALUES (81, 1, 3, '威海医保', 'https://whybdwwt.weihai.cn/SmPsc', 'static\ico\weihaiyibao.png', NULL, NULL, '2025-08-06 10:52:57', '0');
INSERT INTO "icon_items" VALUES (82, 2, 3, '让我帮你百度', 'https://ffis.me/baidu/index.html', 'static\ico\ff.png', NULL, NULL, '2025-08-06 10:53:13', '0');
INSERT INTO "icon_items" VALUES (83, 3, 3, '无极磁链', 'https://0cili.net/', 'static\ico\0cili.png', NULL, NULL, '2025-08-06 10:53:18', '0');
INSERT INTO "icon_items" VALUES (84, 4, 3, '免费API', 'https://xxapi.cn/', 'static\ico\xxapi.png', NULL, NULL, '2025-08-06 10:53:29', '0');
INSERT INTO "icon_items" VALUES (85, 5, 3, '在线工具', 'https://tool.lu/', 'static\ico\zxgj.png', NULL, NULL, '2025-08-06 10:54:25', '0');
INSERT INTO "icon_items" VALUES (86, 6, 3, '即时小工具', 'https://www.67tool.com/', 'static\ico\67tool.png', NULL, NULL, '2025-08-06 10:54:33', '0');
INSERT INTO "icon_items" VALUES (87, 7, 3, '轻工具', 'https://qinggongju.com/', 'static\ico\qinggongju.png', NULL, NULL, '2025-08-06 10:54:51', '0');
INSERT INTO "icon_items" VALUES (88, 8, 3, '快搜', 'https://search.chongbuluo.com/', 'static\ico\chongbuluo.png', NULL, NULL, '2025-08-06 10:55:07', '0');
INSERT INTO "icon_items" VALUES (89, 9, 3, '爱搜(盘搜)', 'https://www.esoua.com/', 'static\ico\esoua.png', NULL, NULL, '2025-08-06 10:55:13', '0');
INSERT INTO "icon_items" VALUES (90, 10, 3, '鸠摩搜索', 'https://www.jiumodiary.com/', 'static\ico\jiumodiary.png', NULL, NULL, '2025-08-08 13:38:29', '0');
INSERT INTO "icon_items" VALUES (91, 11, 3, '开发者搜索', 'https://kaifa.baidu.com/', 'static\ico\kaifasearch.png', NULL, NULL, '2025-08-06 10:55:38', '0');
INSERT INTO "icon_items" VALUES (92, 12, 3, 'GreenVideo', 'https://greenvideo.cc/', 'static\ico\GreenVideo.png', NULL, NULL, '2025-08-06 10:55:41', '0');
INSERT INTO "icon_items" VALUES (93, 13, 3, 'WallpapersCraft', 'https://wallpaperscraft.com/', 'static\ico\wallpaperscraft.png', NULL, NULL, '2025-08-06 10:55:50', '0');
INSERT INTO "icon_items" VALUES (94, 12, 6, '极简壁纸', 'https://bz.zzzmh.cn/', 'static\ico\zzzmh.png', NULL, NULL, '2025-08-19 09:47:54', '0');
INSERT INTO "icon_items" VALUES (95, 14, 3, 'iconKit', 'https://iconkit.cn/', 'static\ico\iconkit.png', NULL, NULL, '2025-08-06 10:56:27', '0');
INSERT INTO "icon_items" VALUES (96, 15, 3, 'appicons', 'https://appicons.co/', 'static\ico\appicons.png', NULL, NULL, '2025-08-06 10:56:31', '0');
INSERT INTO "icon_items" VALUES (97, 16, 3, '阿里图标库', 'https://www.iconfont.cn/', 'static\ico\iconfont.png', NULL, NULL, '2025-08-06 10:56:35', '0');
INSERT INTO "icon_items" VALUES (98, 18, 3, '哲风壁纸', 'https://haowallpaper.com/', 'static\ico\haowallpaper.png', NULL, NULL, '2025-08-06 10:56:39', '0');
INSERT INTO "icon_items" VALUES (99, 19, 3, '雨滴美化社区', 'https://bbs.rainmeter.cn/forum.php', 'static\ico\rainmeter.png', NULL, NULL, '2025-08-08 13:39:20', '0');
INSERT INTO "icon_items" VALUES (100, 20, 3, '致美化', 'http://zhutix.com/', 'static\ico\zhutix.png', NULL, NULL, '2025-08-06 10:56:51', '0');
INSERT INTO "icon_items" VALUES (101, 21, 3, '背景生成', 'https://bggenerator.com/', 'static\ico\bggenerator.png', NULL, NULL, '2025-08-06 10:57:00', '0');
INSERT INTO "icon_items" VALUES (102, 22, 3, '短网址', 'https://www.urlc.cn/user', 'static\ico\urlc.png', NULL, NULL, '2025-08-11 14:49:12', '0');
INSERT INTO "icon_items" VALUES (103, 23, 3, 'ITDOG', 'https://www.itdog.cn/', 'static\ico\itdog.png', NULL, NULL, '2025-08-06 10:57:12', '0');
INSERT INTO "icon_items" VALUES (104, 24, 3, '和风天气API', 'https://console.qweather.com/', 'static\ico\qweather.png', NULL, NULL, '2025-08-06 10:57:20', '0');
INSERT INTO "icon_items" VALUES (105, 25, 3, '各国网址', 'http://www.world68.com/country.asp', 'static\ico\world68.png', NULL, NULL, '2025-08-06 10:57:26', '0');
INSERT INTO "icon_items" VALUES (106, 26, 3, '奇趣网站收藏', 'https://fuun.fun/', 'static\ico\fuun.png', NULL, NULL, '2025-08-06 10:57:33', '0');
INSERT INTO "icon_items" VALUES (107, 27, 3, '资源收藏夹', 'https://zyscj.com/', 'static\ico\zyscj.png', NULL, NULL, '2025-08-06 10:57:38', '0');
INSERT INTO "icon_items" VALUES (108, 28, 3, '书签地球', 'https://www.bookmarkearth.cn/', 'static\ico\bookmarkearth.png', NULL, NULL, '2025-08-06 10:57:45', '0');
INSERT INTO "icon_items" VALUES (109, 29, 3, '乐于分享', 'https://fffxx.com/', 'static\ico\fffxx.png', NULL, NULL, '2025-08-06 10:57:50', '0');
INSERT INTO "icon_items" VALUES (110, 30, 3, 'pushkeenai', 'https://pushkeen.ai/', 'static\ico\pushkeen.png', NULL, NULL, '2025-08-11 16:58:01', '0');
INSERT INTO "icon_items" VALUES (111, 31, 3, '图片转换', 'https://to.imagestool.com/zh-CN/', 'static\ico\ImagesTool.png', NULL, NULL, '2025-08-06 10:58:09', '0');
INSERT INTO "icon_items" VALUES (112, 32, 3, '中国省份', 'https://vultr.youmu.moe/quiz/', 'static\ico\chinap.png', NULL, NULL, '2025-08-06 10:58:46', '0');
INSERT INTO "icon_items" VALUES (113, 33, 3, 'OpenWeather', 'https://home.openweathermap.org/', 'static\ico\openweather.png', NULL, NULL, '2025-08-06 11:07:47', '0');
INSERT INTO "icon_items" VALUES (114, 34, 3, '斗图', 'https://www.doutupk.com/', 'static\ico\doutupk.png', NULL, NULL, '2025-08-06 10:59:12', '0');
INSERT INTO "icon_items" VALUES (115, 35, 3, '幕布', 'https://mubu.com/list', 'static\ico\mubu.png', NULL, NULL, '2025-08-06 10:59:20', '0');
INSERT INTO "icon_items" VALUES (116, 36, 3, '墨刀', 'https://modao.cc/', 'static\ico\modao.png', NULL, NULL, '2025-08-06 10:59:25', '0');
INSERT INTO "icon_items" VALUES (117, 37, 3, '椰子', 'http://h5.yezi86.com:90/#/login', 'static\ico\yezi.png', NULL, NULL, '2025-08-06 10:59:32', '0');
INSERT INTO "icon_items" VALUES (118, 38, 3, '虫洞传输', 'https://wormhole.app/', 'static\ico\wormhole.png', NULL, NULL, '2025-08-06 10:59:39', '0');
INSERT INTO "icon_items" VALUES (119, 14, 6, '奶牛快传', 'https://www.cowtransfer.com/', 'static\ico\cowtransfer.png', NULL, NULL, '2026-03-24 17:27:17', '0');
INSERT INTO "icon_items" VALUES (120, 39, 3, 'versus对比', 'https://versus.com/cn', 'static\ico\versus.png', NULL, NULL, '2025-08-06 10:59:55', '0');
INSERT INTO "icon_items" VALUES (121, 40, 3, 'CPU天梯图', 'https://topic.expreview.com/CPU/', 'static\ico\cpugpu.png', NULL, NULL, '2025-08-06 11:00:04', '0');
INSERT INTO "icon_items" VALUES (122, 41, 3, 'GPU天梯图', 'https://topic.expreview.com/GPU/', 'static\ico\cpugpu.png', NULL, NULL, '2025-08-06 11:00:07', '0');
INSERT INTO "icon_items" VALUES (123, 42, 3, '中科大测速', 'https://test.ustc.edu.cn/', 'static\ico\zkdcs.png', NULL, NULL, '2025-08-06 11:00:12', '0');
INSERT INTO "icon_items" VALUES (124, 0, 4, 'GitHub', 'https://github.com/', 'static\ico\github-black.png', NULL, NULL, '2025-08-06 11:00:33', '0');
INSERT INTO "icon_items" VALUES (125, 2, 4, 'Gitee', 'https://gitee.com/', 'static\ico\gitee.png', NULL, NULL, '2025-08-11 14:43:03', '0');
INSERT INTO "icon_items" VALUES (126, 3, 4, '油叉镜像站', 'https://gf.qytechs.cn/zh-CN', 'static\ico\greasyfork.png', NULL, NULL, '2025-08-11 14:44:24', '0');
INSERT INTO "icon_items" VALUES (127, 4, 4, 'Greasy', 'https://greasyfork.org/zh-CN', 'static\ico\greasyfork.png', NULL, NULL, '2025-08-11 14:43:42', '0');
INSERT INTO "icon_items" VALUES (128, 5, 4, 'CSDN', 'http://www.csdn.net/', 'static\ico\CSDN.png', NULL, NULL, '2025-08-06 11:00:54', '0');
INSERT INTO "icon_items" VALUES (129, 7, 4, '菜鸟教程', 'http://www.runoob.com/', 'static\ico\runoob.png', NULL, NULL, '2025-08-11 14:45:24', '0');
INSERT INTO "icon_items" VALUES (130, 8, 4, 'Ubuntu中文论坛', 'http://forum.ubuntu.org.cn/', 'static\ico\ubuntu.png', NULL, NULL, '2025-08-11 14:47:18', '0');
INSERT INTO "icon_items" VALUES (131, 9, 4, 'Rocky Linux', 'https://www.rockylinux.cn/', 'static\ico\rockylinux.png', NULL, NULL, '2025-08-11 14:46:32', '0');
INSERT INTO "icon_items" VALUES (132, 10, 4, '达梦8下载', 'https://eco.dameng.com/download/', 'static\ico\dameng.png', NULL, NULL, '2025-08-11 14:47:52', '0');
INSERT INTO "icon_items" VALUES (133, 11, 4, 'OpenEuler(linux)', 'https://www.openeuler.org/zh/learn/mooc/detail/', 'static\ico\OpenEuler.png', NULL, NULL, '2025-08-11 14:45:54', '0');
INSERT INTO "icon_items" VALUES (134, 12, 4, 'MSDN,我告诉你', 'https://msdn.itellyou.cn/', 'static\ico\MSDN.png', NULL, NULL, '2025-08-06 11:01:54', '0');
INSERT INTO "icon_items" VALUES (135, 13, 4, '不忘初心win', 'https://www.pc528.net/', 'static\ico\pc528.png', NULL, NULL, '2025-08-06 11:01:59', '0');
INSERT INTO "icon_items" VALUES (136, 14, 4, '软件开源替代', 'https://openalternative.co/', 'static\ico\openalternative.png', NULL, NULL, '2025-08-06 11:02:04', '0');
INSERT INTO "icon_items" VALUES (137, 15, 4, '3DM软件', 'https://soft.3dmgame.com/', 'static\ico\3dm.png', NULL, NULL, '2025-08-11 14:42:40', '0');
INSERT INTO "icon_items" VALUES (138, 16, 4, '绿软小站', 'https://www.gndown.com/', 'static\ico\gndown.png', NULL, NULL, '2025-08-06 11:02:28', '0');
INSERT INTO "icon_items" VALUES (139, 17, 4, '果核剥壳', 'https://www.ghxi.com/', 'static\ico\ghxi.png', NULL, NULL, '2025-08-06 11:02:32', '0');
INSERT INTO "icon_items" VALUES (140, 18, 4, '开源中国', 'http://www.oschina.net/', 'static\ico\oschina.png', NULL, NULL, '2025-08-11 14:41:26', '0');
INSERT INTO "icon_items" VALUES (141, 19, 4, '正版中国', 'https://getitfree.cn/', 'static\ico\getitfree.png', NULL, NULL, '2025-08-11 14:27:07', '0');
INSERT INTO "icon_items" VALUES (142, 20, 4, 'apkPremier', 'https://apkpremier.com/', 'static\ico\apkpremier.png', NULL, NULL, '2025-08-06 11:03:22', '0');
INSERT INTO "icon_items" VALUES (143, 21, 4, '酷安网', 'http://www.coolapk.com/', 'static\ico\coolapk.png', NULL, NULL, '2025-08-06 11:03:29', '0');
INSERT INTO "icon_items" VALUES (144, 22, 4, 'ihack软件', 'https://ihacksoft.com/', 'static\ico\ihacksoft.png', NULL, NULL, '2025-08-06 11:03:41', '0');
INSERT INTO "icon_items" VALUES (145, 23, 4, '异星软件空间', 'http://yx.bsh.me/', 'static\ico\yxbsh.png', NULL, NULL, '2025-08-06 11:03:51', '0');
INSERT INTO "icon_items" VALUES (146, 24, 4, '专注于Win7', 'https://www.newxitong.com/', 'static\ico\newxitong.png', NULL, NULL, '2025-08-06 11:03:57', '0');
INSERT INTO "icon_items" VALUES (147, 25, 4, '资源铺', 'https://zypuu.com/', 'static\ico\zypuu.png', NULL, NULL, '2025-08-06 11:04:03', '0');
INSERT INTO "icon_items" VALUES (148, 26, 4, 'Pitahaya', 'https://rowling7.github.io/Pitahaya/', '', NULL, NULL, '2026-05-06 06:49:17', '0');
INSERT INTO "icon_items" VALUES (149, 0, 5, 'Linux命令', 'https://zhuanlan.zhihu.com/p/560751712', 'static\ico\zhihu.png', NULL, NULL, '2025-08-06 11:04:16', '0');
INSERT INTO "icon_items" VALUES (150, 1, 5, 'aigei加载图标', 'https://www.aigei.com/lib/gif/jia_zai_xu/', 'static\ico\aigei.png', NULL, NULL, '2025-08-06 11:04:23', '0');
INSERT INTO "icon_items" VALUES (151, 2, 5, 'LKSSite', 'https://lkssite.vip/', 'static\ico\LKSSite.png', NULL, NULL, '2025-08-06 11:04:34', '0');
INSERT INTO "icon_items" VALUES (152, 3, 5, 'ik009', 'https://www.ik009.top/', NULL, NULL, NULL, '2025-08-21 09:35:04', '0');
INSERT INTO "icon_items" VALUES (153, 4, 5, 'xx01', 'https://d4.xx01.my/', NULL, NULL, NULL, '2025-08-21 09:34:45', '0');
INSERT INTO "icon_items" VALUES (154, 5, 5, 'xiuren', 'https://w7.xiuren.ee/', NULL, NULL, NULL, '2025-08-21 09:34:11', '0');
INSERT INTO "icon_items" VALUES (155, 6, 5, 'Random', 'http://localhost:3000/random.html', NULL, NULL, '2025-08-08 13:25:37', '2025-08-21 09:33:47', '0');
INSERT INTO "icon_items" VALUES (156, 7, 5, 'Ballerina', 'https://ww1.lookmovie.pn/movies/play/7181546-ballerina-2025?ref=os&utm_source=osub_sub&imdb=tt7181546&term=Ballerina&sub=13174865', NULL, NULL, '2025-08-08 13:25:24', '2025-08-21 09:33:25', '0');
INSERT INTO "icon_items" VALUES (157, 8, 5, 'koipb', 'https://koipb.com/', NULL, NULL, '2025-08-08 13:25:35', '2025-08-21 09:33:00', '0');
INSERT INTO "icon_items" VALUES (158, 10, 5, '----------', 'http://localhost:3000/', '', NULL, '2025-08-08 13:25:32', '2026-05-06 06:50:25', '0');
INSERT INTO "icon_items" VALUES (159, 11, 5, '----------', 'http://localhost:3000/', '', NULL, NULL, '2026-05-06 06:53:42', '0');
INSERT INTO "icon_items" VALUES (160, 0, 6, 'MVCAT', 'https://www.mvcat.com/', 'static\ico\MVCAT.png', NULL, NULL, '2025-08-06 11:04:39', '0');
INSERT INTO "icon_items" VALUES (161, 1, 6, 'трекер RuTrac', 'http://rutracker.org/forum/index.php', 'static\ico\rut.png', NULL, NULL, '2025-08-06 11:04:53', '0');
INSERT INTO "icon_items" VALUES (162, 2, 6, '影视', 'https://www.yjys02.com/', 'static\ico\yjys02.png', NULL, NULL, '2025-08-06 11:05:04', '0');
INSERT INTO "icon_items" VALUES (163, 4, 6, 'Tinywow', 'https://tinywow.com/', 'static\ico\tinywow.png', NULL, NULL, '2025-08-06 11:05:08', '0');
INSERT INTO "icon_items" VALUES (164, 5, 6, 'FMHY', 'https://fmhy.net/', 'static\ico\fmhy.png', NULL, NULL, '2025-08-06 11:05:17', '0');
INSERT INTO "icon_items" VALUES (165, 6, 6, '423Down', 'http://www.423down.com/', 'static\ico\423Down.png', NULL, NULL, '2025-08-06 11:05:20', '0');
INSERT INTO "icon_items" VALUES (166, 7, 6, 'APK下载', 'https://apk.bot/', 'static\ico\apkdn.png', NULL, NULL, '2025-08-06 11:05:23', '0');
INSERT INTO "icon_items" VALUES (167, 8, 6, '蓝鲨', 'https://www.lsapk.com/', 'static\ico\lsapk.png', NULL, NULL, '2025-08-06 11:05:37', '0');
INSERT INTO "icon_items" VALUES (168, 9, 6, '老殁|殁漂遥', 'https://mpyit.com/', 'static\ico\mpyit.png', NULL, NULL, '2025-08-06 11:05:40', '0');
INSERT INTO "icon_items" VALUES (169, 10, 6, '绿色软件', 'http://www.xdowns.com/', 'static\ico\xdowns.png', NULL, NULL, '2025-08-06 11:05:44', '0');
INSERT INTO "icon_items" VALUES (170, 11, 6, '亿破姐', 'https://www.ypojie.com/', 'static\ico\ypojie.png', NULL, NULL, '2025-08-06 11:05:47', '0');
INSERT INTO "icon_items" VALUES (171, 43, 3, '鼠标测试', 'https://www.mousetester.cn/', 'static\ico\mousetest.png', NULL, NULL, '2025-08-06 11:00:22', '0');
INSERT INTO "icon_items" VALUES (172, 28, 1, 'BootstrapIcon', 'https://icons.getbootstrap.com/', 'static\ico\BootstrapIcon.png', '2025-08-05 16:49:59', NULL, '2025-08-05 16:50:38', '0');
INSERT INTO "icon_items" VALUES (173, 12, 5, 'weibo', 'https://icons.getbootstrap.com/?q=weibo', 'static\ico\weibo.png', '2025-08-05 16:52:59', NULL, '2025-09-25 19:50:06', '0');
INSERT INTO "icon_items" VALUES (174, 17, 3, 'Flaticon', 'https://www.flaticon.com/', 'static\ico\Flaticon.png', '2025-08-11 14:10:57', NULL, '2025-08-11 15:56:44', '0');
INSERT INTO "icon_items" VALUES (175, 10, 1, '企业邮箱', 'https://mail.weigaogroup.com/', 'static\ico\qiyeyouxiang.png', '2025-08-11 15:31:51', NULL, '2025-08-11 15:46:03', '0');
INSERT INTO "icon_items" VALUES (176, 32, 0, '发表情', 'https://www.fabiaoqing.com/', 'static\ico\fabiaoqing.png', '2025-08-14 11:10:06', NULL, '2025-08-15 08:40:40', '0');
INSERT INTO "icon_items" VALUES (177, 44, 3, 'Bing每日壁纸', 'https://bing.ee123.net', 'static\ico\Bingwallpaper.png', '2025-08-14 11:12:24', NULL, NULL, '0');
INSERT INTO "icon_items" VALUES (178, 45, 3, '菜鸟图标', 'https://icon.sucai999.com/', 'static\ico\sucai999.png', '2025-08-14 17:20:56', NULL, '2025-08-19 13:28:41', '0');
INSERT INTO "icon_items" VALUES (179, 25, 2, '游戏科学', 'https://gamesci.cn/', 'static\ico\gamesci.png', '2025-08-20 13:30:26', NULL, '2025-08-20 13:31:33', '0');
INSERT INTO "icon_items" VALUES (180, 26, 2, '黑色沙漠手游', 'https://www.world.blackdesertm.com/', 'static\ico\blackdesert.png', '2025-08-20 13:42:29', NULL, '2025-08-22 11:00:32', '0');
INSERT INTO "icon_items" VALUES (181, 10, 2, 'Ubisoft', 'https://zh-cn.ubisoft.com/', 'static\ico\Ubisoft.png', '2025-08-27 09:29:25', NULL, '2025-08-27 10:03:10', '0');
INSERT INTO "icon_items" VALUES (182, 9, 2, 'Epicgames', 'https://store.epicgames.com/zh-CN/', 'static\ico\Epicgames.png', '2025-08-27 09:35:38', NULL, '2025-08-27 10:03:14', '0');
INSERT INTO "icon_items" VALUES (183, 8, 2, 'EA', 'https://www.ea.com/zh-cn', 'static\ico\ea.png', '2025-08-27 09:47:28', NULL, '2025-08-27 10:03:17', '0');
INSERT INTO "icon_items" VALUES (184, 27, 2, 'CSOL', 'https://csol.tiancity.com/homepage/v6/index.html', 'static\ico\csol.png', '2025-08-27 09:53:33', NULL, '2025-08-27 09:54:41', '0');
INSERT INTO "icon_items" VALUES (185, 33, 0, '淘宝', 'https://www.taobao.com', 'static\ico\taobao.png', '2025-08-27 10:05:02', NULL, NULL, '0');
INSERT INTO "icon_items" VALUES (186, 34, 0, '京东', 'https://www.jd.com', 'static\ico\jingdong.png', '2025-08-27 10:06:01', NULL, NULL, '0');
INSERT INTO "icon_items" VALUES (187, 31, 0, '拼多多-手机版', 'https://mobile.pinduoduo.com', 'static\ico\pinduoduo.png', '2025-08-27 10:07:25', '2025-08-27 13:09:30', NULL, '1');
INSERT INTO "icon_items" VALUES (188, 17, 0, '3Q影视', 'https://qqqys.com/', 'static\ico\3q.png', '2025-09-22 19:21:41', NULL, '2025-09-22 19:22:39', '0');
INSERT INTO "icon_items" VALUES (189, 18, 0, 'LibVio', 'https://www.libvio.cc/', 'static\ico\LibVio.png', '2025-09-25 11:55:35', NULL, '2025-09-25 11:56:54', '0');
INSERT INTO "icon_items" VALUES (190, 27, 4, 'LMDocker', 'https://10.131.3.166:9443/#!/auth', 'static\ico\LMDocker.png', '2025-09-22 15:44:04', NULL, '2025-09-22 15:44:15', '0');
INSERT INTO "icon_items" VALUES (191, 46, 3, '节假日API', 'https://www.jiejiariapi.com/', 'static\ico\jiejiariapi.png', '2025-09-16 17:01:22', NULL, '2025-09-16 17:02:46', '0');
INSERT INTO "icon_items" VALUES (192, 35, 0, '一元机场', 'https://cat.xn--4gq62f52gdss.plus//#/?link=LyMvZGFzaGJvYXJk', 'static\ico\yiyuan.png', '2025-09-25 12:38:22', NULL, NULL, '0');
INSERT INTO "icon_items" VALUES (193, 8, 1, 'Gmail', 'https://mail.google.com/', 'static\ico\Gmail.png', '2025-09-25 12:43:51', NULL, '2025-09-25 12:45:06', '0');
INSERT INTO "icon_items" VALUES (194, 23, 0, 'Youtube', 'https://youtube.com/', 'static\ico\youtube.png', '2025-09-25 19:17:04', NULL, '2025-09-25 19:17:18', '0');
INSERT INTO "icon_items" VALUES (195, 36, 0, 'Infinity', 'https://inftab.com/', 'static/ico/loading0.gif', '2025-10-15 21:56:36', '2026-05-04 16:49:08', '2026-05-06 07:18:25', '0');
INSERT INTO "icon_items" VALUES (196, 6, 4, 'Gradle镜像', 'https://mirrors.cloud.tencent.com/gradle/', 'static\ico\gradlemirrors.png', '2025-10-28 10:55:19', NULL, '2025-10-28 11:06:30', '0');
INSERT INTO "icon_items" VALUES (197, 24, 0, 'X', 'https://x.com/', 'static\ico\x.png', '2025-11-24 14:38:33', NULL, '2025-11-24 14:39:07', '0');
INSERT INTO "icon_items" VALUES (198, 1, 4, 'Github下载', 'https://github.akams.cn/', 'static\ico\githubakams.png', '2025-12-24 08:02:57', NULL, '2025-12-24 08:03:41', '0');
INSERT INTO "icon_items" VALUES (199, 47, 3, '光标', 'https://sweezy-cursors.com/', 'static\ico\guangbiao.png', '2026-01-10 16:26:29', NULL, NULL, '0');
INSERT INTO "icon_items" VALUES (200, 48, 3, '抖音解析', 'http://cnsygh.net/', 'static\ico\douyin.png', '2026-01-10 17:34:05', NULL, '2026-01-10 17:34:52', '0');
INSERT INTO "icon_items" VALUES (201, 49, 3, 'BILI下载', 'https://snapany.com/zh/bilibili', 'static\ico\snapany.png', '2026-01-10 17:47:24', NULL, NULL, '0');
INSERT INTO "icon_items" VALUES (202, 50, 3, 'mtldss', 'https://mtldss.top/', 'static\ico\mtldss.png', '2026-02-23 12:26:46', NULL, NULL, '0');
INSERT INTO "icon_items" VALUES (203, 12, 0, '耐视点播', 'https://nsvod.me/', 'static\ico\nsvod.png', '2026-04-23 11:32:58', NULL, '2026-04-23 11:33:02', '0');

-- ----------------------------
-- Auto increment value for icon_items
-- ----------------------------
UPDATE "sqlite_sequence" SET seq = 203 WHERE name = 'icon_items';

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
