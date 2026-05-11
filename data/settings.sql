/*
 Navicat Premium Data Transfer

 Source Server         : SQLite-Votilarus
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 11/05/2026 09:58:54
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for settings
-- ----------------------------
DROP TABLE IF EXISTS "settings";
CREATE TABLE "settings" (
  "id" INTEGER NOT NULL,
  "key" TEXT,
  "value" TEXT,
  "type" TEXT,
  "notes" TEXT,
  "isdisplay" TEXT,
  "isdel" TEXT,
  PRIMARY KEY ("id")
);

-- ----------------------------
-- Records of settings
-- ----------------------------
INSERT INTO "settings" VALUES (1, 'ClockWidget', 'clockContainer', 'widget', NULL, '1', '0');
INSERT INTO "settings" VALUES (2, 'CalendarWidget', 'calendarContainer', 'widget', NULL, '1', '0');
INSERT INTO "settings" VALUES (3, 'WorkTimeWidget', 'workTimeContainer', 'widget', NULL, '1', '0');
INSERT INTO "settings" VALUES (4, 'WeatherWidget', 'weatherContainer', 'widget', NULL, '1', '0');
INSERT INTO "settings" VALUES (5, 'ShortcutWidget', 'shortcutContainer', 'widget', NULL, '1', '0');
INSERT INTO "settings" VALUES (6, 'HotPointWidget', 'hotPointContainer', 'widget', NULL, '1', '0');
INSERT INTO "settings" VALUES (7, 'NotebookWidget', 'notebookContainer', 'widget', NULL, '1', '0');
INSERT INTO "settings" VALUES (8, 'YiyanWidget', 'yiyanContainer', 'widget', NULL, '1', '0');
INSERT INTO "settings" VALUES (9, 'CompLeaveWidget', 'compLeaveContainer', 'widget', NULL, '1', '0');
INSERT INTO "settings" VALUES (10, 'WoodenFishWidget', 'woodenFishContainer', 'widget', NULL, '1', '0');
INSERT INTO "settings" VALUES (11, 'Daily60sWidget', 'daily60sContainer', 'widget', NULL, '1', '0');
INSERT INTO "settings" VALUES (12, 'BuslineWidget', 'BuslineContainer', 'widget', NULL, '1', '0');
INSERT INTO "settings" VALUES (13, 'HistoryWidget', 'HistoryContainer', 'widget', NULL, '1', '0');
INSERT INTO "settings" VALUES (14, 'grid_rows', '5', 'personal', '网格行数', '1', '0');
INSERT INTO "settings" VALUES (15, 'grid_cols', '13', 'personal', '网格列数（13-20）', '1', '0');
INSERT INTO "settings" VALUES (16, 'cell_gap', '2', 'personal', '单元格间距 (rem)', '1', '0');
INSERT INTO "settings" VALUES (17, 'sidebar_width', '50', 'personal', '左侧导航栏宽度 ', '1', '0');
INSERT INTO "settings" VALUES (18, 'theme_mode', 'light', 'personal', '主题模式: dark/light/auto', '1', '0');
INSERT INTO "settings" VALUES (19, 'theme_color', '#3b82f6', 'personal', '主题色', '1', '0');
INSERT INTO "settings" VALUES (20, 'bg_image_enabled', '0', 'personal', '背景图片开关', '1', '0');
INSERT INTO "settings" VALUES (21, 'bg_image_url', 'static/background/image061.png', 'personal', '背景图片URL地址', '1', '0');
INSERT INTO "settings" VALUES (22, 'bg_blur_enabled', '0', 'personal', '背景模糊程度开关', '1', '0');
INSERT INTO "settings" VALUES (23, 'bg_blur', '5', 'personal', '背景模糊程度（0-20px）', '1', '0');
INSERT INTO "settings" VALUES (24, 'bg_opacity_enabled', '0', 'personal', '背景透明度开关', '1', '0');
INSERT INTO "settings" VALUES (25, 'bg_opacity', '0.8', 'personal', '背景透明度（0-1）', '1', '0');
INSERT INTO "settings" VALUES (26, 'overlay_color_enabled', '0', 'personal', '遮罩层颜色开关', '1', '0');
INSERT INTO "settings" VALUES (27, 'overlay_color', '#000000', 'personal', '遮罩层颜色', '1', '0');
INSERT INTO "settings" VALUES (28, 'overlay_opacity_enabled', '0', 'personal', '遮罩层透明度开关', '1', '0');
INSERT INTO "settings" VALUES (29, 'overlay_opacity', '0.3', 'personal', '遮罩层透明度 (0-1)', '1', '0');
INSERT INTO "settings" VALUES (30, 'icon_radius', '1', 'personal', '图标圆角半径（rem单位，0-2）', '1', '0');
INSERT INTO "settings" VALUES (31, 'icon_shadow', '1', 'personal', '图标阴影效果: 0/1', '1', '0');
INSERT INTO "settings" VALUES (32, 'icon_hover_effect', 'scale', 'personal', '图标悬停效果: scale/glow/none', '1', '0');
INSERT INTO "settings" VALUES (33, 'show_title', '1', 'personal', '是否显示图标标题（1=显示，0=隐藏）', '1', '0');
INSERT INTO "settings" VALUES (34, 'title_position', 'bottom', 'personal', '标题位置（bottom/top/left/right）', '1', '0');
INSERT INTO "settings" VALUES (35, 'title_font_size', '12', 'personal', '标题字体大小（px单位，10-20）', '1', '0');
INSERT INTO "settings" VALUES (36, 'title_font_color', '#ffffff', 'personal', '标题字体颜色（十六进制颜色值）', '1', '0');
INSERT INTO "settings" VALUES (37, 'title_max_length', '8', 'personal', '标题最大显示长度（字符数，4-12）', '1', '0');
INSERT INTO "settings" VALUES (38, 'tooltip_delay', '300', 'personal', '提示框延迟显示时间（毫秒，100-1000）', '1', '0');
INSERT INTO "settings" VALUES (39, 'dock_position', 'bottom', 'personal', 'Dock栏位置: bottom/top/hidden', '1', '0');
INSERT INTO "settings" VALUES (40, 'dock_max_icons', '10', 'personal', 'Dock栏最大图标数量（5-15）', '1', '0');
INSERT INTO "settings" VALUES (41, 'dock_blur', '10', 'personal', 'Dock栏毛玻璃模糊程度（0-20px）', '1', '0');
INSERT INTO "settings" VALUES (42, 'dock_opacity', '0.3', 'personal', 'Dock栏背景透明度（0-1）', '1', '0');
INSERT INTO "settings" VALUES (43, 'fisheye_scale', '1.5', 'personal', '鱼眼效果放大倍数（1.0-2.0）', '1', '0');
INSERT INTO "settings" VALUES (44, 'fisheye_range', '1', 'personal', '鱼眼效果影响范围（1-3个图标）', '1', '0');
INSERT INTO "settings" VALUES (45, 'search_engine', 'baidu', 'personal', '默认搜索引擎: baidu/bing/google', '1', '0');
INSERT INTO "settings" VALUES (46, 'search_box_position', 'center', 'personal', '搜索框位置: center/left/right', '1', '0');
INSERT INTO "settings" VALUES (47, 'search_box_style', 'rounded', 'personal', '搜索框样式: rounded/square', '1', '0');
INSERT INTO "settings" VALUES (48, 'scroll_animation_speed', '300', 'personal', '滚动动画速度 (ms)', '1', '0');
INSERT INTO "settings" VALUES (49, 'drag_sensitivity', '5', 'personal', '拖拽灵敏度 (px)', '1', '0');
INSERT INTO "settings" VALUES (50, 'enable_context_menu', '1', 'personal', '启用右键菜单', '1', '0');
INSERT INTO "settings" VALUES (51, 'avatar_url', 'static/ico/loading2.gif', 'personal', '用户头像URL', '1', '0');
INSERT INTO "settings" VALUES (52, 'username', 'Votilarus', 'personal', '用户名', '1', '0');
INSERT INTO "settings" VALUES (53, 'bio', 'Everything will be OK!', 'personal', '个人简介/签名', '1', '0');
INSERT INTO "settings" VALUES (54, 'cell_base_size', '4', 'personal', '网格基础大小', '1', '0');
INSERT INTO "settings" VALUES (55, 'widget_border_radius', '1.4', 'personal', '组件圆角半径（rem单位，0-3）', '1', '0');
INSERT INTO "settings" VALUES (56, 'global_font', 'NotoSansSC-Regular', 'personal', '全局字体设置', '1', '0');

PRAGMA foreign_keys = true;
