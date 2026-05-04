// ==================== 设置 Modal 处理器 ====================

import settingsManager from '../managers/settings-manager.js';
import ConfirmModal from '../components/confirm-modal.js';
import toast from '../utils/toast.js';

class SettingsModalHandler {
    constructor() {
        this.modal = null;
        this.overlay = null;
        this.currentSettings = {};
    }

    /**
     * 初始化设置 Modal
     */
    init() {
        // 创建 Modal DOM
        this.createModalElement();
        
        // 绑定关闭事件
        this.bindEvents();
    }

    /**
     * 创建 Modal DOM 结构
     */
    createModalElement() {
        // 创建遮罩层
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        
        // 创建 Modal 容器
        this.modal = document.createElement('div');
        this.modal.className = 'settings-modal';
        
        // Modal HTML 结构
        this.modal.innerHTML = `
            <div class="modal-header">
                <h2>⚙️ 设置</h2>
                <button class="modal-close-btn" aria-label="关闭">×</button>
            </div>
            <div class="modal-tabs">
                <button class="tab-btn active" data-tab="basic">📐 基础设置</button>
                <button class="tab-btn" data-tab="advanced">⚙️ 高级设置</button>
            </div>
            <div class="modal-body">
                <div class="tab-content active" id="tab-basic">
                    ${this.generateBasicSettingsSections()}
                </div>
                <div class="tab-content" id="tab-advanced">
                    ${this.generateAdvancedSettingsSections()}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-danger" id="reset-settings-btn">恢复默认</button>
                <div class="btn-group">
                    <button class="btn btn-secondary" id="cancel-settings-btn">取消</button>
                    <button class="btn btn-primary" id="save-settings-btn">保存</button>
                </div>
            </div>
        `;
        
        // 添加到页面
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.modal);
    }

    /**
     * 生成所有设置分类（保留用于兼容）
     */
    generateSettingsSections() {
        return `
            ${this.generateBasicSettingsSections()}
            ${this.generateAdvancedSettingsSections()}
        `;
    }

    /**
     * 生成基础设置部分
     */
    generateBasicSettingsSections() {
        return `
            <!-- 1. 基础设置 -->
            <div class="settings-section">
                <h3>📐 基础设置</h3>
                
                <div class="setting-item">
                    <label for="grid-rows">行数</label>
                    <input type="number" id="grid-rows" min="5" max="9" value="5">
                    <div class="setting-description">网格行数（5-9）</div>
                </div>
                
                <div class="setting-item">
                    <label for="grid-cols">列数</label>
                    <input type="number" id="grid-cols" min="13" max="20" value="13">
                    <div class="setting-description">网格列数（13-20，PC 端最低值）</div>
                </div>
                
                <div class="setting-item">
                    <label for="grid-gap">网格间距</label>
                    <input type="number" id="grid-gap" min="2" max="5" step="0.5" value="2">
                    <div class="setting-description">网格间距（rem 单位，2-5）</div>
                </div>
                
                <div class="setting-item">
                    <label for="sidebar-width">侧栏宽度</label>
                    <input type="number" id="sidebar-width" min="4" max="15" value="6">
                    <div class="setting-description">侧栏宽度百分比（4%-15%）</div>
                </div>
            </div>

            <!-- 2. 外观主题 -->
            <div class="settings-section">
                <h3>🎨 外观主题</h3>
                
                <div class="setting-item">
                    <label for="theme-mode">主题模式</label>
                    <select id="theme-mode">
                        <option value="dark">深色模式</option>
                        <option value="light">浅色模式</option>
                        <option value="auto">自动跟随系统</option>
                    </select>
                </div>
                
                <div class="setting-item">
                    <label for="theme-color">主题色</label>
                    <input type="color" id="theme-color" value="#3B82F6">
                </div>
                
                <div class="setting-item">
                    <label for="bg-image-url">背景图片 URL</label>
                    <input type="url" id="bg-image-url" placeholder="https://example.com/bg.jpg">
                </div>
                
                <div class="setting-item">
                    <label for="bg-blur">背景模糊度</label>
                    <input type="range" id="bg-blur" min="0" max="20" value="5">
                    <span class="range-value" id="bg-blur-value">5</span>
                </div>
                
                <div class="setting-item">
                    <label for="bg-opacity">背景透明度</label>
                    <input type="range" id="bg-opacity" min="0" max="1" step="0.1" value="0.8">
                    <span class="range-value" id="bg-opacity-value">0.8</span>
                </div>
                
                <div class="setting-item">
                    <label for="overlay-color">遮罩层颜色</label>
                    <input type="color" id="overlay-color" value="#000000">
                </div>
                
                <div class="setting-item">
                    <label for="overlay-opacity">遮罩层透明度</label>
                    <input type="range" id="overlay-opacity" min="0" max="1" step="0.1" value="0.3">
                    <span class="range-value" id="overlay-opacity-value">0.3</span>
                </div>
            </div>

            <!-- 3. 图标样式 -->
            <div class="settings-section">
                <h3>🖼️ 图标样式</h3>
                
                <div class="setting-item">
                    <label for="icon-radius">图标圆角</label>
                    <input type="number" id="icon-radius" min="0" max="2" step="0.1" value="0.5">
                    <div class="setting-description">rem 单位</div>
                </div>
                
                <div class="setting-item">
                    <label>图标阴影</label>
                    <div class="switch-container">
                        <div class="switch" id="icon-shadow-switch"></div>
                        <span>启用/禁用</span>
                    </div>
                </div>
                
                <div class="setting-item">
                    <label for="icon-hover-effect">图标悬停效果</label>
                    <select id="icon-hover-effect">
                        <option value="scale">缩放</option>
                        <option value="glow">发光</option>
                        <option value="none">无</option>
                    </select>
                </div>
                
                <div class="setting-item">
                    <label>显示图标标题</label>
                    <div class="switch-container">
                        <div class="switch active" id="show-title-switch"></div>
                        <span>启用/禁用</span>
                    </div>
                </div>
                
                <div class="setting-item">
                    <label for="title-position">标题位置</label>
                    <select id="title-position">
                        <option value="bottom">底部</option>
                        <option value="top">顶部</option>
                        <option value="floating">浮动</option>
                    </select>
                </div>
                
                <div class="setting-item">
                    <label for="title-font-size">标题字体大小</label>
                    <input type="number" id="title-font-size" min="10" max="18" value="12">
                    <div class="setting-description">px 单位</div>
                </div>
                
                <div class="setting-item">
                    <label for="title-font-color">标题字体颜色</label>
                    <input type="color" id="title-font-color" value="#ffffff">
                </div>
                
                <div class="setting-item">
                    <label for="title-max-length">标题最大长度</label>
                    <input type="number" id="title-max-length" min="4" max="20" value="8">
                    <div class="setting-description">字符数（超过显示 ...）</div>
                </div>
                
                <div class="setting-item">
                    <label for="tooltip-delay">气泡提示延迟</label>
                    <input type="number" id="tooltip-delay" min="0" max="1000" value="300">
                    <div class="setting-description">ms 单位</div>
                </div>
            </div>

            <!-- 4. Dock 设置 -->
            <div class="settings-section">
                <h3>⚓ Dock 设置</h3>
                
                <div class="setting-item">
                    <label for="dock-position">Dock 位置</label>
                    <select id="dock-position">
                        <option value="bottom">底部</option>
                        <option value="left">左侧</option>
                        <option value="right">右侧</option>
                    </select>
                </div>
                
                <div class="setting-item">
                    <label for="dock-max-icons">Dock 最大图标数量</label>
                    <input type="number" id="dock-max-icons" min="5" max="20" value="10">
                </div>
                
                <div class="setting-item">
                    <label for="dock-blur">Dock 背景模糊度</label>
                    <input type="number" id="dock-blur" min="0" max="30" value="10">
                    <div class="setting-description">px 单位</div>
                </div>
                
                <div class="setting-item">
                    <label for="dock-opacity">Dock 背景透明度</label>
                    <input type="range" id="dock-opacity" min="0" max="1" step="0.1" value="0.3">
                    <span class="range-value" id="dock-opacity-value">0.3</span>
                </div>
                
                <div class="setting-item">
                    <label for="fisheye-scale">鱼眼放大倍数</label>
                    <input type="number" id="fisheye-scale" min="1" max="3" step="0.1" value="1.5">
                </div>
                
                <div class="setting-item">
                    <label for="fisheye-range">鱼眼影响范围</label>
                    <input type="number" id="fisheye-range" min="1" max="5" value="2">
                    <div class="setting-description">左右各几个图标</div>
                </div>
            </div>

            <!-- 5. 搜索设置 -->
            <div class="settings-section">
                <h3>🔍 搜索设置</h3>
                
                <div class="setting-item">
                    <label for="default-search-engine">默认搜索引擎</label>
                    <select id="default-search-engine">
                        <option value="baidu">百度</option>
                        <option value="bing">必应</option>
                        <option value="google">Google</option>
                    </select>
                </div>
                
                <div class="setting-item">
                    <label for="search-box-position">搜索框位置</label>
                    <select id="search-box-position">
                        <option value="center">居中</option>
                        <option value="left">居左</option>
                        <option value="right">居右</option>
                    </select>
                </div>
                
                <div class="setting-item">
                    <label for="search-box-style">搜索框样式</label>
                    <select id="search-box-style">
                        <option value="rounded">圆角</option>
                        <option value="square">方角</option>
                    </select>
                </div>
            </div>
        `;
    }

    /**
     * 生成高级设置部分
     */
    generateAdvancedSettingsSections() {
        return `
            <!-- 1. 交互行为 -->
            <div class="settings-section">
                <h3>🎯 交互行为</h3>
                
                <div class="setting-item">
                    <label for="scroll-animation-speed">滚动动画速度</label>
                    <input type="number" id="scroll-animation-speed" min="100" max="1000" value="300">
                    <div class="setting-description">ms 单位</div>
                </div>
                
                <div class="setting-item">
                    <label for="drag-sensitivity">拖拽灵敏度</label>
                    <input type="number" id="drag-sensitivity" min="1" max="20" value="5">
                    <div class="setting-description">px 单位</div>
                </div>
                
                <div class="setting-item">
                    <label>启用右键菜单</label>
                    <div class="switch-container">
                        <div class="switch active" id="enable-context-menu-switch"></div>
                        <span>启用/禁用</span>
                    </div>
                </div>
            </div>

            <!-- 2. 个人信息 -->
            <div class="settings-section">
                <h3>👤 个人信息</h3>
                
                <div class="setting-item">
                    <label for="avatar-url">头像 URL</label>
                    <input type="url" id="avatar-url" placeholder="https://example.com/avatar.jpg">
                </div>
                
                <div class="setting-item">
                    <label for="username">用户名</label>
                    <input type="text" id="username" placeholder="请输入用户名">
                </div>
                
                <div class="setting-item">
                    <label for="bio">个人简介</label>
                    <input type="text" id="bio" placeholder="简短介绍">
                </div>
            </div>

            <!-- 3. 高级功能 -->
            <div class="settings-section">
                <h3>⚙️ 高级功能</h3>
                
                <div class="setting-item">
                    <button class="btn btn-secondary" id="export-config-btn" style="width: 100%; margin-bottom: 0.5rem;">
                        📥 导出配置
                    </button>
                    <div class="setting-description">导出为 JSON 文件</div>
                </div>
                
                <div class="setting-item">
                    <button class="btn btn-secondary" id="import-config-btn" style="width: 100%;">
                        📤 导入配置
                    </button>
                    <div class="setting-description">从 JSON 文件导入</div>
                    <input type="file" id="import-config-file" accept=".json" style="display: none;">
                </div>
            </div>
        `;
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 关闭按钮
        const closeBtn = this.modal.querySelector('.modal-close-btn');
        closeBtn.addEventListener('click', () => this.close());
        
        // 点击遮罩层关闭
        this.overlay.addEventListener('click', () => this.close());
        
        // ESC 键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
        
        // 取消按钮
        const cancelBtn = document.getElementById('cancel-settings-btn');
        cancelBtn.addEventListener('click', () => this.close());
        
        // 保存按钮
        const saveBtn = document.getElementById('save-settings-btn');
        saveBtn.addEventListener('click', () => this.saveSettings());
        
        // 恢复默认按钮
        const resetBtn = document.getElementById('reset-settings-btn');
        resetBtn.addEventListener('click', () => this.resetToDefault());
        
        // 页签切换
        this.bindTabSwitching();
        
        // 滑块值实时更新
        this.bindRangeInputs();
        
        // 开关切换
        this.bindSwitches();
        
        // 导出配置
        const exportBtn = document.getElementById('export-config-btn');
        exportBtn.addEventListener('click', () => this.exportConfig());
        
        // 导入配置
        const importBtn = document.getElementById('import-config-btn');
        const importFile = document.getElementById('import-config-file');
        importBtn.addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', (e) => this.importConfig(e));
    }

    /**
     * 绑定页签切换
     */
    bindTabSwitching() {
        const tabBtns = this.modal.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                this.switchTab(targetTab);
            });
        });
    }

    /**
     * 切换页签
     */
    switchTab(tabName) {
        // 移除所有 active 类
        const tabBtns = this.modal.querySelectorAll('.tab-btn');
        const tabContents = this.modal.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // 激活目标页签
        const targetBtn = this.modal.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        const targetContent = this.modal.querySelector(`#tab-${tabName}`);
        
        if (targetBtn && targetContent) {
            targetBtn.classList.add('active');
            targetContent.classList.add('active');
        }
    }

    /**
     * 绑定滑块输入
     */
    bindRangeInputs() {
        const rangeInputs = [
            { input: 'bg-blur', display: 'bg-blur-value' },
            { input: 'bg-opacity', display: 'bg-opacity-value' },
            { input: 'overlay-opacity', display: 'overlay-opacity-value' },
            { input: 'dock-opacity', display: 'dock-opacity-value' }
        ];
        
        rangeInputs.forEach(({ input, display }) => {
            const inputEl = document.getElementById(input);
            const displayEl = document.getElementById(display);
            if (inputEl && displayEl) {
                inputEl.addEventListener('input', (e) => {
                    displayEl.textContent = e.target.value;
                });
            }
        });
    }

    /**
     * 绑定开关切换
     */
    bindSwitches() {
        const switches = [
            'icon-shadow-switch',
            'show-title-switch',
            'enable-context-menu-switch'
        ];
        
        switches.forEach(switchId => {
            const switchEl = document.getElementById(switchId);
            if (switchEl) {
                switchEl.addEventListener('click', () => {
                    switchEl.classList.toggle('active');
                });
            }
        });
    }

    /**
     * 打开设置 Modal
     */
    open() {
        // 加载当前设置
        this.loadCurrentSettings();
        
        // 显示 Modal
        this.overlay.classList.add('active');
        this.modal.classList.add('active');
        
        console.log('✅ 设置 Modal 已打开');
    }

    /**
     * 关闭设置 Modal
     */
    close() {
        this.overlay.classList.remove('active');
        this.modal.classList.remove('active');
        
        console.log('✅ 设置 Modal 已关闭');
    }

    /**
     * 加载当前设置到表单
     */
    loadCurrentSettings() {
        // TODO: 从 settingsManager 获取实际设置
        this.currentSettings = settingsManager.getAllSettings();
        
        // 填充表单字段
        this.fillFormFields();
    }

    /**
     * 填充表单字段
     */
    fillFormFields() {
        const settings = this.currentSettings;
        
        // 基础设置
        document.getElementById('grid-rows').value = settings.gridRows || 5;
        document.getElementById('grid-cols').value = settings.gridCols || 13;
        document.getElementById('grid-gap').value = settings.gridGap || 2;
        document.getElementById('sidebar-width').value = settings.sidebarWidth || 6;
        
        // 外观主题
        document.getElementById('theme-mode').value = settings.themeMode || 'dark';
        document.getElementById('theme-color').value = settings.themeColor || '#3B82F6';
        document.getElementById('bg-image-url').value = settings.bgImageUrl || '';
        document.getElementById('bg-blur').value = settings.bgBlur || 5;
        document.getElementById('bg-blur-value').textContent = settings.bgBlur || 5;
        document.getElementById('bg-opacity').value = settings.bgOpacity || 0.8;
        document.getElementById('bg-opacity-value').textContent = settings.bgOpacity || 0.8;
        document.getElementById('overlay-color').value = settings.overlayColor || '#000000';
        document.getElementById('overlay-opacity').value = settings.overlayOpacity || 0.3;
        document.getElementById('overlay-opacity-value').textContent = settings.overlayOpacity || 0.3;
        
        // 图标样式
        document.getElementById('icon-radius').value = settings.iconRadius || 0.5;
        this.setSwitchState('icon-shadow-switch', settings.iconShadow !== false);
        document.getElementById('icon-hover-effect').value = settings.iconHoverEffect || 'scale';
        this.setSwitchState('show-title-switch', settings.showTitle !== false);
        document.getElementById('title-position').value = settings.titlePosition || 'bottom';
        document.getElementById('title-font-size').value = settings.titleFontSize || 12;
        document.getElementById('title-font-color').value = settings.titleFontColor || '#ffffff';
        document.getElementById('title-max-length').value = settings.titleMaxLength || 8;
        document.getElementById('tooltip-delay').value = settings.tooltipDelay || 300;
        
        // Dock 设置
        document.getElementById('dock-position').value = settings.dockPosition || 'bottom';
        document.getElementById('dock-max-icons').value = settings.dockMaxIcons || 10;
        document.getElementById('dock-blur').value = settings.dockBlur || 10;
        document.getElementById('dock-opacity').value = settings.dockOpacity || 0.3;
        document.getElementById('dock-opacity-value').textContent = settings.dockOpacity || 0.3;
        document.getElementById('fisheye-scale').value = settings.fisheyeScale || 1.5;
        document.getElementById('fisheye-range').value = settings.fisheyeRange || 2;
        
        // 搜索设置
        document.getElementById('default-search-engine').value = settings.defaultSearchEngine || 'baidu';
        document.getElementById('search-box-position').value = settings.searchBoxPosition || 'center';
        document.getElementById('search-box-style').value = settings.searchBoxStyle || 'rounded';
        
        // 交互行为
        document.getElementById('scroll-animation-speed').value = settings.scrollAnimationSpeed || 300;
        document.getElementById('drag-sensitivity').value = settings.dragSensitivity || 5;
        this.setSwitchState('enable-context-menu-switch', settings.enableContextMenu !== false);
        
        // 个人信息
        document.getElementById('avatar-url').value = settings.avatarUrl || '';
        document.getElementById('username').value = settings.username || '';
        document.getElementById('bio').value = settings.bio || '';
    }

    /**
     * 设置开关状态
     */
    setSwitchState(switchId, isActive) {
        const switchEl = document.getElementById(switchId);
        if (switchEl) {
            if (isActive) {
                switchEl.classList.add('active');
            } else {
                switchEl.classList.remove('active');
            }
        }
    }

    /**
     * 保存设置
     */
    async saveSettings() {
        const newSettings = this.collectFormValues();
        
        try {
            await settingsManager.saveAllSettings(newSettings);
            console.log('✅ 设置已保存', newSettings);
            
            // 应用设置
            this.applySettings(newSettings);
            
            // 关闭 Modal
            this.close();
            
            // 显示成功提示
            toast.success('设置已保存！');
        } catch (error) {
            console.error(' 保存设置失败:', error);
            toast.error('保存设置失败，请重试');
        }
    }

    /**
     * 收集表单值
     */
    collectFormValues() {
        return {
            // 基础设置
            gridRows: parseInt(document.getElementById('grid-rows').value),
            gridCols: parseInt(document.getElementById('grid-cols').value),
            gridGap: parseFloat(document.getElementById('grid-gap').value) || 2,
            sidebarWidth: parseInt(document.getElementById('sidebar-width').value),
            
            // 外观主题
            themeMode: document.getElementById('theme-mode').value,
            themeColor: document.getElementById('theme-color').value,
            bgImageUrl: document.getElementById('bg-image-url').value,
            bgBlur: parseInt(document.getElementById('bg-blur').value),
            bgOpacity: parseFloat(document.getElementById('bg-opacity').value),
            overlayColor: document.getElementById('overlay-color').value,
            overlayOpacity: parseFloat(document.getElementById('overlay-opacity').value),
            
            // 图标样式
            iconRadius: parseFloat(document.getElementById('icon-radius').value),
            iconShadow: document.getElementById('icon-shadow-switch').classList.contains('active'),
            iconHoverEffect: document.getElementById('icon-hover-effect').value,
            showTitle: document.getElementById('show-title-switch').classList.contains('active'),
            titlePosition: document.getElementById('title-position').value,
            titleFontSize: parseInt(document.getElementById('title-font-size').value),
            titleFontColor: document.getElementById('title-font-color').value,
            titleMaxLength: parseInt(document.getElementById('title-max-length').value),
            tooltipDelay: parseInt(document.getElementById('tooltip-delay').value),
            
            // Dock 设置
            dockPosition: document.getElementById('dock-position').value,
            dockMaxIcons: parseInt(document.getElementById('dock-max-icons').value),
            dockBlur: parseInt(document.getElementById('dock-blur').value),
            dockOpacity: parseFloat(document.getElementById('dock-opacity').value),
            fisheyeScale: parseFloat(document.getElementById('fisheye-scale').value),
            fisheyeRange: parseInt(document.getElementById('fisheye-range').value),
            
            // 搜索设置
            defaultSearchEngine: document.getElementById('default-search-engine').value,
            searchBoxPosition: document.getElementById('search-box-position').value,
            searchBoxStyle: document.getElementById('search-box-style').value,
            
            // 交互行为
            scrollAnimationSpeed: parseInt(document.getElementById('scroll-animation-speed').value),
            dragSensitivity: parseInt(document.getElementById('drag-sensitivity').value),
            enableContextMenu: document.getElementById('enable-context-menu-switch').classList.contains('active'),
            
            // 个人信息
            avatarUrl: document.getElementById('avatar-url').value,
            username: document.getElementById('username').value,
            bio: document.getElementById('bio').value
        };
    }

    /**
     * 应用设置到页面
     */
    applySettings(settings) {
        console.log('🔄 应用设置...', settings);
        
        // 1. 更新主题色
        document.documentElement.style.setProperty('--theme-color', settings.themeColor);
        
        // 2. 更新背景（默认为空）
        if (settings.bgImageUrl) {
            document.body.style.backgroundImage = `url(${settings.bgImageUrl})`;
        } else {
            document.body.style.backgroundImage = 'none';
        }
        
        // 3. 应用图标圆角
        this.applyIconRadius(settings.iconRadius);
        
        // 4. 应用标题设置
        this.applyTitleSettings(settings);
        
        // 5. 应用搜索框位置
        this.applySearchBoxPosition(settings.searchBoxPosition);
        
        // 6. 应用搜索框样式
        this.applySearchBoxStyle(settings.searchBoxStyle);
        
        // 7. 应用网格设置
        this.applyGridSettings(settings);
        
        // 8. 应用 Dock 设置
        this.applyDockSettings(settings);
        
        console.log('✅ 所有设置已应用');
    }
    
    /**
     * 应用搜索框位置
     */
    applySearchBoxPosition(position) {
        const searchContainer = document.querySelector('.search-container');
        if (!searchContainer) return;
        
        // 重置所有位置样式
        searchContainer.style.top = '';
        searchContainer.style.bottom = '';
        searchContainer.style.left = '';
        searchContainer.style.right = '';
        searchContainer.style.transform = '';
        
        switch(position) {
            case 'center':
                searchContainer.style.top = '2rem';
                searchContainer.style.left = '50%';
                searchContainer.style.transform = 'translateX(-50%)';
                break;
            case 'left':
                searchContainer.style.top = '2rem';
                searchContainer.style.left = '2rem';
                searchContainer.style.transform = 'none';
                break;
            case 'right':
                searchContainer.style.top = '2rem';
                searchContainer.style.right = '2rem';
                searchContainer.style.left = 'auto';
                searchContainer.style.transform = 'none';
                break;
        }
    }
    
    /**
     * 应用搜索框样式
     */
    applySearchBoxStyle(style) {
        const searchBox = document.querySelector('.search-box');
        if (!searchBox) return;
        
        switch(style) {
            case 'rounded':
                searchBox.style.borderRadius = '2rem';
                break;
            case 'square':
                searchBox.style.borderRadius = '0.5rem';
                break;
        }
    }
    
    /**
     * 应用图标圆角设置
     */
    applyIconRadius(radius) {
        const radiusValue = radius || 0.5;
        document.documentElement.style.setProperty('--icon-radius', `${radiusValue}rem`);
        console.log(`✅ 图标圆角已更新: ${radiusValue}rem`);
    }
    
    /**
     * 应用标题设置
     */
    applyTitleSettings(settings) {
        // 1. 应用标题字体大小
        const fontSize = settings.titleFontSize || 12;
        document.documentElement.style.setProperty('--title-font-size', `${fontSize}px`);
        console.log(`✅ 标题字体大小已更新: ${fontSize}px`);
        
        // 2. 应用标题字体颜色
        const fontColor = settings.titleFontColor || '#ffffff';
        document.documentElement.style.setProperty('--title-color', fontColor);
        console.log(`✅ 标题字体颜色已更新: ${fontColor}`);
        
        // 3. 应用标题位置
        const position = settings.titlePosition || 'bottom';
        document.documentElement.style.setProperty('--title-position', position);
        console.log(`✅ 标题位置已更新: ${position}`);
        
        // 4. 应用标题最大长度
        const maxLength = settings.titleMaxLength || 8;
        document.documentElement.style.setProperty('--title-max-length', maxLength);
        console.log(`✅ 标题最大长度已更新: ${maxLength}`);
        
        // 5. 重新渲染所有图标以应用新设置
        this.refreshAllIcons();
    }
    
    /**
     * 刷新所有图标以应用新设置
     */
    refreshAllIcons() {
        const icons = document.querySelectorAll('nav-icon');
        icons.forEach(icon => {
            // 触发重新渲染
            const title = icon.getAttribute('title');
            if (title) {
                icon.setAttribute('title', title);
            }
        });
        console.log(`✅ 已刷新 ${icons.length} 个图标`);
    }
    
    /**
     * 应用网格设置
     */
    applyGridSettings(settings) {
        // 更新网格间距 CSS 变量
        const gapValue = settings.gridGap || 2;
        document.documentElement.style.setProperty('--cell-gap', `${gapValue}rem`);
        console.log(`✅ 网格间距已更新: ${gapValue}rem`);
        
        // 更新所有网格容器的行列数
        const gridContainers = document.querySelectorAll('.grid-container');
        gridContainers.forEach(container => {
            // 设置固定的列数
            container.style.gridTemplateColumns = `repeat(${settings.gridCols || 13}, var(--cell-base-size))`;
            // 设置固定的行数（如果需要）
            // container.style.gridTemplateRows = `repeat(${settings.gridRows || 5}, var(--cell-base-size))`;
        });
        
        console.log(`✅ 网格列数已更新: ${settings.gridCols || 13}`);
    }
    
    /**
     * 应用 Dock 设置
     */
    applyDockSettings(settings) {
        const dock = document.getElementById('dock');
        if (!dock) return;
        
        // 更新 Dock 位置
        dock.style.bottom = '';
        dock.style.left = '';
        dock.style.right = '';
        dock.style.top = '';
        dock.style.transform = '';
        dock.style.flexDirection = '';
        
        switch(settings.dockPosition) {
            case 'bottom':
                dock.style.bottom = '1rem';
                dock.style.left = '50%';
                dock.style.transform = 'translateX(-50%)';
                dock.style.flexDirection = 'row';
                break;
            case 'left':
                dock.style.left = '1rem';
                dock.style.top = '50%';
                dock.style.transform = 'translateY(-50%)';
                dock.style.flexDirection = 'column';
                break;
            case 'right':
                dock.style.right = '1rem';
                dock.style.top = '50%';
                dock.style.transform = 'translateY(-50%)';
                dock.style.flexDirection = 'column';
                break;
        }
    }

    /**
     * 恢复默认设置
     */
    async resetToDefault() {
        const confirmed = await ConfirmModal.show({
            title: '恢复默认设置',
            message: '确定要恢复所有设置为默认值吗？\n此操作不可撤销。',
            confirmText: '恢复默认',
            cancelText: '取消',
            type: 'danger'
        });
        
        if (!confirmed) {
            return;
        }
        
        try {
            await settingsManager.resetToDefault();
            console.log('✅ 已恢复默认设置');
            
            // 重新加载设置
            this.loadCurrentSettings();
            
            toast.success('已恢复默认设置');
        } catch (error) {
            console.error('❌ 恢复默认设置失败:', error);
            toast.error('恢复默认设置失败，请重试');
        }
    }

    /**
     * 导出配置
     */
    exportConfig() {
        const settings = this.currentSettings;
        const jsonStr = JSON.stringify(settings, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `votilarus-config-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        console.log('✅ 配置已导出');
        toast.success('配置已导出');
    }

    /**
     * 导入配置
     */
    importConfig(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const settings = JSON.parse(e.target.result);
                
                const confirmed = await ConfirmModal.show({
                    title: '导入配置',
                    message: '导入配置将覆盖当前设置，是否继续？',
                    confirmText: '继续导入',
                    cancelText: '取消',
                    type: 'warning'
                });
                        
                if (!confirmed) {
                    return;
                }
                
                await settingsManager.saveAllSettings(settings);
                console.log('✅ 配置已导入', settings);
                
                // 重新加载设置
                this.loadCurrentSettings();
                
                toast.success('配置导入成功');
            } catch (error) {
                console.error('❌ 导入配置失败:', error);
                toast.error('导入配置失败，请检查文件格式');
            }
        };
        reader.readAsText(file);
        
        // 清空文件选择
        event.target.value = '';
    }
}

export default new SettingsModalHandler();
