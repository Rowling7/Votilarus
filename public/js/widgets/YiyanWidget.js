// ==================== 一言小组件 ====================

import BaseWidget from './BaseWidget.js';

class YiyanWidget extends BaseWidget {
    /**
     * 构造函数
     * @param {HTMLElement} container - widget 容器元素
     * @param {number|null} widgetId - icon_widgets.id（数字ID）
     */
    constructor(container, widgetId = null) {
        super(container, widgetId, 'YiyanWidget');
        // 一言组件支持 2x2, 2x3 和 2x4 尺寸
        this.supportedSizes = ['2x2', '2x3', '2x4'];

        // 当前数据源，默认毒鸡汤
        this.currentSource = 'dujitang';

        // 当前一言内容
        this.currentContent = '';

        // 是否已收藏
        this.isFavorite = false;

        // API URLs
        this.apiUrls = {
            dujitang: '/api/yiyan/random/dujitang',
            weibo: '/api/yiyan/random/weibo'
        };
    }

    /**
     * 初始化组件
     */
    init() {
        if (!this.container) {
            console.error('YiyanWidget: 容器未找到');
            return;
        }

        // 渲染组件结构
        this.render();

        // 加载数据
        this.fetchYiyan();
    }

    /**
     * 渲染一言小组件
     */
    render() {
        this.container.innerHTML = `
            <div class="yiyan-widget" data-source="${this.currentSource}">
                <div class="yiyan-header">
                    <button class="yiyan-source-btn" title="切换数据源">
                        ${this.getSourceName()}
                    </button>
                    <button class="yiyan-favorite-btn" title="收藏">
                        ${this.getFavoriteIcon()}
                    </button>
                </div>
                <div class="yiyan-content">
                    <div class="yiyan-loading">
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
     * 获取一言数据
     */
    async fetchYiyan() {
        try {
            const response = await fetch(this.apiUrls[this.currentSource]);

            if (!response.ok) {
                throw new Error('获取一言数据失败');
            }

            const result = await response.json();

            if (result.success && result.data) {
                this.currentContent = result.data.content;

                // 显示数据
                this.renderContent();

                // 检查是否已收藏
                await this.checkFavoriteStatus();
            } else {
                throw new Error(result.error || '数据格式错误');
            }
        } catch (error) {
            console.error('[YiyanWidget] 获取数据失败:', error);
            this.showError('加载失败，请重试');
            this.showToast('获取一言失败', 'error');
        }
    }

    /**
     * 渲染一言内容
     */
    renderContent() {
        const contentEl = this.container.querySelector('.yiyan-content');

        if (!contentEl) return;

        if (!this.currentContent) {
            contentEl.innerHTML = `
                <div class="yiyan-empty">
                    <p>暂无数据</p>
                </div>
            `;
            return;
        }

        contentEl.innerHTML = `
            <div class="yiyan-text">${this.currentContent}</div>
        `;

        // 阻止页面滚动，优先滚动一言内容
        this.setupScrollStopPropagation(contentEl);
    }

    /**
     * 检查收藏状态
     */
    async checkFavoriteStatus() {
        if (!this.currentContent) return;

        try {
            const response = await fetch(`/api/yiyan/check?content=${encodeURIComponent(this.currentContent)}`);

            if (!response.ok) {
                throw new Error('检查收藏状态失败');
            }

            const result = await response.json();

            if (result.success) {
                this.isFavorite = result.isFavorite;
                this.updateFavoriteButton();
            }
        } catch (error) {
            console.error('[YiyanWidget] 检查收藏状态失败:', error);
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 切换数据源按钮
        const sourceBtn = this.container.querySelector('.yiyan-source-btn');
        if (sourceBtn) {
            sourceBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.switchSource();
            });
        }

        // 收藏按钮
        const favoriteBtn = this.container.querySelector('.yiyan-favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavorite();
            });
        }

        // 点击组件主体刷新
        const contentEl = this.container.querySelector('.yiyan-content');
        if (contentEl) {
            contentEl.addEventListener('click', (e) => {
                // 如果点击的是滚动条区域，不刷新
                if (e.target === contentEl) {
                    this.refresh();
                }
            });
        }
    }

    /**
     * 切换数据源
     */
    switchSource() {
        this.currentSource = this.currentSource === 'dujitang' ? 'weibo' : 'dujitang';

        // 更新UI
        const widgetEl = this.container.querySelector('.yiyan-widget');
        if (widgetEl) {
            widgetEl.dataset.source = this.currentSource;
        }

        const sourceBtn = this.container.querySelector('.yiyan-source-btn');
        if (sourceBtn) {
            sourceBtn.textContent = this.getSourceName();
        }

        // 重置收藏状态
        this.isFavorite = false;
        this.updateFavoriteButton();

        // 重新加载数据
        this.fetchYiyan();
    }

    /**
     * 切换收藏状态
     */
    async toggleFavorite() {
        if (!this.currentContent) {
            this.showToast('没有可收藏的内容', 'warning');
            return;
        }

        try {
            if (this.isFavorite) {
                // 取消收藏
                await this.removeFromFavorites();
            } else {
                // 添加收藏
                await this.addToFavorites();
            }
        } catch (error) {
            console.error('[YiyanWidget] 收藏操作失败:', error);
            this.showToast('操作失败', 'error');
        }
    }

    /**
     * 添加到收藏
     */
    async addToFavorites() {
        try {
            const response = await fetch('/api/yiyan/favorite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: this.currentContent })
            });

            if (!response.ok) {
                throw new Error('收藏失败');
            }

            const result = await response.json();

            if (result.success) {
                this.isFavorite = true;
                this.updateFavoriteButton();
                this.showToast('❤️ 收藏成功', 'success');
                this.animateFavoriteButton();
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * 从收藏中移除
     */
    async removeFromFavorites() {
        try {
            const response = await fetch('/api/yiyan/favorite', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: this.currentContent })
            });

            if (!response.ok) {
                throw new Error('取消收藏失败');
            }

            const result = await response.json();

            if (result.success) {
                this.isFavorite = false;
                this.updateFavoriteButton();
                this.showToast('💔 已取消收藏', 'info');
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * 更新收藏按钮状态
     */
    updateFavoriteButton() {
        const favoriteBtn = this.container.querySelector('.yiyan-favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.innerHTML = this.getFavoriteIcon();
            favoriteBtn.classList.toggle('favorited', this.isFavorite);
        }
    }

    /**
     * 收藏按钮动画
     */
    animateFavoriteButton() {
        const favoriteBtn = this.container.querySelector('.yiyan-favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.classList.add('animate');
            setTimeout(() => {
                favoriteBtn.classList.remove('animate');
            }, 300);
        }
    }

    /**
     * 获取数据源名称
     */
    getSourceName() {
        return this.currentSource === 'dujitang' ? '毒鸡汤' : '一言';
    }

    /**
     * 获取收藏图标
     */
    getFavoriteIcon() {
        if (this.isFavorite) {
            // 实心爱心
            return `<svg width="18" height="18" viewBox="0 0 24 24" fill="#ff4757" stroke="#ff4757" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
        } else {
            // 空心爱心
            return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
        }
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        const contentEl = this.container.querySelector('.yiyan-content');
        if (contentEl) {
            contentEl.innerHTML = `
                <div class="yiyan-error">
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
            // 阻止事件冒泡到页面，但允许一言内容滚动
            e.stopPropagation();
        };

        // 添加事件监听器（不能使用 passive: true，因为可能需要阻止默认行为）
        contentEl.addEventListener('wheel', this.scrollHandler, { passive: false });
    }

    /**
     * 刷新组件（实现BaseWidget的refresh接口）
     */
    refresh() {
        // 重置收藏状态
        this.isFavorite = false;
        this.updateFavoriteButton();

        // 重新获取数据
        this.fetchYiyan();

        // 重新设置滚动阻止
        const contentEl = this.container.querySelector('.yiyan-content');
        if (contentEl) {
            this.setupScrollStopPropagation(contentEl);
        }
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

export default YiyanWidget;
