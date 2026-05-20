// ==================== 热点资讯小组件 ====================

import BaseWidget from './BaseWidget.js';

class HotPointWidget extends BaseWidget {
    /**
     * 构造函数
     * @param {HTMLElement} container - widget 容器元素
     * @param {number|null} widgetId - icon_widgets.id（数字ID）
     */
    constructor(container, widgetId = null) {
        super(container, widgetId, 'HotPointWidget');
        // 热点组件只支持 2x2, 2x3 和 2x4 尺寸
        this.supportedSizes = ['2x2', '2x3', '2x4'];

        // 当前数据源，默认微博
        this.currentSource = 'weibo';

        // 热点数据
        this.hotData = [];

        // 最后更新时间
        this.lastUpdateTime = null;

        // API URLs
        this.apiUrls = {
            weibo: '/api/hotpoint/weibo',
            baidu: '/api/hotpoint/baidu'
        };

        // 刷新间隔（10分钟）
        this.refreshInterval = 10 * 60 * 1000;
    }

    /**
     * 初始化组件
     */
    init() {
        if (!this.container) {
            console.error('HotPointWidget: 容器未找到');
            return;
        }

        // 渲染组件结构
        this.render();

        // 加载数据
        this.fetchHotData();

        // 设置定时刷新
        this.setInterval(() => {
            this.fetchHotData();
        }, this.refreshInterval);
    }

    /**
     * 渲染热点小组件
     */
    render() {
        const currentSize = this.container.closest('.grid-item')?.dataset.size || '2x2';

        this.container.innerHTML = `
            <div class="hotpoint-widget" data-source="${this.currentSource}">
                <div class="hotpoint-header">
                    <div class="hotpoint-title">
                        ${this.getSourceIcon()}
                        <span class="source-name">${this.getSourceName()}</span>
                    </div>
                    <button class="hotpoint-switch-btn" title="切换数据源">
                        ${this.getSwitchIcon()}
                    </button>
                </div>
                <div class="hotpoint-content">
                    <div class="hotpoint-loading">
                        <div class="spinner"></div>
                        <p>加载中...</p>
                    </div>
                </div>
            </div>
        `;

        // 绑定事件
        this.bindEvents();

        return {
            destroy: () => this.destroy()
        };
    }

    /**
     * 获取热点数据
     */
    async fetchHotData() {
        try {
            const response = await fetch(this.apiUrls[this.currentSource]);

            if (!response.ok) {
                throw new Error('获取热点数据失败');
            }

            const result = await response.json();

            if (result.success && result.data) {
                this.hotData = result.data;
                this.lastUpdateTime = result.lastUpdate || new Date().toISOString();

                // 显示数据
                this.renderHotList();

                // 如果API请求失败但有缓存数据，显示提示
                if (result.warning) {
                    this.showToast(result.warning, 'warning');
                }
            } else {
                throw new Error(result.error || '数据格式错误');
            }
        } catch (error) {
            console.error('[HotPointWidget] 获取数据失败:', error);

            // 如果有缓存数据，不显示错误
            if (this.hotData.length === 0) {
                this.showError('加载失败，请重试');
            }

            this.showToast('更新失败，显示缓存数据', 'error');
        }
    }

    /**
     * 渲染热点列表
     */
    renderHotList() {
        const contentEl = this.container.querySelector('.hotpoint-content');
        const currentSize = this.container.closest('.grid-item')?.dataset.size || '2x2';

        if (!contentEl) return;

        if (!this.hotData || this.hotData.length === 0) {
            contentEl.innerHTML = `
                <div class="hotpoint-empty">
                    <p>暂无数据</p>
                </div>
            `;
            return;
        }

        // 根据尺寸决定显示条数
        let maxItems = 50;
        if (currentSize === '2x2') {
            maxItems = 8;
        }
        // 2x3 和 2x4 都显示50条数据

        const displayData = this.hotData.slice(0, maxItems);

        const isCompact = currentSize === '2x2';

        contentEl.innerHTML = `
            <div class="hotpoint-list">
                ${displayData.map(item => this.renderHotItem(item, isCompact)).join('')}
            </div>
        `;

        // 绑定点击事件
        this.bindHotItemClickEvents();

        // 阻止页面滚动，优先滚动列表
        this.setupScrollStopPropagation(contentEl);
    }

    /**
     * 渲染单个热点项
     */
    renderHotItem(item, isCompact) {
        // 直接使用数据库中的原始值，不进行格式化
        const hotValueDisplay = item.hot_value || '--';

        if (isCompact) {
            // 2x2 精简模式：只显示排名和标题
            return `
                <div class="hotpoint-item" data-url="${item.url}" data-rank="${item.rank}">
                    <span class="hotpoint-rank">${item.rank}</span>
                    <span class="hotpoint-title-text" title="${item.title}">${item.title}</span>
                </div>
            `;
        } else {
            // 2x3/2x4 完整模式：显示排名、标题和热度
            return `
                <div class="hotpoint-item" data-url="${item.url}" data-rank="${item.rank}">
                    <span class="hotpoint-rank">${item.rank}</span>
                    <span class="hotpoint-title-text" title="${item.title}">${item.title}</span>
                    <span class="hotpoint-hot-value">${hotValueDisplay}</span>
                </div>
            `;
        }
    }

