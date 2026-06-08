// ==================== 历史记录查看模态弹窗 ====================

import BaseModal from './BaseModal.js';
import ToastNotification from '../utils/ToastNotification.js';
import ConfirmModal from '../components/ConfirmModal.js';

class HistoryViewModal extends BaseModal {
    constructor() {
        super({
            overlayClass: 'history-overlay',
            modalClass: 'history-modal',
            closeOnOverlayClick: false,
            closeOnEscape: true,
            enableMaximize: true
        });

        this.records = [];
        this.pagination = null;
        this.isLoading = false;
        this.currentPage = 1;
        this.pageSize = 20;
        this.keyword = '';
        this.dateFrom = '';
        this.dateTo = '';

        this.init();
    }

    /**
     * 初始化
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
        this.overlay.className = 'history-overlay hidden';
        this.overlay.id = 'historyOverlay';

        this.modal = document.createElement('div');
        this.modal.className = 'history-modal';
        this.modal.id = 'historyModal';

        this.modal.innerHTML = `
            <div class="history-content-wrapper">
                <div class="history-header">
                    <h2 class="history-title">🌐 历史记录</h2>
                </div>
                <div class="history-search-bar">
                    <input type="search" id="historyKeyword" placeholder="搜索标题或网址...">
                    <input type="date" id="historyDateFrom" title="开始日期">
                    <input type="date" id="historyDateTo" title="结束日期">
                    <button class="history-search-btn" id="historySearchBtn">搜索</button>
                </div>
                <div class="history-list-container">
                    <div class="history-list"></div>
                    <div class="history-empty">
                        <span class="history-empty-icon">📝</span>
                        <p>暂无历史记录</p>
                    </div>
                    <div class="history-loading hidden">
                        <div class="spinner"></div>
                        <p>加载中...</p>
                    </div>
                </div>
                <div class="history-pagination hidden" id="historyPagination"></div>
            </div>
        `;

        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);

        // 缓存 DOM 元素
        this.listEl = this.modal.querySelector('.history-list');
        this.emptyEl = this.modal.querySelector('.history-empty');
        this.loadingEl = this.modal.querySelector('.history-loading');
        this.paginationEl = document.getElementById('historyPagination');
        this.searchInput = document.getElementById('historyKeyword');
        this.dateFromInput = document.getElementById('historyDateFrom');
        this.dateToInput = document.getElementById('historyDateTo');
        this.searchBtn = document.getElementById('historySearchBtn');
    }

    /**
     * 绑定自定义事件
     */
    _bindCustomEvents() {
        // 刷新按钮
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'modal-control-btn modal-refresh-btn';
        refreshBtn.innerHTML = '🔄';
        refreshBtn.title = '刷新列表';
        refreshBtn.setAttribute('aria-label', '刷新列表');

        refreshBtn.addEventListener('click', () => {
            this.loadHistory();
        });

        if (this.controlContainer && this.controlContainer.firstChild) {
            this.controlContainer.insertBefore(refreshBtn, this.controlContainer.firstChild);
        }
        this.refreshBtn = refreshBtn;

        // 搜索按钮
        this.searchBtn.addEventListener('click', () => {
            this.keyword = this.searchInput.value.trim();
            this.dateFrom = this.dateFromInput.value;
            this.dateTo = this.dateToInput.value;
            this.currentPage = 1;
            this.loadHistory();
        });

        // 回车搜索
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.searchBtn.click();
            }
        });
    }

    /**
     * 打开模态弹窗
     */
    async open() {
        if (this._isOpen) return;
        await super.open();
        await this.loadHistory();
    }

    /**
     * 关闭模态弹窗
     */
    close() {
        super.close();
    }

    /**
     * 加载历史记录
     */
    async loadHistory() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading();

        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                pageSize: this.pageSize,
                keyword: this.keyword,
                dateFrom: this.dateFrom,
                dateTo: this.dateTo
            });

            const response = await fetch(`/api/ext-history/list?${params}`);

            if (!response.ok) {
                throw new Error('加载失败');
            }

            const result = await response.json();

            if (result.success) {
                this.records = result.data || [];
                this.pagination = result.pagination || null;
                this.renderList();
                this.renderPagination();
            } else {
                throw new Error(result.error || '加载失败');
            }
        } catch (error) {
            console.error('[HistoryViewModal] 加载失败:', error);
            ToastNotification.show('加载历史记录失败', 'error');
            this.records = [];
            this.renderList();
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    /**
     * 渲染列表
     */
    renderList() {
        if (!this.listEl || !this.emptyEl) return;

        if (this.records.length === 0) {
            this.listEl.innerHTML = '';
            this.emptyEl.classList.remove('hidden');
            return;
        }

        this.emptyEl.classList.add('hidden');

        const startIndex = (this.currentPage - 1) * this.pageSize;
        this.listEl.innerHTML = this.records.map((item, index) => this._renderItem(item, startIndex + index + 1)).join('');

        // 绑定每个条目的事件
        this.listEl.querySelectorAll('.history-item').forEach(itemEl => {
            const id = parseInt(itemEl.dataset.id);
            const item = this.records.find(r => r.id === id);
            if (!item) return;

            // 标题点击 → 打开链接
            const titleEl = itemEl.querySelector('.history-item-title');
            if (titleEl) {
                titleEl.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.open(item.url, '_blank');
                });
            }

            // 复制按钮
            const copyBtn = itemEl.querySelector('.history-copy-btn');
            if (copyBtn) {
                copyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.copyUrl(item);
                });
            }

            // 删除按钮
            const deleteBtn = itemEl.querySelector('.history-delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteRecord(item);
                });
            }
        });
    }

    /**
     * 渲染单个条目 HTML
     */
    _renderItem(item, seqNum) {
        const title = this._escapeHtml(item.title || item.url || '无标题');
        const url = this._escapeHtml(item.url || '');
        const lastVisit = item.last_visit_at ? this._formatDate(item.last_visit_at) : '';

        return `
            <div class="history-item" data-id="${item.id}">
                <div class="history-item-icon history-item-seq">
                    #${seqNum}
                </div>
                <div class="history-item-body">
                    <a class="history-item-title" href="#" title="${url}">${title}</a>
                    <div class="history-item-url" title="${url}">${url}</div>
                    <div class="history-item-time">📅 ${lastVisit}</div>
                </div>
                <div class="history-item-actions">
                    <button class="history-action-btn history-copy-btn" title="复制链接">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                    <button class="history-action-btn history-delete-btn" title="删除">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 渲染分页
     */
    renderPagination() {
        if (!this.paginationEl) return;

        if (!this.pagination || this.pagination.totalPages <= 1) {
            this.paginationEl.classList.add('hidden');
            return;
        }

        this.paginationEl.classList.remove('hidden');

        const { page, totalPages, total } = this.pagination;

        this.paginationEl.innerHTML = `
            <button class="history-page-btn" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>‹ 上一页</button>
            <span class="history-page-info">${page} / ${totalPages}（共 ${total} 条）</span>
            <button class="history-page-btn" data-page="${page + 1}" ${page >= totalPages ? 'disabled' : ''}>下一页 ›</button>
        `;

        // 绑定点击事件
        this.paginationEl.querySelectorAll('.history-page-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetPage = parseInt(btn.dataset.page);
                if (targetPage >= 1 && targetPage <= totalPages) {
                    this.currentPage = targetPage;
                    this.loadHistory();
                }
            });
        });
    }

    /**
     * 复制 URL 到剪贴板
     */
    async copyUrl(item) {
        if (!item || !item.url) return;

        try {
            await navigator.clipboard.writeText(item.url);
            ToastNotification.show('📋 链接已复制到剪贴板', 'success', 2000);
        } catch (error) {
            console.error('[HistoryViewModal] 复制失败:', error);
            this._fallbackCopy(item.url);
        }
    }

    /**
     * 降级复制方案
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
            ToastNotification.show('📋 链接已复制到剪贴板', 'success', 2000);
        } catch {
            ToastNotification.show('复制失败，请手动复制', 'error');
        }
        document.body.removeChild(textarea);
    }

    /**
     * 删除记录（软删除）
     */
    async deleteRecord(item) {
        if (!item || !item.id) return;

        const confirmed = await ConfirmModal.show({
            title: '确认删除',
            message: `确定要删除这条历史记录吗？\n${item.title || item.url}`,
            confirmText: '删除',
            cancelText: '取消',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            const response = await fetch(`/api/ext-history/${item.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('删除失败');
            }

            const result = await response.json();

            if (result.success) {
                this.records = this.records.filter(r => r.id !== item.id);
                this.renderList();
                ToastNotification.show('🗑️ 已删除', 'success', 2000);

                // 如果当前页没有数据了，自动翻到上一页
                if (this.records.length === 0 && this.currentPage > 1) {
                    this.currentPage--;
                    await this.loadHistory();
                }
            } else {
                throw new Error(result.error || '删除失败');
            }
        } catch (error) {
            console.error('[HistoryViewModal] 删除失败:', error);
            ToastNotification.show('删除失败，请重试', 'error');
        }
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        if (this.loadingEl) this.loadingEl.classList.remove('hidden');
        if (this.listEl) this.listEl.innerHTML = '';
        if (this.emptyEl) this.emptyEl.classList.add('hidden');
    }

    /**
     * 隐藏加载状态
     */
    hideLoading() {
        if (this.loadingEl) this.loadingEl.classList.add('hidden');
    }

    /**
     * 格式化日期（相对时间 + 绝对时间）
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

            let relative = '';
            if (minutes < 1) relative = '刚刚';
            else if (minutes < 60) relative = `${minutes} 分钟前`;
            else if (hours < 24) relative = `${hours} 小时前`;
            else if (days < 7) relative = `${days} 天前`;

            // 绝对时间
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hour = String(date.getHours()).padStart(2, '0');
            const minute = String(date.getMinutes()).padStart(2, '0');
            const absTime = year === now.getFullYear()
                ? `${month}-${day} ${hour}:${minute}`
                : `${year}-${month}-${day} ${hour}:${minute}`;

            return relative ? `${relative}（${absTime}）` : absTime;
        } catch {
            return dateStr;
        }
    }

    /**
     * HTML 转义
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

export default new HistoryViewModal();