/*
 Navicat Premium Data Transfer

 Source Server         : SQLite-Votilarus
 Source Server Type    : SQLite
 Source Server Version : 3035005
 Source Schema         : main

 Target Server Type    : SQLite
 Target Server Version : 3035005
 File Encoding         : 65001

 Date: 06/05/2026 13:33:46
*/

PRAGMA foreign_keys = false;

-- ----------------------------
-- Table structure for stettings
-- ----------------------------
DROP TABLE IF EXISTS "stettings";
CREATE TABLE "stettings" (
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
-- Records of stettings
-- ----------------------------
INSERT INTO "stettings" VALUES (1, 'ClockWidget', 'clockContainer', 'widget', NULL, '1', '0');
INSERT INTO "stettings" VALUES (2, 'CalendarWidget', 'calendarContainer', 'widget', NULL, '1', '0');
INSERT INTO "stettings" VALUES (3, 'WorkTimeWidget', 'workTimeContainer', 'widget', '2025-12-24 10:40:06', '1', '0');
INSERT INTO "stettings" VALUES (4, 'WeatherWidget', 'weatherContainer', 'widget', '2025-12-24 10:40:07', '1', '0');
INSERT INTO "stettings" VALUES (5, 'ShortcutWidget', 'shortcutContainer', 'widget', NULL, '1', '0');
INSERT INTO "stettings" VALUES (6, 'HotPointWidget', 'hotPointContainer', 'widget', NULL, '1', '0');
INSERT INTO "stettings" VALUES (7, 'NotebookWidget', 'notebookContainer', 'widget', NULL, '1', '0');
INSERT INTO "stettings" VALUES (8, 'YiyanWidget', 'yiyanContainer', 'widget', NULL, '1', '0');
INSERT INTO "stettings" VALUES (9, 'CompLeaveWidget', 'compLeaveContainer', 'widget', '2025-12-24 10:40:09', '1', '0');
INSERT INTO "stettings" VALUES (10, 'WoodenFishWidget', 'woodenFishContainer', 'widget', '2026-04-01 11:44:49', '1', '0');
INSERT INTO "stettings" VALUES (11, 'Daily60sWidget', 'daily60sContainer', 'widget', NULL, '1', '0');
INSERT INTO "stettings" VALUES (12, 'BuslineWidget', 'BuslineContainer', 'widget', '2026-04-23 10:41:18', '1', '0');
INSERT INTO "stettings" VALUES (13, 'HistoryWidget', 'HistoryContainer', 'widget', '2025-12-29 17:34:20', '1', '0');
INSERT INTO "stettings" VALUES (101, 'grid_rows', '5', 'personal', '网格行数', '1', '0');
INSERT INTO "stettings" VALUES (9900, 'color', NULL, 'personal', '颜色', NULL, '0');
INSERT INTO "stettings" VALUES (9901, 'darkmode', '1', 'personal', '暗黑模式', NULL, '0');
INSERT INTO "stettings" VALUES (9902, 'theme_mode', 'dark', 'personal', '主题模式: dark/light/auto', '1', '0');
INSERT INTO "stettings" VALUES (9903, 'theme_color', '#667eea', 'personal', '主题色', '1', '0');
INSERT INTO "stettings" VALUES (9904, 'background_image_url', NULL, 'personal', '背景图片URL', '1', '0');
INSERT INTO "stettings" VALUES (9905, 'background_blur', '5', 'personal', '背景模糊度 (0-20)', '1', '0');
INSERT INTO "stettings" VALUES (9906, 'background_opacity', '0.8', 'personal', '背景透明度 (0-1)', '1', '0');
INSERT INTO "stettings" VALUES (9907, 'overlay_color', '#ffffff', 'personal', '遮罩层颜色', '1', '0');
INSERT INTO "stettings" VALUES (9908, 'overlay_opacity', '0.3', 'personal', '遮罩层透明度 (0-1)', '1', '0');
INSERT INTO "stettings" VALUES (9909, 'sidebar_width', '4', 'personal', '左侧导航栏宽度 (%)', '1', '0');
INSERT INTO "stettings" VALUES (9910, 'sidebar_position', 'left', 'personal', '侧边栏位置: left/right/hidden', '1', '0');
INSERT INTO "stettings" VALUES (9911, 'dock_position', 'bottom', 'personal', 'Dock栏位置: bottom/top/hidden', '1', '0');
INSERT INTO "stettings" VALUES (9912, 'dock_max_items', '5', 'personal', 'Dock栏最大图标数量', '1', '0');
INSERT INTO "stettings" VALUES (9913, 'cell_base_size', '4', 'personal', '单元格基础大小 (rem)', '1', '0');
INSERT INTO "stettings" VALUES (9914, 'cell_gap', '2', 'personal', '单元格间距 (rem)', '1', '0');
INSERT INTO "stettings" VALUES (9915, 'default_item_width', '1', 'personal', '图标默认宽度', '1', '0');
INSERT INTO "stettings" VALUES (9916, 'default_item_height', '1', 'personal', '图标默认高度', '1', '0');
INSERT INTO "stettings" VALUES (9917, 'scroll_animation_speed', '300', 'personal', '滚动动画速度 (ms)', '1', '0');
INSERT INTO "stettings" VALUES (9918, 'drag_sensitivity', '5', 'personal', '拖拽灵敏度 (px)', '1', '0');
INSERT INTO "stettings" VALUES (9919, 'enable_context_menu', '1', 'personal', '启用右键菜单', '1', '0');
INSERT INTO "stettings" VALUES (9920, 'enable_shift_scroll', '1', 'personal', '启用Shift+滚轮横向滚动', '1', '0');
INSERT INTO "stettings" VALUES (9921, 'search_engine', 'baidu', 'personal', '默认搜索引擎: baidu/bing/google', '1', '0');
INSERT INTO "stettings" VALUES (9922, 'search_box_position', 'center', 'personal', '搜索框位置: center/left/right', '1', '0');
INSERT INTO "stettings" VALUES (9923, 'search_box_style', 'rounded', 'personal', '搜索框样式: rounded/square', '1', '0');
INSERT INTO "stettings" VALUES (9924, 'enable_search_suggestions', '0', 'personal', '启用搜索建议', '1', '0');
INSERT INTO "stettings" VALUES (9925, 'avatar_url', 'static/ico/loading0.gif', 'personal', '用户头像URL', '1', '0');
INSERT INTO "stettings" VALUES (9926, 'username', '', 'personal', '用户名', '1', '0');
INSERT INTO "stettings" VALUES (9928, 'icon_radius', '0.5', 'personal', '图标圆角半径（rem单位，0-2）', '1', '0');
INSERT INTO "stettings" VALUES (9929, 'icon_shadow', '1', 'personal', '图标阴影效果: 0/1', '1', '0');
INSERT INTO "stettings" VALUES (9930, 'icon_hover_effect', 'scale', 'personal', '图标悬停效果: scale/glow/none', '1', '0');
INSERT INTO "stettings" VALUES (9931, 'show_icon_title', '1', 'personal', '显示图标标题', '1', '0');
INSERT INTO "stettings" VALUES (9932, 'icon_title_position', 'bottom', 'personal', '图标标题位置: bottom/top/floating', '1', '0');
INSERT INTO "stettings" VALUES (9933, 'mobile_nav_style', 'hamburger', 'personal', '移动端导航样式: hamburger/bottom-tab', '1', '0');
INSERT INTO "stettings" VALUES (9934, 'tablet_layout', 'adjusted', 'personal', '平板端布局: adjusted/full-sidebar', '1', '0');
INSERT INTO "stettings" VALUES (9935, 'grid_cols', '13', 'personal', '网格列数（13-20）', '1', '0');
INSERT INTO "stettings" VALUES (9936, 'bg_image_url', 'static/background/image061.png', 'personal', '背景图片URL地址', '1', '0');
INSERT INTO "stettings" VALUES (9937, 'bg_blur', '5', 'personal', '背景模糊程度（0-20px）', '1', '0');
INSERT INTO "stettings" VALUES (9938, 'bg_opacity', '0', 'personal', '背景透明度（0-1）', '1', '0');
INSERT INTO "stettings" VALUES (9940, 'show_title', '1', 'personal', '是否显示图标标题（1=显示，0=隐藏）', '1', '0');
INSERT INTO "stettings" VALUES (9941, 'title_position', 'bottom', 'personal', '标题位置（bottom/top/left/right）', '1', '0');
INSERT INTO "stettings" VALUES (9942, 'title_font_size', '12', 'personal', '标题字体大小（px单位，10-20）', '1', '0');
INSERT INTO "stettings" VALUES (9943, 'title_font_color', '#ffffff', 'personal', '标题字体颜色（十六进制颜色值）', '1', '0');
INSERT INTO "stettings" VALUES (9944, 'title_max_length', '8', 'personal', '标题最大显示长度（字符数，4-12）', '1', '0');
INSERT INTO "stettings" VALUES (9945, 'tooltip_delay', '300', 'personal', '提示框延迟显示时间（毫秒，100-1000）', '1', '0');
INSERT INTO "stettings" VALUES (9946, 'dock_max_icons', '10', 'personal', 'Dock栏最大图标数量（5-15）', '1', '0');
INSERT INTO "stettings" VALUES (9947, 'dock_blur', '10', 'personal', 'Dock栏毛玻璃模糊程度（0-20px）', '1', '0');
INSERT INTO "stettings" VALUES (9948, 'dock_opacity', '0.3', 'personal', 'Dock栏背景透明度（0-1）', '1', '0');
INSERT INTO "stettings" VALUES (9949, 'fisheye_scale', '1.5', 'personal', '鱼眼效果放大倍数（1.0-2.0）', '1', '0');
INSERT INTO "stettings" VALUES (9950, 'fisheye_range', '2', 'personal', '鱼眼效果影响范围（1-3个图标）', '1', '0');
INSERT INTO "stettings" VALUES (9951, 'bio', '', 'personal', '个人简介/签名', '1', '0');

PRAGMA foreign_keys = true;
