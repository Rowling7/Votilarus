/*
 Navicat Premium Data Transfer

 Source Server         : SQLite-Votilarus
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 09/05/2026 10:04:00
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for yiyan
-- ----------------------------
DROP TABLE IF EXISTS "yiyan";
CREATE TABLE "yiyan" (
  "id" INTEGER NOT NULL,
  "content" TEXT,
  "notes" TEXT,
  "created_at" DATE,
  "updated_at" DATE,
  "deleted_at" DATE,
  "delete_flag" TEXT,
  PRIMARY KEY ("id")
);

-- ----------------------------
-- Records of yiyan
-- ----------------------------
INSERT INTO "yiyan" VALUES (1, '贫穷限制了我那么多，为什么没有限制我的体重？', NULL, '2025-08-05 10:02:46', NULL, '2025-08-05 10:03:01', '1');
INSERT INTO "yiyan" VALUES (2, '贫穷限制了我那么多，为什么没有限制我的体重？', NULL, '2025-08-05 10:03:31', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (3, '你过得好我替你高兴，你过得不好，我替全世界高兴。', NULL, '2025-08-05 10:04:10', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (4, '人生无须过于执着，尽人事安天命而已。选择了，努力了，坚持了，走过了，问心无愧就好，至于结果怎样，其实并不重要。顺其自然、随遇而安，如行云般自在，像流水般洒脱，才是人生应有的态度。', NULL, '2025-08-05 10:04:45', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (5, '放心吧，只要你持续走下坡路，就永远不会处在人生最低谷。', NULL, '2025-08-05 10:05:01', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (6, '作为失败的典型，你实在是太成功了。', NULL, '2025-08-05 10:05:58', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (7, '你若安好，那还得了~', NULL, '2025-08-05 10:06:41', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (8, '别看我平时对你漠不关心，其实私下里我每天都盼着你出事！', NULL, '2025-08-05 10:07:07', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (9, '你怎么长得跟个二维码似的，不扫一下，都不知道你是什么东西！', NULL, '2025-08-05 10:31:00', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (10, '有些人就是四，除了二，还是二。', NULL, '2025-08-05 10:31:48', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (11, '蠢萌的前提是萌，不是蠢。', NULL, '2025-08-05 10:59:08', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (12, '厉害的不是你有多少后台，而是你能成为多少人的后台！', NULL, '2025-08-05 11:01:19', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (13, '白天关注健康新闻贪生怕死，晚上熬夜游戏追剧视死如归。', NULL, '2025-08-05 11:04:20', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (14, '"得"是一种本事，"舍"是一门学问。没有能力的人得不到，没有悟性的人舍不得。舍得金钱，才能赢得自己，主宰生活；舍得功名，才能静下心来，顺其自然品味人生。痛苦是因为舍不得，幸福是因为舍得；忧郁是因为舍不得，快乐是因为舍得。舍得之妙，妙在微言大义；舍得之精，精在有舍有得。', NULL, '2025-08-05 13:09:21', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (15, '为什么中国人结婚，都非要选个好日子呢？因为结完婚就没好日子过了！', NULL, '2025-08-05 13:10:09', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (16, '有些人一旦错过了，真特么谢天谢地。', NULL, '2025-08-05 13:10:12', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (17, '假期定了个Plan，半个暑假结束了只完成了P，因为lan。', NULL, '2025-08-05 16:48:01', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (18, '马云成功跟长相没关系，姜尚成功跟年龄没关系，而成功跟你没关系。', NULL, '2025-08-05 16:48:22', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (19, '好看的皮囊三千一晚，有趣的灵魂要车要房。', NULL, '2025-08-05 16:48:27', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (20, '窮一點不要緊，要緊的是不只一點。', NULL, '2025-08-05 16:48:39', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (21, '你要努力的去生活，因为你只有努力了，才知道自己真的不行。', NULL, '2025-08-05 16:49:23', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (22, '小时候我常想，长大了是上北大还是清华，现在想想原来是我想多了。', NULL, '2025-08-06 08:49:51', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (23, '不是不生，而是缓生、慢生，是有次序的生、优生。要让有能力的人先生，让富裕的人也具体情况具体生；不是盲目生，而是精准生、科学生、高效生、有策略的生。还要让懂技术的人参与生，让善管理的人带头生，借专业力量推进，同时也要兼顾特殊情况，灵活生。', NULL, '2025-08-06 09:50:29', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (24, '女生何必勾心斗角互相攀比，反正几十年后，都要一起跳广场舞的。', NULL, '2025-08-06 16:35:37', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (25, '所有抱怨社会不公和制度的人翻译过来只有一句话：请给我金钱，女人和社会地位。', NULL, '2025-08-06 16:35:48', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (26, '注重细节，从小事做起，因为你根本做不了大事。', NULL, '2025-08-06 16:35:54', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (27, '梦想还是要有的，万一下辈子实现了呢？', NULL, '2025-08-06 16:35:57', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (28, '假如生活欺骗了你，你就打开美颜相机，欺骗所有的人。', NULL, '2025-08-06 16:36:00', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (29, '世界这么大，我想去看看，看看有没有塑料瓶。', NULL, '2025-08-07 13:47:19', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (30, '做人要安安稳稳本本分分，因为，你也根本搞不出什么幺蛾子。', NULL, '2025-08-08 11:06:57', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (31, '人要是决定自暴自弃了，就会活得特别开心。', NULL, '2025-08-08 11:10:25', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (32, '早上班一小时没人记得，早下班一分钟就被人惦记。', NULL, '2025-08-11 09:04:59', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (33, '猛的一看你不怎么样，仔细一看，还不如猛的一看。', NULL, '2025-08-11 09:05:17', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (34, '世界上最动听的话，不是我爱你，而是你的肿瘤是良性的！', NULL, '2025-08-11 09:05:21', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (35, '长得丑怎么了？我自己又看不到，恶心的是你们！', NULL, '2025-08-11 09:05:34', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (36, '我对你要求不高，能跟我其他对象，和睦相处就好咯。', NULL, '2025-08-11 10:06:23', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (37, '好人成佛，需要九九八十一难，坏人只需放下屠刀。', NULL, '2025-08-11 10:06:33', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (38, '如果你觉得每天都忙成狗，那一定是你的错觉。狗一定没你忙。', NULL, '2025-08-11 11:10:38', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (39, 'A2AA G5JR 4HY0 GJ5H SHMS B78Z FV7G DQTK', NULL, NULL, NULL, '2025-08-11 14:01:22', '1');
INSERT INTO "yiyan" VALUES (40, '你无法叫醒一个，不回你消息的人，但是红包能。', NULL, '2025-08-11 15:57:11', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (41, '女人假装高潮来维持恋爱，而男人假装恋爱以获得高潮。', NULL, '2025-08-13 08:02:08', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (42, '吃的苦中苦，才知白辛苦。', NULL, '2025-08-13 08:02:12', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (43, '其实只要不要脸，很多人生难题都能迎刃而解。', NULL, '2025-08-14 11:00:03', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (44, '有时候，想想开心的往事，也是一种难过。', NULL, '2025-08-15 08:41:02', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (45, '还没有对象？要不要给你介绍，一款不错的狗粮。', NULL, '2025-08-15 08:41:06', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (46, '时间不会解决任何问题，只会解决我们。', NULL, '2025-08-18 14:32:22', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (47, '窮一點不要緊，要緊的是不只一點。', NULL, '2025-08-19 09:40:08', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (48, '自从实行垃圾分类后，尸体和棺材都得分开处理。', NULL, '2025-08-19 09:40:12', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (49, '有些事情还是要坚持的，比如睡觉，特别是闹钟响起的那一刻。', NULL, '2025-08-19 09:46:19', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (50, '说错话不要紧，你还会继续说错的。', NULL, '2025-08-19 10:07:23', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (51, '我有十块我会给你花九块，如果我有十万，我那十块都给你。', NULL, '2025-08-19 16:28:04', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (52, '人们常说，不要让青春留白，所以我把它抹黑了！', NULL, '2025-08-20 13:06:45', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (53, '我也想做一个优雅的淑女，是生活把老娘逼成了泼妇。', NULL, '2025-08-21 10:30:12', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (54, '你连世界都没观过，哪来的世界观？', NULL, '2025-08-21 13:20:54', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (55, '单身至今的原因是，熟人不好下手，生人不好开口。', NULL, '2025-08-21 13:21:00', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (56, '神秘的「黑石块」建筑了古代文明，对古代技术发展产生了莫大的影响，但却摧毁古代人的精神，造成古代文明的衰亡。「黑石块」大量存在于卡尔佩恩(Calpheon)与瓦伦西亚(Valencia)间广阔的大沙漠地带，因为埋藏着黑石块，卡尔佩恩便将此地称为「黑色沙漠」。为了争夺这个资源，卡尔佩恩发动多次战争，瓦伦西亚则因为这些战争牺牲众多的士兵，血流成河的惨痛历史则让它成为瓦伦西亚的「红色沙漠」。挟持庞大资本与商业立国的「卡尔佩恩」，以及绝对王政的「瓦伦西亚」，隐藏的古代历史、消失的记忆与黑石块的真相即将随着冒险探索一一揭晓。

现在让我们一起出发冒险吧！诚挚邀请您来到黑色沙漠的世界。
', NULL, NULL, NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (57, '有钱能买来幸福吗？不能，有钱本身就是幸福！', NULL, '2025-08-27 09:27:51', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (58, '我的主要成分，1%的沙雕+99%的穷。', NULL, '2025-08-27 10:22:25', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (59, '希望有些事情可以自己解决，不是我自己，是事情自己。', NULL, '2025-08-28 10:42:39', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (60, '快乐分享给朋友快乐会加倍，痛苦分享给朋友，朋友会减半。', NULL, '2025-08-28 10:42:44', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (61, '所谓白领，就是那点工资，领了也是白领。', NULL, '2025-09-02 13:18:46', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (62, '黑夜给你黑色的眼睛，你却用它来翻白眼。', NULL, '2025-09-02 13:18:51', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (63, '我能想到最浪漫的事，就是和你一起吃吃吃，然后你付钱。', NULL, '2025-09-03 14:54:10', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (64, '你以为你是灰姑娘吗？拜托别做梦了，她可是伯爵的女儿。', NULL, '2025-09-03 14:54:14', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (65, '穿白色衣服上班，并不代表你可以不背黑锅。', NULL, '2025-09-03 14:54:34', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (66, '我有一颗早起的心，可我的被子和床不同意。', NULL, '2025-09-11 09:27:58', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (67, '贫贱不能移的意思就是，穷就好好在家呆着，哪儿也别去。', NULL, '2025-09-11 14:56:36', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (68, '熟练地运用，关我屁事和关你屁事，可以节省人生80%的时间。', NULL, '2025-09-11 15:31:07', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (69, '卸妆对你来说，又叫洗钱。', NULL, '2025-09-11 15:31:10', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (70, '你踢球受过最重的伤，是女友到球场给对手喂水！', NULL, '2025-09-12 13:16:19', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (71, '趁好看的时候多照照镜子，毕竟，这种错觉不是每天都有的。', NULL, '2025-09-16 11:12:17', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (72, '昨天遇见小学同班同学，没想到他混的这么差，只往我碗里放了一块钱。', NULL, '2025-09-16 16:23:26', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (73, '钱包里放老婆的照片，是为了提醒自己记住，钱包里的钱是怎么没的。', NULL, '2025-09-18 15:35:57', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (74, '你长得很有创意，活得很有勇气。', NULL, '2025-09-22 15:39:24', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (75, '兄弟听我一句劝，游戏没了还能重玩，媳妇没了游戏就能一直玩了。', NULL, '2025-09-25 20:04:26', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (76, '目前最靠谱的发财方法，就是，你家拆迁了。', NULL, '2025-09-26 00:48:33', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (77, '有的人就是不知足，都已经有了双下巴了，还想要双眼皮。', NULL, '2025-09-27 10:53:19', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (78, '肚子上的赘肉，是你向生活妥协的痕迹。', NULL, '2025-09-28 15:47:48', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (79, '只要你每天坚持学习，最终胜利肯定是属于，在考场上发挥好的人。', NULL, '2025-10-23 23:34:05', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (80, '穷，不是一种状态，而是一种常态。', NULL, '2025-10-24 13:07:32', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (81, '穷不可怕，可怕的是，最穷的人是我。', NULL, '2025-11-04 16:26:54', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (82, '自由从来不是什么理所当然的东西，而是一项需要极高成本的特权。', NULL, '2025-11-04 16:26:58', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (83, '我忘记了你，但是输入法却还记得。', NULL, '2025-12-23 16:28:58', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (84, '异地恋要对彼此信任，这样对四人都好。', NULL, '2026-04-23 10:44:55', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (85, '放弃这个字，说起来简单，做起来就更简单了。', NULL, '2026-04-23 10:45:05', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (86, '别看别人表面上一帆风顺，实际上他们背地里，也是一帆风顺。', NULL, '2026-04-23 10:45:13', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (87, '为什么要晒这么黑？因为我不想白活一生。', NULL, '2026-04-23 10:45:16', NULL, NULL, '0');
INSERT INTO "yiyan" VALUES (88, '假期定了个Plan，半个暑假结束了只完成了P，因为lan。', NULL, '2026-04-23 10:45:56', NULL, NULL, '0');

-- ----------------------------
-- Indexes structure for table yiyan
-- ----------------------------
CREATE INDEX "index_yiyan_content"
ON "yiyan" (
  "content" ASC
);
CREATE INDEX "index_yiyan_id"
ON "yiyan" (
  "id" ASC
);

PRAGMA foreign_keys = true;
