// ==================== 控制台&工具台模态弹窗 ====================

import BaseModal from './BaseModal.js';
import ImageParserTool from '../consoleTools/ImageParser.js';
import SSHDTool from '../consoleTools/SSHDTool.js';
import BackgroundTool from '../consoleTools/BackgroundTool.js';
import CompLeaveTool from '../consoleTools/CompLeaveTool.js';

class ConsoleModal extends BaseModal {
    constructor() {
        super({
            overlayClass: 'console-modal-overlay',
            modalClass: 'console-modal',
            closeOnOverlayClick: false,
            closeOnEscape: true,
            enableMaximize: true,
            draggable: true
        });

        this._toolCache = new Map();
        this._toolEntries = [];
        this._activeToolId = null;

        this.init();
    }

    /**
     * 初始化模态弹窗
     */
    init() {
        this.renderModal();
        super.bindEvents();
        this._bindCustomEvents();
        // 注册内置工具
        this._registerBuiltinTools();
    }

    /**
     * 渲染模态弹窗 HTML
     */
    renderModal() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'console-modal-overlay hidden';
        this.overlay.id = 'consoleModalOverlay';

        this.modal = document.createElement('div');
        this.modal.className = 'console-modal';
        this.modal.id = 'consoleModal';

        this.modal.innerHTML = `
            <div class="console-modal-header">
                <div class="console-modal-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="console-title-icon">
                        <polyline points="4 17 10 11 4 5"></polyline>
                        <line x1="12" y1="19" x2="20" y2="19"></line>
                    </svg>
                    <span>控制台&工具台</span>
                </div>
            </div>
            <div class="console-modal-body">
                <div class="console-sidebar" id="consoleSidebar">
                    <div class="console-tool-list" id="consoleToolList">
                        <!-- 工具列表将由 JavaScript 动态渲染 -->
                    </div>
                </div>
                <div class="console-content" id="consoleContent">
                    <div class="console-empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="console-empty-icon">
                            <polyline points="4 17 10 11 4 5"></polyline>
                            <line x1="12" y1="19" x2="20" y2="19"></line>
                        </svg>
                        <p>请从左侧选择一个工具</p>
                    </div>
                </div>
            </div>
        `;

        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);

        // 缓存关键 DOM 元素
        this._sidebarEl = this.modal.querySelector('#consoleSidebar');
        this._toolListEl = this.modal.querySelector('#consoleToolList');
        this._contentEl = this.modal.querySelector('#consoleContent');
        this._headerEl = this.modal.querySelector('.console-modal-header');
    }

    /**
     * 绑定自定义事件
     * @private
     */
    _bindCustomEvents() {
        // 工具列表点击委托
        this._toolListEl.addEventListener('click', (e) => {
            const toolItem = e.target.closest('.console-tool-item');
            if (toolItem) {
                const toolId = toolItem.dataset.toolId;
                this._activateTool(toolId);
            }
        });
    }

    /**
     * 注册内置工具（后续可在此扩展）
     * @private
     */
    _registerBuiltinTools() {
        // 内置工具列表 - 方便后续扩展
        this._toolEntries = [
            {
                id: 'welcome',
                name: '欢迎',
                icon: '👋',
                description: '控制台&工具台使用说明与工具概览',
                render: (container) => this._renderWelcomeTool(container)
            }
        ];

        // 注册图片解析工具
        const imageParser = new ImageParserTool();
        this.registerTool('image-parser', {
            name: '图片解析',
            icon: '🖼️',
            description: '查看图片EXIF信息、尺寸、大小',
            render: (container) => imageParser.render(container)
        });

        // 注册 SSHD 状态管理工具
        const sshdTool = new SSHDTool();
        this.registerTool('sshd', {
            name: 'SSHD 管理',
            icon: '🔌',
            description: '查看和管理 Termux SSHD 服务',
            render: (container) => sshdTool.render(container)
        });

        // 注册背景图设置工具
        const bgTool = new BackgroundTool();
        this.registerTool('background', {
            name: '背景图',
            icon: '🏞️',
            description: '浏览并设置页面背景图片/视频',
            render: (container) => bgTool.render(container)
        });

        // 注册调休时长工具
        const compLeaveTool = new CompLeaveTool();
        this.registerTool('compleave', {
            name: '调休时长',
            icon: '⏱️',
            description: '记录加班或调休时长，自动更新调休小组件',
            render: (container) => compLeaveTool.render(container)
        });

        this._renderToolList();
    }

    /**
     * 注册新工具（方便后续扩展）
     * @param {string} id - 工具唯一标识
     * @param {Object} toolConfig - 工具配置
     * @param {string} toolConfig.name - 显示名称
     * @param {string} toolConfig.icon - 图标（emoji 或文本）
     * @param {string} toolConfig.description - 描述
     * @param {Function} toolConfig.render - 渲染函数，接收容器元素作为参数
     */
    registerTool(id, toolConfig) {
        const existing = this._toolEntries.find(t => t.id === id);
        if (existing) {
            Object.assign(existing, toolConfig);
        } else {
            this._toolEntries.push({ id, ...toolConfig });
        }
        this._renderToolList();
    }

    /**
     * 渲染工具列表
     * @private
     */
    _renderToolList() {
        if (!this._toolListEl) return;

        this._toolListEl.innerHTML = this._toolEntries.map(tool => `
            <div class="console-tool-item" data-tool-id="${tool.id}">
                <span class="console-tool-icon">${tool.icon}</span>
                <div class="console-tool-info">
                    <span class="console-tool-name">${tool.name}</span>
                    <span class="console-tool-desc">${tool.description}</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * 激活工具
     * @param {string} toolId - 工具 ID
     * @private
     */
    _activateTool(toolId) {
        if (this._activeToolId === toolId) return;

        // 更新选中状态
        this._toolListEl.querySelectorAll('.console-tool-item').forEach(item => {
            item.classList.toggle('active', item.dataset.toolId === toolId);
        });

        // 获取工具配置
        const tool = this._toolEntries.find(t => t.id === toolId);
        if (!tool) return;

        // 清空内容区并渲染
        this._contentEl.innerHTML = '';

        try {
            tool.render(this._contentEl);
        } catch (err) {
            console.error(`[ConsoleModal] 渲染工具 "${toolId}" 失败:`, err);
            this._contentEl.innerHTML = `<div class="console-error-state">⚠️ 工具加载失败: ${err.message}</div>`;
        }

        this._activeToolId = toolId;
    }

    /**
     * 渲染欢迎工具
     * @param {HTMLElement} container
     * @private
     */
    _renderWelcomeTool(container) {
        container.innerHTML = `
            <div class="console-welcome">
                <h2>👋 欢迎使用控制台&工具台</h2>
                <p class="console-welcome-desc">这里将汇聚各种实用小工具，左侧菜单会随着工具增加而扩展。</p>
                <div class="console-welcome-features">
                    <div class="console-welcome-card">
                        <span class="console-welcome-card-icon">🔧</span>
                        <span>工具模块化</span>
                        <small>每个小工具独立注册，方便维护和扩展</small>
                    </div>
                    <div class="console-welcome-card">
                        <span class="console-welcome-card-icon">📋</span>
                        <span>操作便捷</span>
                        <small>ESC 关闭、X 按钮关闭、最大化、自由拖动</small>
                    </div>
                    <div class="console-welcome-card">
                        <span class="console-welcome-card-icon">🎨</span>
                        <span>风格统一</span>
                        <small>延续项目整体设计语言，毛玻璃效果</small>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 打开模态框 - 默认选中 welcome
     */
    open() {
        super.open();
        // 默认选中第一个工具（welcome）
        this._activateTool('welcome');
    }

    /**
     * 关闭模态框前清理
     */
    close() {
        if (!this._isOpen) return;
        super.close();
    }
}

export default new ConsoleModal();