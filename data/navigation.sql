/*
 导航页项目数据库扩展
 基于现有 A70（分类）和 A7001（图标）表
 
 创建日期: 2026-05-02
 说明: 
   - item_layouts: 存储图标布局信息（坐标、尺寸）
   - dock_items: 存储Dock栏项
   - stettings: 新增导航页个性化配置
*/

PRAGMA foreign_keys = false;

-- ====================
-- 1. 创建 item_layouts 表（图标布局信息）
-- ====================
DROP TABLE IF EXISTS "item_layouts";
CREATE TABLE "item_layouts" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "item_uuid" TEXT NOT NULL,
  "category_id" TEXT NOT NULL,
  "pos_x" REAL DEFAULT 0,
  "pos_y" REAL DEFAULT 0,
  "width" INTEGER DEFAULT 1,
  "height" INTEGER DEFAULT 1,
  "sort_order" INTEGER DEFAULT 0,
  "is_active" TEXT DEFAULT '1',
  "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("item_uuid") REFERENCES "A7001"("uuid") ON DELETE CASCADE
);

CREATE INDEX "idx_item_layouts_item_uuid" ON "item_layouts" ("item_uuid");
CREATE INDEX "idx_item_layouts_category_id" ON "item_layouts" ("category_id");

-- ====================
-- 2. 创建 dock_items 表（Dock栏项）
-- ====================
DROP TABLE IF EXISTS "dock_items";
CREATE TABLE "dock_items" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "item_uuid" TEXT NOT NULL,
  "sort_order" INTEGER DEFAULT 0,
  "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("item_uuid") REFERENCES "A7001"("uuid") ON DELETE CASCADE
);

CREATE INDEX "idx_dock_items_item_uuid" ON "dock_items" ("item_uuid");

-- ====================
-- 3. 更新 stettings 表（添加导航页相关配置）
-- ====================

-- 外观主题配置
INSERT INTO "stettings" VALUES (9902, 'theme_mode', 'light', 'personal', '主题模式: dark/light/auto', '1', '0');
INSERT INTO "stettings" VALUES (9903, 'theme_color', '#3B82F6', 'personal', '主题色', '1', '0');
INSERT INTO "stettings" VALUES (9904, 'background_image_url', '/common/background-default.jpg', 'personal', '背景图片URL', '1', '0');
INSERT INTO "stettings" VALUES (9905, 'background_blur', '5', 'personal', '背景模糊度 (0-20)', '1', '0');
INSERT INTO "stettings" VALUES (9906, 'background_opacity', '0.8', 'personal', '背景透明度 (0-1)', '1', '0');
INSERT INTO "stettings" VALUES (9907, 'overlay_color', '#000000', 'personal', '遮罩层颜色', '1', '0');
INSERT INTO "stettings" VALUES (9908, 'overlay_opacity', '0.3', 'personal', '遮罩层透明度 (0-1)', '1', '0');

-- 布局配置
INSERT INTO "stettings" VALUES (9909, 'sidebar_width', '6', 'personal', '左侧导航栏宽度 (%)', '1', '0');
INSERT INTO "stettings" VALUES (9910, 'sidebar_position', 'left', 'personal', '侧边栏位置: left/right/hidden', '1', '0');
INSERT INTO "stettings" VALUES (9911, 'dock_position', 'bottom', 'personal', 'Dock栏位置: bottom/top/hidden', '1', '0');
INSERT INTO "stettings" VALUES (9912, 'dock_max_items', '10', 'personal', 'Dock栏最大图标数量', '1', '0');
INSERT INTO "stettings" VALUES (9913, 'cell_base_size', '4', 'personal', '单元格基础大小 (rem)', '1', '0');
INSERT INTO "stettings" VALUES (9914, 'cell_gap', '1', 'personal', '单元格间距 (rem)', '1', '0');
INSERT INTO "stettings" VALUES (9915, 'default_item_width', '1', 'personal', '图标默认宽度', '1', '0');
INSERT INTO "stettings" VALUES (9916, 'default_item_height', '1', 'personal', '图标默认高度', '1', '0');

-- 交互行为配置
INSERT INTO "stettings" VALUES (9917, 'scroll_animation_speed', '300', 'personal', '滚动动画速度 (ms)', '1', '0');
INSERT INTO "stettings" VALUES (9918, 'drag_sensitivity', '5', 'personal', '拖拽灵敏度 (px)', '1', '0');
INSERT INTO "stettings" VALUES (9919, 'enable_context_menu', '1', 'personal', '启用右键菜单', '1', '0');
INSERT INTO "stettings" VALUES (9920, 'enable_shift_scroll', '1', 'personal', '启用Shift+滚轮横向滚动', '1', '0');

-- 搜索功能配置
INSERT INTO "stettings" VALUES (9921, 'search_engine', 'baidu', 'personal', '默认搜索引擎: baidu/bing/google', '1', '0');
INSERT INTO "stettings" VALUES (9922, 'search_box_position', 'center', 'personal', '搜索框位置: center/left/right', '1', '0');
INSERT INTO "stettings" VALUES (9923, 'search_box_style', 'rounded', 'personal', '搜索框样式: rounded/square', '1', '0');
INSERT INTO "stettings" VALUES (9924, 'enable_search_suggestions', '0', 'personal', '启用搜索建议', '1', '0');