    /**
     * 格式化热度值
     */
    formatHotValue(value) {
        if (!value && value !== 0) return '--';

        // 转换为字符串并去除逗号
        const strValue = String(value).replace(/,/g, '');
        const numValue = parseFloat(strValue);

        if (isNaN(numValue)) {
            return String(value);
        }

        if (numValue >= 100000000) {
            return (numValue / 100000000).toFixed(1) + '亿';
        } else if (numValue >= 10000) {
            return (numValue / 10000).toFixed(1) + '万';
        }

        return numValue.toString();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 切换数据源按钮
        const switchBtn = this.container.querySelector('.hotpoint-switch-btn');
        if (switchBtn) {
            switchBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.switchSource();
            });
        }
    }

    /**
     * 绑定热点项点击事件
     */
    bindHotItemClickEvents() {
        const items = this.container.querySelectorAll('.hotpoint-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const url = item.dataset.url;
                if (url) {
                    window.open(url, '_blank');
                }
            });
        });
    }

    /**
     * 切换数据源
     */
    switchSource() {
        this.currentSource = this.currentSource === 'weibo' ? 'baidu' : 'weibo';

        // 更新UI
        const widgetEl = this.container.querySelector('.hotpoint-widget');
        if (widgetEl) {
            widgetEl.dataset.source = this.currentSource;
        }

        const sourceIcon = this.container.querySelector('.hotpoint-title');
        const sourceName = this.container.querySelector('.source-name');
        const switchBtn = this.container.querySelector('.hotpoint-switch-btn');

        if (sourceIcon) {
            // 重新渲染整个标题区域以更新图标
            sourceIcon.innerHTML = `
                        ${this.getSourceIcon()}
                        <span class="source-name">${this.getSourceName()}</span>
                    `;
        } else {
            // 如果找不到 hotpoint-title，尝试单独更新图标和名称
            const iconEl = this.container.querySelector('.source-icon');
            if (iconEl) {
                iconEl.outerHTML = this.getSourceIcon();
            }
            if (sourceName) {
                sourceName.textContent = this.getSourceName();
            }
        }
        if (switchBtn) {
            switchBtn.innerHTML = this.getSwitchIcon();
        }

        // 重新加载数据
        this.fetchHotData();
    }

    /**
     * 获取数据源图标
     */
    getSourceIcon() {
        if (this.currentSource === 'weibo') {
            // 微博使用 SVG 图片
            return `<img src="/static/ico/svg-weibo.svg" alt="微博热搜" class="source-icon" />`;
        } else {
            // 百度使用 SVG 图片
            return `<img src="/static/ico/svg-baidu.svg" alt="百度热搜" class="source-icon" />`;
        }
    }

    /**
     * 获取数据源名称
     */
    getSourceName() {
        return this.currentSource === 'weibo' ? '微博热搜' : '百度热搜';
    }

    /**
     * 获取切换图标
     */
    getSwitchIcon() {
        // 使用 SVG 切换图标
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>`;
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        const contentEl = this.container.querySelector('.hotpoint-content');
        if (contentEl) {
            contentEl.innerHTML = `
                <div class="hotpoint-error">
                    <p>${message}</p>
                </div>
            `;
        }
    }

    /**
     * 显示Toast提示
     */
    showToast(message, type = 'info') {
        if (window.ToastNotification) {
            window.ToastNotification.show(message, type);
        } else {
            console.log(`[Toast ${type}]`, message);
        }
    }

    /**
     * 设置滚动事件阻止冒泡
     * @param {HTMLElement} contentEl - 内容区域元素
     */
    setupScrollStopPropagation(contentEl) {
        if (!contentEl) return;

        // 移除旧的事件监听器（如果存在）
        if (this.scrollHandler) {
            contentEl.removeEventListener('wheel', this.scrollHandler, { passive: false });
        }

        // 创建新的事件处理函数
        this.scrollHandler = (e) => {
            // 阻止事件冒泡到页面，但允许列表滚动
            e.stopPropagation();
        };

        // 添加事件监听器（不能使用 passive: true，因为可能需要阻止默认行为）
        contentEl.addEventListener('wheel', this.scrollHandler, { passive: false });
    }

    /**
     * 刷新组件（实现BaseWidget的refresh接口）
     */
    refresh() {
        this.fetchHotData();
    }

    /**
     * 销毁组件
     */
    destroy() {
        super.destroy();
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

export default HotPointWidget;
