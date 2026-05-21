// ==================== 设置 Modal 处理器 ====================

import SettingsManager from '../../managers/SettingsManager.js';
import ConfirmModal from '../../components/ConfirmModal.js';
import ToastNotification from '../../utils/ToastNotification.js';

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
                <button class="tab-btn active" data-tab="appearance">🎨 外观主题</button>
                <button class="tab-btn" data-tab="icon">🖼️ 图标设置</button>
                <button class="tab-btn" data-tab="dock">⚓ Dock 设置</button>
                <button class="tab-btn" data-tab="search">🔍 搜索设置</button>
                <button class="tab-btn" data-tab="widget">🧩 组件设置</button>
                <button class="tab-btn" data-tab="advanced">⚙️ 高级设置</button>
            </div>
            <div class="modal-body">
                <div class="tab-content active" id="tab-appearance">
                    ${this.generateAppearanceSection()}
                </div>
                <div class="tab-content" id="tab-icon">
                    ${this.generateIconSettingsSection()}
                </div>
                <div class="tab-content" id="tab-dock">
                    ${this.generateDockSection()}
                </div>
                <div class="tab-content" id="tab-search">
                    ${this.generateSearchSection()}
                </div>
                <div class="tab-content" id="tab-widget">
                    ${this.generateWidgetSection()}
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
            ${this.generateAppearanceSection()}
            ${this.generateIconSettingsSection()}
            ${this.generateDockSection()}
            ${this.generateSearchSection()}
            ${this.generateAdvancedSettingsSections()}
        `;
    }

    /**
     * 生成外观主题部分
     */
    generateAppearanceSection() {
        return `
            <!-- 1. 外观主题 -->
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
                    <label for="global-font">全局字体</label>
                    <select id="global-font">
                        <option value="NotoSansSC-Regular">JetBrains Mono Regular</option>
                        <option value="NotoSansSC-Bold">JetBrains Mono Bold</option>
                        <option value="Segoe UI">Segoe UI</option>
                    </select>
                    <div class="setting-description">设置整个应用的默认字体</div>
                </div>
                
                <!-- 背景样式 -->
                <h4 style="margin: 1.5rem 0 1rem 0; color: var(--text-primary); font-size: 1.1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--theme-color);">🖼️ 背景样式</h4>
                
                <div class="setting-item">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <label style="margin: 0;">启用背景图片</label>
                        <div class="switch-container" style="gap: 0.5rem;">
                            <div class="switch" id="bg-image-switch"></div>
                            <span>启用/禁用</span>
                        </div>
                    </div>
                </div>
                
                <div class="setting-item">
                    <label for="bg-image-url">背景图片 URL</label>
                    <input type="url" id="bg-image-url" placeholder="https://example.com/bg.jpg" disabled>
                </div>
                
                <div class="setting-item">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <label style="margin: 0;">启用背景模糊</label>
                        <div class="switch-container" style="gap: 0.5rem;">
                            <div class="switch" id="bg-blur-switch"></div>
                            <span>启用/禁用</span>
                        </div>
                    </div>
                </div>
                
                <div class="setting-item">
                    <label for="bg-blur">背景模糊度</label>
                    <input type="range" id="bg-blur" min="0" max="20" value="5" disabled>
                    <span class="range-value" id="bg-blur-value">5</span>
                </div>
                
                <div class="setting-item">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <label style="margin: 0;">启用背景透明度</label>
                        <div class="switch-container" style="gap: 0.5rem;">
                            <div class="switch" id="bg-opacity-switch"></div>
                            <span>启用/禁用</span>
                        </div>
                    </div>
                </div>
                
                <div class="setting-item">
                    <label for="bg-opacity">背景透明度</label>
                    <input type="range" id="bg-opacity" min="0" max="1" step="0.1" value="0.8" disabled>
                    <span class="range-value" id="bg-opacity-value">0.8</span>
                </div>
                
                <div class="setting-item">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <label style="margin: 0;">启用遮罩层颜色</label>
                        <div class="switch-container" style="gap: 0.5rem;">
                            <div class="switch" id="overlay-color-switch"></div>
                            <span>启用/禁用</span>
                        </div>
                    </div>
                </div>
                
                <div class="setting-item">
                    <label for="overlay-color">遮罩层颜色</label>
                    <input type="color" id="overlay-color" value="#000000" disabled>
                </div>
                
                <div class="setting-item">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <label style="margin: 0;">启用遮罩层透明度</label>
                        <div class="switch-container" style="gap: 0.5rem;">
                            <div class="switch" id="overlay-opacity-switch"></div>
                            <span>启用/禁用</span>
                        </div>
                    </div>
                </div>
                
                <div class="setting-item">
                    <label for="overlay-opacity">遮罩层透明度</label>
                    <input type="range" id="overlay-opacity" min="0" max="1" step="0.1" value="0.3" disabled>
                    <span class="range-value" id="overlay-opacity-value">0.3</span>
                </div>
            </div>
        `;
    }

    /**
     * 生成图标设置部分
     */
    generateIconSettingsSection() {
        return `
            <!-- 1. 图标设置 -->
            <div class="settings-section">
                <h3>🖼️ 图标设置</h3>
                
                <!-- 网格布局 -->
                <div class="setting-item">
                    <label for="grid-rows">行数</label>
                    <input type="number" id="grid-rows" min="4" max="9" value="5">
                    <div class="setting-description">网格行数（4-9）</div>
                </div>
                
                <div class="setting-item">
                    <label for="grid-cols">列数</label>
                    <input type="number" id="grid-cols" min="4" max="20" value="13">
                    <div class="setting-description">网格列数（4-20，PC 端最低值）</div>
                </div>
                
                <div class="setting-item">
                    <label for="grid-gap">网格间距</label>
                    <input type="number" id="grid-gap" min="2" max="5" step="0.5" value="2">
                    <div class="setting-description">网格间距（rem 单位，2-5）</div>
                </div>
                
                <div class="setting-item">
                    <label for="sidebar-width">侧栏宽度</label>
                    <select id="sidebar-width">
                        <option value="50">50px（默认）</option>
                        <option value="60">60px</option>
                        <option value="70">70px</option>
                        <option value="80">80px</option>
                        <option value="100">100px</option>
                        <option value="120">120px</option>
                    </select>
                    <div class="setting-description">侧栏固定宽度（< 40px 时自动隐藏）</div>
                </div>
                
                <!-- 图标样式 -->
                <div class="setting-item">
                    <label for="icon-radius">图标圆角</label>
                    <input type="number" id="icon-radius" min="0" max="2" step="0.1" value="1">
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
                
                <!-- 标题设置 -->
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
        `;
    }

    /**
     * 生成 Dock 设置部分
     */
    generateDockSection() {
        return `
            <!-- 1. Dock 设置 -->
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
        `;
    }

    /**
     * 生成搜索设置部分
     */
    generateSearchSection() {
        return `
            <!-- 1. 搜索设置 -->
            <div class="settings-section">
                <h3>🔍 搜索设置</h3>
                
                <div class="setting-item">
                    <label for="default-search-engine">默认搜索引擎</label>
                    <select id="default-search-engine">
                        <option value="">加载中...</option>
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
     * 生成组件设置部分
     */
    generateWidgetSection() {
        return `
            <!-- 1. 组件设置 -->
            <div class="settings-section">
                <h3>🧩 组件设置</h3>
                
                <div class="setting-item">
                    <label for="widget-border-radius">组件圆角半径</label>
                    <input type="range" id="widget-border-radius" min="0" max="3" step="0.1" value="1.4">
                    <span class="range-value" id="widget-border-radius-value">1.4rem</span>
                    <div class="setting-description">rem 单位，影响所有 Widget 组件的圆角</div>
                </div>
            </div>
        `;
    }

    /**
     * 从 API 加载搜索引擎列表并填充到下拉框
     */
    async populateSearchEngines() {
        try {
            const response = await fetch('/api/search-engines');
            if (!response.ok) {
                throw new Error('Failed to fetch search engines');
            }

            const engines = await response.json();
            const selectElement = document.getElementById('default-search-engine');

            if (!selectElement) {
                console.error('default-search-engine element not found');
                return;
            }

            // 清空现有选项
            selectElement.innerHTML = '';

            // 添加默认选项
            if (engines.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = '暂无搜索引擎';
                selectElement.appendChild(option);
                return;
            }

            // 按 sort_order 排序
            engines.sort((a, b) => (a.sort_order || 999) - (b.sort_order || 999));

            // 添加所有搜索引擎选项
            engines.forEach(engine => {
                const option = document.createElement('option');
                option.value = engine.title_en;
                option.textContent = engine.title;
                selectElement.appendChild(option);
            });

        } catch (error) {
            console.error('Error loading search engines:', error);
            // 如果加载失败，显示错误信息
            const selectElement = document.getElementById('default-search-engine');
            if (selectElement) {
                selectElement.innerHTML = '<option value="">加载失败</option>';
            }
        }
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

        rangeInputs.forEach(({ input, display, unit = '' }) => {
            const inputEl = document.getElementById(input);
            const displayEl = document.getElementById(display);
            if (inputEl && displayEl) {
                inputEl.addEventListener('input', (e) => {
                    displayEl.textContent = e.target.value + unit;
                });
            }
        });

        // 组件圆角滑块 - 添加实时预览功能
        const widgetBorderRadiusInput = document.getElementById('widget-border-radius');
        const widgetBorderRadiusDisplay = document.getElementById('widget-border-radius-value');
        if (widgetBorderRadiusInput && widgetBorderRadiusDisplay) {
            widgetBorderRadiusInput.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                widgetBorderRadiusDisplay.textContent = value + 'rem';
                // 实时应用样式
                this.applyWidgetBorderRadius(value);
            });
        }
    }

    /**
     * 绑定开关切换
     */
    bindSwitches() {
        const switches = [
            'icon-shadow-switch',
            'show-title-switch',
            'enable-context-menu-switch',
            'bg-image-switch',
            'bg-blur-switch',
            'bg-opacity-switch',
            'overlay-color-switch',
            'overlay-opacity-switch'
        ];

        switches.forEach(switchId => {
            const switchEl = document.getElementById(switchId);
            if (switchEl) {
                switchEl.addEventListener('click', () => {
                    switchEl.classList.toggle('active');

                    // 根据开关状态启用/禁用对应的输入控件
                    this.toggleControlBySwitch(switchId);
                });
            }
        });
    }

    /**
     * 根据开关状态启用/禁用对应的输入控件
     */
    toggleControlBySwitch(switchId) {
        const switchEl = document.getElementById(switchId);
        const isActive = switchEl.classList.contains('active');

        let controlId;
        switch (switchId) {
            case 'bg-image-switch':
                controlId = 'bg-image-url';
                break;
            case 'bg-blur-switch':
                controlId = 'bg-blur';
                break;
            case 'bg-opacity-switch':
                controlId = 'bg-opacity';
                break;
            case 'overlay-color-switch':
                controlId = 'overlay-color';
                break;
            case 'overlay-opacity-switch':
                controlId = 'overlay-opacity';
                break;
            default:
                return;
        }

        const controlEl = document.getElementById(controlId);
        if (controlEl) {
            controlEl.disabled = !isActive;
        }
    }

    /**
     * 打开设置 Modal
     */
    async open() {
        // 加载当前设置
        await this.loadCurrentSettings();

        // 显示 Modal
        this.overlay.classList.add('active');
        this.modal.classList.add('active');
    }

    /**
     * 关闭设置 Modal
     */
    close() {
        // 恢复表单字段到原始值（撤销实时预览的更改）
        this.fillFormFields();

        // 恢复页面上的样式到原始值
        this.applySettings(this.currentSettings);

        this.overlay.classList.remove('active');
        this.modal.classList.remove('active');
    }

    /**
     * 加载当前设置到表单
     */
    async loadCurrentSettings() {
        // TODO: 从 settingsManager 获取实际设置
        this.currentSettings = SettingsManager.getAllSettings();

        // 填充表单字段
        await this.fillFormFields();
    }

    /**
     * 填充表单字段
     */
    async fillFormFields() {
        const settings = this.currentSettings;

        // 基础设置
        document.getElementById('grid-rows').value = settings.gridRows || 5;
        document.getElementById('grid-cols').value = settings.gridCols || 13;
        document.getElementById('grid-gap').value = settings.gridGap || 2;
        document.getElementById('sidebar-width').value = settings.sidebarWidth || 50;

        // 外观主题
        document.getElementById('theme-mode').value = settings.themeMode || 'light';
        document.getElementById('theme-color').value = settings.themeColor || '#3b82f6';
        document.getElementById('global-font').value = settings.globalFont || 'NotoSansSC-Regular';

        // 背景图片开关和值
        const bgImageEnabled = settings.bgImageEnabled === true; // 默认关闭（根据SQL）
        this.setSwitchState('bg-image-switch', bgImageEnabled);
        document.getElementById('bg-image-url').value = settings.bgImageUrl || '';
        document.getElementById('bg-image-url').disabled = !bgImageEnabled;

        // 背景模糊度开关和值
        const bgBlurEnabled = settings.bgBlurEnabled === true; // 默认关闭（根据SQL）
        this.setSwitchState('bg-blur-switch', bgBlurEnabled);
        document.getElementById('bg-blur').value = settings.bgBlur || 5;
        document.getElementById('bg-blur-value').textContent = settings.bgBlur || 5;
        document.getElementById('bg-blur').disabled = !bgBlurEnabled;

        // 背景透明度开关和值
        const bgOpacityEnabled = settings.bgOpacityEnabled === true; // 默认关闭（根据SQL）
        this.setSwitchState('bg-opacity-switch', bgOpacityEnabled);
        document.getElementById('bg-opacity').value = settings.bgOpacity || 0.8;
        document.getElementById('bg-opacity-value').textContent = settings.bgOpacity || 0.8;
        document.getElementById('bg-opacity').disabled = !bgOpacityEnabled;

        // 遮罩层颜色开关和值
        const overlayColorEnabled = settings.overlayColorEnabled === true; // 默认关闭（根据SQL）
        this.setSwitchState('overlay-color-switch', overlayColorEnabled);
        document.getElementById('overlay-color').value = settings.overlayColor || '#000000';
        document.getElementById('overlay-color').disabled = !overlayColorEnabled;

        // 遮罩层透明度开关和值
        const overlayOpacityEnabled = settings.overlayOpacityEnabled === true; // 默认关闭（根据SQL）
        this.setSwitchState('overlay-opacity-switch', overlayOpacityEnabled);
        document.getElementById('overlay-opacity').value = settings.overlayOpacity || 0.3;
        document.getElementById('overlay-opacity-value').textContent = settings.overlayOpacity || 0.3;
        document.getElementById('overlay-opacity').disabled = !overlayOpacityEnabled;

        // 图标样式
        document.getElementById('icon-radius').value = settings.iconRadius || 0.5;
        this.setSwitchState('icon-shadow-switch', settings.iconShadow === true); // 默认开启（根据SQL）
        document.getElementById('icon-hover-effect').value = settings.iconHoverEffect || 'scale';
        this.setSwitchState('show-title-switch', settings.showTitle === true); // 默认显示（根据SQL）
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

        // 搜索设置 - 先加载搜索引擎列表，再填充
        await this.populateSearchEngines();
        document.getElementById('default-search-engine').value = settings.defaultSearchEngine || 'baidu';
        document.getElementById('search-box-position').value = settings.searchBoxPosition || 'center';
        document.getElementById('search-box-style').value = settings.searchBoxStyle || 'rounded';

        // 组件设置
        document.getElementById('widget-border-radius').value = settings.widgetBorderRadius || 1.4;
        document.getElementById('widget-border-radius-value').textContent = (settings.widgetBorderRadius || 1.4) + 'rem';

        // 交互行为
        document.getElementById('scroll-animation-speed').value = settings.scrollAnimationSpeed || 300;
        document.getElementById('drag-sensitivity').value = settings.dragSensitivity || 5;
        this.setSwitchState('enable-context-menu-switch', settings.enableContextMenu === true); // 默认启用（根据SQL）

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
            await SettingsManager.saveAllSettings(newSettings);

            // 更新 currentSettings 为新值，确保 close() 时使用正确的值
            this.currentSettings = newSettings;

            // 应用设置
            this.applySettings(newSettings);

            // 关闭 Modal
            this.close();

            // 显示成功提示
            ToastNotification.success('设置已保存！');
        } catch (error) {
            console.error('保存设置失败:', error);
            ToastNotification.error('保存设置失败，请重试');
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
            globalFont: document.getElementById('global-font').value,
            bgImageEnabled: document.getElementById('bg-image-switch').classList.contains('active'),
            bgImageUrl: document.getElementById('bg-image-url').value,
            bgBlurEnabled: document.getElementById('bg-blur-switch').classList.contains('active'),
            bgBlur: parseInt(document.getElementById('bg-blur').value),
            bgOpacityEnabled: document.getElementById('bg-opacity-switch').classList.contains('active'),
            bgOpacity: parseFloat(document.getElementById('bg-opacity').value),
            overlayColorEnabled: document.getElementById('overlay-color-switch').classList.contains('active'),
            overlayColor: document.getElementById('overlay-color').value,
            overlayOpacityEnabled: document.getElementById('overlay-opacity-switch').classList.contains('active'),
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

            // 组件设置
            widgetBorderRadius: parseFloat(document.getElementById('widget-border-radius').value),

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
        // 1. 更新主题色
        document.documentElement.style.setProperty('--theme-color', settings.themeColor);

        // 2. 应用全局字体
        this.applyGlobalFont(settings.globalFont);

        // 3. 更新背景（默认为空）
        if (settings.bgImageUrl) {
            const imageUrl = settings.bgImageUrl.startsWith('/') ? settings.bgImageUrl : `/${settings.bgImageUrl}`;
            document.body.style.backgroundImage = `url(${imageUrl})`;
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

        // 7. 更新搜索引擎图标（如果默认搜索引擎改变）
        this.updateSearchEngineIcon();

        // 8. 应用网格设置
        this.applyGridSettings(settings);

        // 9. 应用 Dock 设置
        this.applyDockSettings(settings);

        // 10. 应用组件圆角
        this.applyWidgetBorderRadius(settings.widgetBorderRadius);

        // 11. 应用背景设置（包括开关状态）
        this.applyBackgroundSettings(settings);
    }

    /**
     * 应用搜索框位置
     */
    applySearchBoxPosition(position) {
        const searchBox = document.querySelector('search-box');
        if (!searchBox) return;

        // 通过设置属性来更新位置
        searchBox.setAttribute('position', position);
    }

    /**
     * 应用搜索框样式
     */
    applySearchBoxStyle(style) {
        const searchBox = document.querySelector('search-box');
        if (!searchBox) return;

        // 通过设置属性来更新样式
        searchBox.setAttribute('style', style);
    }

    /**
     * 更新搜索引擎图标
     */
    updateSearchEngineIcon() {
        // 获取 SearchBox 组件并调用其方法
        const searchBox = document.querySelector('search-box');
        if (searchBox && searchBox.updateSearchEngineIcon) {
            searchBox.updateSearchEngineIcon();
        }
    }

    /**
     * 应用全局字体
     */
    applyGlobalFont(fontName) {
        // 根据字体名称设置对应的 font-family
        let fontFamily;
        switch (fontName) {
            case 'NotoSansSC-Regular':
                fontFamily = "'Noto Sans SC', sans-serif";
                break;
            case 'NotoSansSC-Bold':
                fontFamily = "'Noto Sans SC Bold', sans-serif";
                break;
            case 'Segoe UI':
                fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
                break;
            default:
                fontFamily = "'Noto Sans SC', sans-serif";
        }

        // 应用到 body 元素
        document.body.style.fontFamily = fontFamily;
    }

    /**
     * 应用图标圆角设置
     */
    applyIconRadius(radius) {
        const radiusValue = radius || 0.5;
        document.documentElement.style.setProperty('--icon-radius', `${radiusValue}rem`);

        // 触发所有图标重新渲染以应用新圆角
        this.refreshAllIcons();
    }

    /**
     * 应用标题设置
     */
    applyTitleSettings(settings) {
        // 1. 应用标题字体大小
        const fontSize = settings.titleFontSize || 12;
        document.documentElement.style.setProperty('--title-font-size', `${fontSize}px`);

        // 2. 应用标题字体颜色
        const fontColor = settings.titleFontColor || '#ffffff';
        const currentTheme = document.documentElement.getAttribute('data-theme');

        // 判断是否手动设置了颜色（不等于默认值 #ffffff）
        const isCustomColor = fontColor !== '#ffffff';

        if (isCustomColor) {
            // 如果用户手动设置了颜色，使用手动设置的颜色
            document.documentElement.style.setProperty('--title-color', fontColor);
        } else {
            // 否则根据主题自动适配
            if (currentTheme === 'dark') {
                // 暗黑模式使用专门的深色主题颜色
                document.documentElement.style.setProperty('--title-color', 'var(--title-color-dark)');
            } else {
                // 浅色模式使用深黑色
                document.documentElement.style.setProperty('--title-color', '#0a0a0a');
            }
        }

        // 3. 应用标题位置
        const position = settings.titlePosition || 'bottom';
        document.documentElement.style.setProperty('--title-position', position);

        // 4. 应用标题最大长度
        const maxLength = settings.titleMaxLength || 8;
        document.documentElement.style.setProperty('--title-max-length', maxLength);

        // 5. 重新渲染所有图标以应用新设置
        this.refreshAllIcons();
    }

    /**
     * 刷新所有图标以应用新设置
     */
    refreshAllIcons() {
        // 获取所有图标容器（排除 widget）
        let iconContainers = document.querySelectorAll('.nav-icon');

        // 如果没找到，尝试其他可能的选择器（但排除 widget-item）
        if (iconContainers.length === 0) {
            iconContainers = document.querySelectorAll('.grid-item:not(.widget-item)');
        }

        // 获取当前的图标圆角值
        const currentRadius = getComputedStyle(document.documentElement).getPropertyValue('--icon-radius').trim();

        iconContainers.forEach((container) => {
            // 直接设置内联样式，强制覆盖
            container.style.borderRadius = currentRadius;

            // 强制触发重排
            void container.offsetHeight;
        });

        // 清除 widget-item 上可能存在的错误内联样式
        this.clearWidgetItemBorderRadius();
    }

    /**
     * 清除 widget-item 上的错误 border-radius 内联样式
     */
    clearWidgetItemBorderRadius() {
        const widgetItems = document.querySelectorAll('.grid-item.widget-item');
        widgetItems.forEach(item => {
            // 移除可能被错误设置的内联 borderRadius
            if (item.style.borderRadius) {
                item.style.removeProperty('border-radius');
            }
        });
    }

    /**
     * 应用组件圆角
     */
    applyWidgetBorderRadius(radius) {
        const borderRadius = radius || 1.4;
        // 设置 CSS 变量
        document.documentElement.style.setProperty('--widget-border-radius', `${borderRadius}rem`);

        // 立即应用到所有现有的 Widget 组件
        const widgetContainers = document.querySelectorAll('.widget-container');
        widgetContainers.forEach(container => {
            container.style.borderRadius = `${borderRadius}rem`;
        });
    }

    /**
     * 应用网格设置
     */
    applyGridSettings(settings) {
        // 更新网格间距 CSS 变量
        const gapValue = settings.gridGap || 2;
        document.documentElement.style.setProperty('--cell-gap', `${gapValue}rem`);

        // 更新所有网格容器的行列数
        const gridContainers = document.querySelectorAll('.grid-container');
        gridContainers.forEach((container) => {
            const categoryPanel = container.closest('.category-panel');
            if (!categoryPanel) return;

            // 计算容器可用宽度
            const panelStyle = window.getComputedStyle(categoryPanel);
            const panelPadding = parseFloat(panelStyle.paddingLeft) + parseFloat(panelStyle.paddingRight);
            const availableWidth = categoryPanel.clientWidth - panelPadding;

            // 计算网格所需宽度
            const cellSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-base-size')) || 64;
            const cellGap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-gap')) || 32;

            // 使用自动计算的列数（优先级最高）
            const settingsManager = window.settingsManager;
            const autoCols = settingsManager ? settingsManager.calculateAutoGridCols() : (settings.gridCols || 13);
            const gridWidth = autoCols * cellSize + (autoCols - 1) * cellGap;

            // 如果网格宽度大于可用宽度，自动调整列数
            if (gridWidth > availableWidth) {
                const maxCols = Math.floor((availableWidth + cellGap) / (cellSize + cellGap));
                const actualCols = Math.max(maxCols, 4); // 至少 4 列
                container.style.gridTemplateColumns = `repeat(${actualCols}, var(--cell-base-size))`;
            } else {
                container.style.gridTemplateColumns = `repeat(${autoCols}, var(--cell-base-size))`;
            }
        });
    }

    /**
     * 应用 Dock 设置
     */
    applyDockSettings(settings) {
        const dock = document.getElementById('dock');
        if (!dock) return;

        // 更新 Dock 位置
        dock.style.bottom = '';
        dock.style.left = 'auto';  // 显式设置为 auto 以覆盖 CSS 默认值
        dock.style.right = '';
        dock.style.top = '';
        dock.style.transform = '';
        dock.style.flexDirection = '';

        switch (settings.dockPosition) {
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
     * 应用背景设置(包括开关状态)
     */
    applyBackgroundSettings(settings) {
        // 应用背景图片(根据开关状态)
        const bgImageEnabled = settings.bgImageEnabled === true || settings.bgImageEnabled === '1';
        if (bgImageEnabled && settings.bgImageUrl) {
            const imageUrl = settings.bgImageUrl.startsWith('/') ? settings.bgImageUrl : `/${settings.bgImageUrl}`;
            document.body.style.backgroundImage = `url(${imageUrl})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundRepeat = 'no-repeat';
        } else {
            document.body.style.backgroundImage = 'none';
        }

        // 应用背景模糊度(根据开关状态)
        const bgBlurEnabled = settings.bgBlurEnabled === true || settings.bgBlurEnabled === '1';
        const bgBlur = bgBlurEnabled ? (settings.bgBlur || 5) : 0;
        document.documentElement.style.setProperty('--bg-blur', `${bgBlur}px`);

        // 应用背景透明度(根据开关状态)
        const bgOpacityEnabled = settings.bgOpacityEnabled === true || settings.bgOpacityEnabled === '1';
        const bgOpacity = bgOpacityEnabled ? (settings.bgOpacity || 0.8) : 1;
        document.documentElement.style.setProperty('--bg-opacity', bgOpacity);

        // 应用遮罩层颜色(根据开关状态)
        const overlayColorEnabled = settings.overlayColorEnabled === true || settings.overlayColorEnabled === '1';
        const overlayColor = overlayColorEnabled ? (settings.overlayColor || '#000000') : 'transparent';
        document.documentElement.style.setProperty('--overlay-color', overlayColor);

        // 应用遮罩层透明度(根据开关状态)
        const overlayOpacityEnabled = settings.overlayOpacityEnabled === true || settings.overlayOpacityEnabled === '1';
        const overlayOpacity = overlayOpacityEnabled ? (settings.overlayOpacity || 0.3) : 0;
        document.documentElement.style.setProperty('--overlay-opacity', overlayOpacity);

        // 更新 body 的伪元素样式以应用背景效果
        this.updateBodyBackgroundStyles();
    }

    /**
     * 更新 body 背景相关样式
     */
    updateBodyBackgroundStyles() {
        // 创建或更新用于背景效果的样式
        let styleElement = document.getElementById('background-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'background-styles';
            document.head.appendChild(styleElement);
        }

        // 构建背景效果样式
        const bgBlur = getComputedStyle(document.documentElement).getPropertyValue('--bg-blur').trim() || '0px';
        const bgOpacity = getComputedStyle(document.documentElement).getPropertyValue('--bg-opacity').trim() || '0.8';
        const overlayColor = getComputedStyle(document.documentElement).getPropertyValue('--overlay-color').trim() || '#ffffff';
        const overlayOpacity = getComputedStyle(document.documentElement).getPropertyValue('--overlay-opacity').trim() || '0.3';

        styleElement.textContent = `
            body::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: inherit;
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                filter: blur(${bgBlur});
                z-index: -1;
                opacity: ${bgOpacity};
            }
            
            body::after {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: ${overlayColor};
                z-index: -1;
                opacity: ${overlayOpacity};
            }
        `;
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
            await SettingsManager.resetToDefault();

            // 重新加载设置
            this.loadCurrentSettings();

            ToastNotification.success('已恢复默认设置');
        } catch (error) {
            ToastNotification.error('恢复默认设置失败，请重试');
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

        ToastNotification.success('配置已导出');
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

                await SettingsManager.saveAllSettings(settings);

                // 重新加载设置
                this.loadCurrentSettings();

                ToastNotification.success('配置导入成功');
            } catch (error) {
                ToastNotification.error('导入配置失败，请检查文件格式');
            }
        };
        reader.readAsText(file);

        // 清空文件选择
        event.target.value = '';
    }
}

export default new SettingsModalHandler();