-- 个人信息配置
INSERT INTO "stettings" VALUES (9925, 'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', 'personal', '用户头像URL', '1', '0');
INSERT INTO "stettings" VALUES (9926, 'username', 'User', 'personal', '用户名', '1', '0');
INSERT INTO "stettings" VALUES (9927, 'user_bio', '', 'personal', '个人简介', '1', '0');

-- 图标样式配置
INSERT INTO "stettings" VALUES (9928, 'icon_radius', '0.5', 'personal', '图标圆角半径（rem单位，0-2）', '1', '0');
INSERT INTO "stettings" VALUES (9929, 'icon_shadow', '1', 'personal', '图标阴影效果: 0/1', '1', '0');
INSERT INTO "stettings" VALUES (9930, 'icon_hover_effect', 'scale', 'personal', '图标悬停效果: scale/glow/none', '1', '0');
INSERT INTO "stettings" VALUES (9931, 'show_icon_title', '1', 'personal', '显示图标标题', '1', '0');
INSERT INTO "stettings" VALUES (9932, 'icon_title_position', 'bottom', 'personal', '图标标题位置: bottom/top/floating', '1', '0');

-- 响应式配置
INSERT INTO "stettings" VALUES (9933, 'mobile_nav_style', 'hamburger', 'personal', '移动端导航样式: hamburger/bottom-tab', '1', '0');
INSERT INTO "stettings" VALUES (9934, 'tablet_layout', 'adjusted', 'personal', '平板端布局: adjusted/full-sidebar', '1', '0');

-- ====================
-- 4. 插入示例图标数据到 A7001 表
-- ====================

-- 娱乐分类 (fun) - a70Id = 0
INSERT INTO "A7001" VALUES ('fun-bilibili-001', 1001, 0, 'fun', 'Bilibili', 'https://www.bilibili.com/', NULL, NULL, NULL, datetime('now'), '0');
INSERT INTO "A7001" VALUES ('fun-douyin-002', 1002, 0, 'fun', '抖音', 'https://www.douyin.com/', NULL, NULL, NULL, datetime('now'), '0');
INSERT INTO "A7001" VALUES ('fun-netease-003', 1003, 0, 'fun', '网易云音乐', 'https://music.163.com/', NULL, NULL, NULL, datetime('now'), '0');
INSERT INTO "A7001" VALUES ('fun-yinfans-004', 1004, 0, 'fun', '音范丝', 'https://www.yinfans.me/', NULL, NULL, NULL, datetime('now'), '0');

-- 网络分类 (network) - a70Id = 1
INSERT INTO "A7001" VALUES ('net-github-001', 1005, 1, 'network', 'GitHub', 'https://github.com/', NULL, NULL, NULL, datetime('now'), '0');
INSERT INTO "A7001" VALUES ('net-stackoverflow-002', 1006, 1, 'network', 'Stack Overflow', 'https://stackoverflow.com/', NULL, NULL, NULL, datetime('now'), '0');
INSERT INTO "A7001" VALUES ('net-zhihu-003', 1007, 1, 'network', '知乎', 'https://www.zhihu.com/', NULL, NULL, NULL, datetime('now'), '0');
INSERT INTO "A7001" VALUES ('net-juejin-004', 1008, 1, 'network', '掘金', 'https://juejin.cn/', NULL, NULL, NULL, datetime('now'), '0');

-- 工具分类 (tools) - a70Id = 3
INSERT INTO "A7001" VALUES ('tool-baidufanyi-001', 1009, 3, 'tools', '百度翻译', 'https://fanyi.baidu.com/', NULL, NULL, NULL, datetime('now'), '0');
INSERT INTO "A7001" VALUES ('tool-json-002', 1010, 3, 'tools', 'JSON格式化', 'https://www.json.cn/', NULL, NULL, NULL, datetime('now'), '0');
INSERT INTO "A7001" VALUES ('tool-qrcode-003', 1011, 3, 'tools', '二维码生成', 'https://cli.im/', NULL, NULL, NULL, datetime('now'), '0');
INSERT INTO "A7001" VALUES ('tool-cailiao-004', 1012, 3, 'tools', '草料二维码', 'https://cli.im/text', NULL, NULL, NULL, datetime('now'), '0');

-- 软件分类 (software) - a70Id = 4
INSERT INTO "A7001" VALUES ('soft-vscode-001', 1013, 4, 'software', 'VS Code', 'https://code.visualstudio.com/', NULL, NULL, NULL, datetime('now'), '0');
INSERT INTO "A7001" VALUES ('soft-nodejs-002', 1014, 4, 'software', 'Node.js', 'https://nodejs.org/', NULL, NULL, NULL, datetime('now'), '0');
INSERT INTO "A7001" VALUES ('soft-python-003', 1015, 4, 'software', 'Python', 'https://www.python.org/', NULL, NULL, NULL, datetime('now'), '0');
INSERT INTO "A7001" VALUES ('soft-docker-004', 1016, 4, 'software', 'Docker', 'https://www.docker.com/', NULL, NULL, NULL, datetime('now'), '0');

