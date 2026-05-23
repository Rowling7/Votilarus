// ==================== 一言收藏列表模态弹窗 ====================

import BaseModal from './BaseModal.js';
import ToastNotification from '../utils/ToastNotification.js';
import ConfirmModal from '../components/ConfirmModal.js';

class YiyanFavoritesModal extends BaseModal {
    constructor() {
        super({
            overlayClass: 'yiyan-favorites-overlay',
            modalClass: 'yiyan-favorites-modal',
            closeOnOverlayClick: false,
            closeOnEscape: true,
            enableMaximize: true
        });

        this.favorites = [];
        this.isLoading = false;

        this.init();
    }

    /**
     * 初始化模态弹窗
     */
    init() {
        this.renderModal();
        super.bindEvents();
        this._bindCustomEvents();
    }

    /**
     * 渲染模态弹窗 HTML
     */
    renderModal() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'yiyan-favorites-overlay hidden';
        this.overlay.id = 'yiyanFavoritesOverlay';

        this.modal = document.createElement('div');
        this.modal.className = 'yiyan-favorites-modal';
        this.modal.id = 'yiyanFavoritesModal';

        this.modal.innerHTML = `
            <div class="yiyan-favorites-content-wrapper">
                <div class="yiyan-favorites-header">
                    <h2 class="yiyan-favorites-title">❤️ 我的收藏</h2>
                </div>
                <div class="yiyan-favorites-list-container">
                    <div class="yiyan-favorites-list"></div>
                    <div class="yiyan-favorites-empty">
                        <span class="yiyan-favorites-empty-icon">📝</span>
                        <p>暂无收藏，快去添加吧~</p>
                    </div>
                    <div class="yiyan-favorites-loading hidden">
                        <div class="spinner"></div>
                        <p>加载中...</p>
                    </div>
                </div>
            </div>
        `;

        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);

        // 缓存 DOM 元素
        this.listEl = this.modal.querySelector('.yiyan-favorites-list');
        this.emptyEl = this.modal.querySelector('.yiyan-favorites-empty');
        this.loadingEl = this.modal.querySelector('.yiyan-favorites-loading');
    }

    /**
     * 绑定自定义事件
     * @private
     */
    _bindCustomEvents() {
        // 在控制按钮容器中添加刷新按钮（位于最大化按钮之前）
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'modal-control-btn modal-refresh-btn';
        refreshBtn.innerHTML = '🔄';
        refreshBtn.title = '刷新列表';
        refreshBtn.setAttribute('aria-label', '刷新列表');

        refreshBtn.addEventListener('click', () => {
            this.refreshFavorites();
        });

        // 插入到第一个子元素之前（即最大化按钮前面）
        if (this.controlContainer && this.controlContainer.firstChild) {
            this.controlContainer.insertBefore(refreshBtn, this.controlContainer.firstChild);
        }
        this.refreshBtn = refreshBtn;
    }

    /**
     * 显示模态弹窗
     */
    async open() {
        if (this._isOpen) return;

        // 调用父类的 open 方法
        await super.open();

        // 加载数据
        await this.loadFavorites();
    }

    /**
     * 关闭模态弹窗
     */
    close() {
        super.close();
    }

    /**
     * 加载收藏列表
     */
    async loadFavorites() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading();

        try {
            const response = await fetch('/api/yiyan/favorites');

            if (!response.ok) {
                throw new Error('加载失败');
            }

            const result = await response.json();

            if (result.success) {
                this.favorites = result.data || [];
                this.renderList();
            } else {
                throw new Error(result.error || '加载失败');
            }
        } catch (error) {
            console.error('[YiyanFavoritesModal] 加载失败:', error);
            ToastNotification.show('加载收藏列表失败', 'error');
            this.favorites = [];
            this.renderList();
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    /**
     * 刷新收藏列表
     */
    async refreshFavorites() {
        // 按钮旋转动画
        if (this.refreshBtn) {
            this.refreshBtn.classList.add('spinning');
        }

        await this.loadFavorites();

        // 停止旋转动画
        if (this.refreshBtn) {
            setTimeout(() => {
                this.refreshBtn.classList.remove('spinning');
            }, 300);
        }
    }

    /**
     * 渲染列表
     */
    renderList() {
        if (!this.listEl || !this.emptyEl) return;

        if (this.favorites.length === 0) {
            this.listEl.innerHTML = '';
            this.emptyEl.classList.remove('hidden');
            return;
        }

        this.emptyEl.classList.add('hidden');

        this.listEl.innerHTML = this.favorites.map(item => this._renderItem(item)).join('');

        // 绑定每个条目的事件
        this.listEl.querySelectorAll('.yiyan-favorites-item').forEach(itemEl => {
            const id = parseInt(itemEl.dataset.id);
            const item = this.favorites.find(f => f.id === id);

            // 复制按钮
            const copyBtn = itemEl.querySelector('.yiyan-favorites-copy-btn');
            if (copyBtn) {
                copyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.copyContent(item);
                });
            }

            // 删除按钮
            const deleteBtn = itemEl.querySelector('.yiyan-favorites-delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteFavorite(item);
                });
            }
        });
    }

    /**
     * 渲染单个条目 HTML
     * @param {Object} item
     * @returns {string}
     * @private
     */
    _renderItem(item) {
        const content = this._escapeHtml(item.content || '');
        const createdAt = this._formatDate(item.created_at);

        return `
            <div class="yiyan-favorites-item" data-id="${item.id}">
                <div class="yiyan-favorites-item-body">
                    <div class="yiyan-favorites-item-content">${content}</div>
                    <div class="yiyan-favorites-item-meta">
                        <span class="yiyan-favorites-item-time">📅 ${createdAt}</span>
                    </div>
                </div>
                <div class="yiyan-favorites-item-actions">
                    <button class="yiyan-favorites-action-btn yiyan-favorites-copy-btn" title="复制">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                    <button class="yiyan-favorites-action-btn yiyan-favorites-delete-btn" title="删除">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 复制内容到剪贴板
     * @param {Object} item
     */
    async copyContent(item) {
        if (!item || !item.content) return;

        try {
            await navigator.clipboard.writeText(item.content);
            ToastNotification.show('📋 已复制到剪贴板', 'success', 2000);
        } catch (error) {
            console.error('[YiyanFavoritesModal] 复制失败:', error);
            // 降级方案
            this._fallbackCopy(item.content);
        }
    }

    /**
     * 降级复制方案（兼容旧浏览器或不安全上下文）
     * @param {string} text
     * @private
     */
    _fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            ToastNotification.show('📋 已复制到剪贴板', 'success', 2000);
        } catch (err) {
            ToastNotification.show('复制失败，请手动复制', 'error');
        }
        document.body.removeChild(textarea);
    }

    /**
     * 删除收藏（软删除）
     * @param {Object} item
     */
    async deleteFavorite(item) {
        if (!item || !item.id) return;

        // 弹出确认对话框
        const confirmed = await ConfirmModal.show({
            title: '确认删除',
            message: '确定要删除这条收藏吗？',
            confirmText: '删除',
            cancelText: '取消',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            const response = await fetch(`/api/yiyan/favorite/${item.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('删除失败');
            }

            const result = await response.json();

            if (result.success) {
                // 从列表中移除
                this.favorites = this.favorites.filter(f => f.id !== item.id);
                this.renderList();
                ToastNotification.show('🗑️ 已删除', 'success', 2000);
            } else {
                throw new Error(result.error || '删除失败');
            }
        } catch (error) {
            console.error('[YiyanFavoritesModal] 删除失败:', error);
            ToastNotification.show('删除失败，请重试', 'error');
        }
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        if (this.loadingEl) {
            this.loadingEl.classList.remove('hidden');
        }
        if (this.listEl) {
            this.listEl.innerHTML = '';
        }
        if (this.emptyEl) {
            this.emptyEl.classList.add('hidden');
        }
    }

    /**
     * 隐藏加载状态
     */
    hideLoading() {
        if (this.loadingEl) {
            this.loadingEl.classList.add('hidden');
        }
    }

    /**
     * 格式化日期
     * @param {string} dateStr
     * @returns {string}
     * @private
     */
    _formatDate(dateStr) {
        if (!dateStr) return '未知';

        try {
            const date = new Date(dateStr.replace(' ', 'T'));
            if (isNaN(date.getTime())) return dateStr;

            const now = new Date();
            const diff = now - date;
            const minutes = Math.floor(diff / (1000 * 60));
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));

            if (minutes < 1) return '刚刚';
            if (minutes < 60) return `${minutes} 分钟前`;
            if (hours < 24) return `${hours} 小时前`;
            if (days < 7) return `${days} 天前`;

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hour = String(date.getHours()).padStart(2, '0');
            const minute = String(date.getMinutes()).padStart(2, '0');

            if (year === now.getFullYear()) {
                return `${month}-${day} ${hour}:${minute}`;
            }
            return `${year}-${month}-${day} ${hour}:${minute}`;
        } catch {
            return dateStr;
        }
    }

    /**
     * HTML 转义
     * @param {string} text
     * @returns {string}
     * @private
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

export default new YiyanFavoritesModal();