-- 游戏分类 (game) - a70Id = 2
INSERT INTO "A7001" VALUES ('game-steam-001', 1017, 2, 'game', 'Steam', 'https://store.steampowered.com/', NULL, NULL, NULL, datetime('now'), '0');
INSERT INTO "A7001" VALUES ('game-epic-002', 1018, 2, 'game', 'Epic Games', 'https://store.epicgames.com/', NULL, NULL, NULL, datetime('now'), '0');
INSERT INTO "A7001" VALUES ('game-nintendo-003', 1019, 2, 'game', '任天堂', 'https://www.nintendo.com/', NULL, NULL, NULL, datetime('now'), '0');
INSERT INTO "A7001" VALUES ('game-ps-004', 1020, 2, 'game', 'PlayStation', 'https://www.playstation.com/', NULL, NULL, NULL, datetime('now'), '0');

-- ====================
-- 5. 插入示例布局数据到 item_layouts 表
-- ====================

-- 娱乐分类布局
INSERT INTO "item_layouts" VALUES (1, 'fun-bilibili-001', '0', 0, 0, 1, 1, 1, '1', datetime('now'), datetime('now'));
INSERT INTO "item_layouts" VALUES (2, 'fun-douyin-002', '0', 2, 0, 1, 1, 2, '1', datetime('now'), datetime('now'));
INSERT INTO "item_layouts" VALUES (3, 'fun-netease-003', '0', 4, 0, 1, 1, 3, '1', datetime('now'), datetime('now'));
INSERT INTO "item_layouts" VALUES (4, 'fun-yinfans-004', '0', 6, 0, 1, 1, 4, '1', datetime('now'), datetime('now'));

-- 网络分类布局
INSERT INTO "item_layouts" VALUES (5, 'net-github-001', '1', 0, 0, 1, 1, 1, '1', datetime('now'), datetime('now'));
INSERT INTO "item_layouts" VALUES (6, 'net-stackoverflow-002', '1', 2, 0, 1, 1, 2, '1', datetime('now'), datetime('now'));
INSERT INTO "item_layouts" VALUES (7, 'net-zhihu-003', '1', 4, 0, 1, 1, 3, '1', datetime('now'), datetime('now'));
INSERT INTO "item_layouts" VALUES (8, 'net-juejin-004', '1', 6, 0, 1, 1, 4, '1', datetime('now'), datetime('now'));

-- 工具分类布局
INSERT INTO "item_layouts" VALUES (9, 'tool-baidufanyi-001', '3', 0, 0, 1, 1, 1, '1', datetime('now'), datetime('now'));
INSERT INTO "item_layouts" VALUES (10, 'tool-json-002', '3', 2, 0, 1, 1, 2, '1', datetime('now'), datetime('now'));
INSERT INTO "item_layouts" VALUES (11, 'tool-qrcode-003', '3', 4, 0, 1, 1, 3, '1', datetime('now'), datetime('now'));
INSERT INTO "item_layouts" VALUES (12, 'tool-cailiao-004', '3', 6, 0, 1, 1, 4, '1', datetime('now'), datetime('now'));

-- 软件分类布局
INSERT INTO "item_layouts" VALUES (13, 'soft-vscode-001', '4', 0, 0, 1, 1, 1, '1', datetime('now'), datetime('now'));
INSERT INTO "item_layouts" VALUES (14, 'soft-nodejs-002', '4', 2, 0, 1, 1, 2, '1', datetime('now'), datetime('now'));
INSERT INTO "item_layouts" VALUES (15, 'soft-python-003', '4', 4, 0, 1, 1, 3, '1', datetime('now'), datetime('now'));
INSERT INTO "item_layouts" VALUES (16, 'soft-docker-004', '4', 6, 0, 1, 1, 4, '1', datetime('now'), datetime('now'));

-- 游戏分类布局
INSERT INTO "item_layouts" VALUES (17, 'game-steam-001', '2', 0, 0, 1, 1, 1, '1', datetime('now'), datetime('now'));
INSERT INTO "item_layouts" VALUES (18, 'game-epic-002', '2', 2, 0, 1, 1, 2, '1', datetime('now'), datetime('now'));
INSERT INTO "item_layouts" VALUES (19, 'game-nintendo-003', '2', 4, 0, 1, 1, 3, '1', datetime('now'), datetime('now'));
INSERT INTO "item_layouts" VALUES (20, 'game-ps-004', '2', 6, 0, 1, 1, 4, '1', datetime('now'), datetime('now'));

-- ====================
-- 6. 插入示例Dock栏数据
-- ====================
INSERT INTO "dock_items" VALUES (1, 'net-github-001', 1, datetime('now'));
INSERT INTO "dock_items" VALUES (2, 'tool-baidufanyi-001', 2, datetime('now'));
INSERT INTO "dock_items" VALUES (3, 'soft-vscode-001', 3, datetime('now'));
INSERT INTO "dock_items" VALUES (4, 'fun-bilibili-001', 4, datetime('now'));

PRAGMA foreign_keys = true;
