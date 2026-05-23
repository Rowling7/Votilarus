// ==================== 搜索模态弹窗 ====================

import BaseModal from './BaseModal.js';
import ToastNotification from '../utils/ToastNotification.js';

class SearchModal extends BaseModal {
    constructor() {
        // 调用父类构造函数
        super({
            overlayClass: 'search-modal-overlay',
            modalClass: 'search-modal',
            closeOnOverlayClick: false,  // 禁用点击遮罩层关闭
            closeOnEscape: true,
            enableMaximize: false // 搜索框不需要最大化
        });

        this.searchResults = [];
        this.selectedIndex = -1; // 当前选中的结果索引（键盘导航）
        this.debounceTimer = null;
        this.mode = 'openLink';     // 模式：'openLink' | 'addToFolder'
        this.onSelect = null;       // addToFolder 模式下的回调"

        this.init();
    }

    /**
     * 初始化模态弹窗
     */
    init() {
        this.renderModal();
        // 调用父类的 bindEvents 方法绑定通用事件
        super.bindEvents();
        // 绑定自定义事件
        this._bindCustomEvents();
    }

    /**
     * 渲染模态弹窗 HTML
     */
    renderModal() {
        // 创建遮罩层（初始状态为隐藏）
        this.overlay = document.createElement('div');
        this.overlay.className = 'search-modal-overlay hidden';
        this.overlay.id = 'searchModalOverlay';

        // 创建模态框
        this.modal = document.createElement('div');
        this.modal.className = 'search-modal';
        this.modal.id = 'searchModal';

        // 渲染内容
        this.modal.innerHTML = `
            <div class="search-modal-header">
                <div class="search-input-wrapper">
                    <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input 
                        type="text" 
                        class="search-modal-input" 
                        id="searchModalInput"
                        placeholder="搜索图标..."
                        autocomplete="off"
                    />
                </div>
            </div>
            <div class="search-modal-results" id="searchModalResults">
                <div class="search-empty-state">输入关键词开始搜索</div>
            </div>
        `;

        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);

        // 缓存 DOM 元素
        this.inputEl = document.getElementById('searchModalInput');
        this.resultsEl = document.getElementById('searchModalResults');
    }

    /**
     * 绑定自定义事件（子类实现）
     * @private
     */
    _bindCustomEvents() {
        // 输入框实时搜索（debounce）
        this.inputEl.addEventListener('input', (e) => {
            const query = e.target.value.trim();

            // 清除之前的定时器
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }

            // 如果输入为空，立即清空结果并停止搜索
            if (query.length === 0) {
                this.clearResults();
                return;
            }

            // 设置新的定时器
            this.debounceTimer = setTimeout(() => {
                this.performSearch(query);
            }, 300); // 300ms debounce
        });

        // 键盘导航
        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateResults(1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateResults(-1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.selectCurrentResult();
            }
        });

        // 阻止结果区域的右键事件冒泡
        this.resultsEl.addEventListener('contextmenu', (e) => {
            const iconItem = e.target.closest('.search-result-item');
            if (iconItem) {
                e.preventDefault();
                e.stopPropagation();
                this.showIconContextMenu(e, iconItem);
            }
        });
    }

    /**
     * 显示模态弹窗
     * @param {Object} options - 可选配置
     * @param {string} options.mode - 'openLink'（默认）| 'addToFolder'
     * @param {Function} options.onSelect - addToFolder 模式下选中回调
     */
    async open(options = {}) {
        if (this._isOpen) return;

        // 设置模式
        this.mode = options.mode || 'openLink';
        this.onSelect = options.onSelect || null;

        // 清空之前的搜索结果
        this.clearResults();
        this.inputEl.value = '';
        this.selectedIndex = -1;

        // 调用父类的 open 方法
        await super.open();

        // 自动聚焦到输入框
        setTimeout(() => {
            this.inputEl.focus();
        }, 100);
    }

    /**
 * 关闭模态弹窗
 */
    close() {
        // 清除 debounce 定时器
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }

        // 重置模式
        this.mode = 'openLink';
        this.onSelect = null;

        // 调用父类的 close 方法
        super.close();
    }

    /**
     * 执行搜索
     * @param {string} query - 搜索关键词
     */
    async performSearch(query) {
        try {
            const response = await fetch(`/api/items/search?q=${encodeURIComponent(query)}`);

            if (!response.ok) {
                throw new Error('搜索失败');
            }

            const results = await response.json();
            this.searchResults = results;
            this.selectedIndex = -1;
            this.renderResults(results);
        } catch (error) {
            console.error('搜索错误:', error);
            ToastNotification.show('搜索失败，请重试', 'error');
        }
    }

    /**
     * 渲染搜索结果
     * @param {Array} results - 搜索结果数组
     */
    renderResults(results) {
        if (results.length === 0) {
            this.resultsEl.innerHTML = '<div class="search-empty-state">未找到相关图标</div>';
            return;
        }

        const html = results.map((item, index) => {
            // 处理图标路径，与 NavIcon.js 保持一致的逻辑
            let iconPath = item.icon_path || '';

            // 如果提供了图片路径且不是完整URL，则添加 static/ico/ 前缀
            if (iconPath && !iconPath.startsWith('http://') && !iconPath.startsWith('https://') && !iconPath.startsWith('data:')) {
                // 将 Windows 路径分隔符 \ 转换为 /
                iconPath = iconPath.replace(/\\/g, '/');
                // 如果路径不以 static/ 开头，则添加 static/ico/ 前缀
                if (!iconPath.startsWith('static/')) {
                    iconPath = 'static/ico/' + iconPath;
                }
            }

            const title = item.title || '未命名';
            const firstLetter = title.charAt(0).toUpperCase();

            return `
                <div class="search-result-item" data-index="${index}" data-item-id="${item.id}">
                    <div class="search-result-icon-wrapper">
                        ${iconPath
                    ? `<div class="search-result-icon-bg" style="background-image: url('/${iconPath}')"></div>`
                    : `<div class="search-result-icon-letter">${firstLetter}</div>`
                }
                    </div>
                    <div class="search-result-info">
                        <div class="search-result-title">${this.escapeHtml(title)}</div>
                    </div>
                </div>
            `;
        }).join('');

        // 将结果包裹在网格容器中
        this.resultsEl.innerHTML = `<div class="search-results-grid">${html}</div>`;

        // 为每个结果项添加点击事件
        const gridContainer = this.resultsEl.querySelector('.search-results-grid');
        if (gridContainer) {
            gridContainer.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const itemId = parseInt(item.dataset.itemId);
                    this.handleIconClick(itemId);
                });
            });
        }
    }

    /**
     * 清空搜索结果
     */
    clearResults() {
        this.searchResults = [];
        this.selectedIndex = -1;
        this.resultsEl.innerHTML = '<div class="search-empty-state">输入关键词开始搜索</div>';
    }

    /**
     * 键盘导航结果
     * @param {number} direction - 方向（1=向下，-1=向上）
     */
    navigateResults(direction) {
        const gridContainer = this.resultsEl.querySelector('.search-results-grid');
        if (!gridContainer) return;

        const items = gridContainer.querySelectorAll('.search-result-item');
        if (items.length === 0) return;

        // 移除之前的选中状态
        items.forEach(item => item.classList.remove('selected'));

        // 计算新的选中索引
        this.selectedIndex += direction;

        // 边界检查
        if (this.selectedIndex < 0) {
            this.selectedIndex = items.length - 1;
        } else if (this.selectedIndex >= items.length) {
            this.selectedIndex = 0;
        }

        // 添加选中状态并滚动到可见区域
        const selectedItem = items[this.selectedIndex];
        if (selectedItem) {
            selectedItem.classList.add('selected');
            selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    /**
     * 选择当前结果
     */
    selectCurrentResult() {
        if (this.selectedIndex >= 0 && this.selectedIndex < this.searchResults.length) {
            const item = this.searchResults[this.selectedIndex];
            this.handleIconClick(item.id);
        }
    }

    /**
     * 处理图标点击
     * @param {number} itemId - 图标ID
     */
    handleIconClick(itemId) {
        // 从搜索结果中查找对应的图标数据
        const item = this.searchResults.find(r => r.id === itemId);

        if (!item) {
            ToastNotification.show('图标不存在', 'warning');
            return;
        }

        // addToFolder 模式：调用回调，不打开链接，不关闭模态框
        if (this.mode === 'addToFolder' && typeof this.onSelect === 'function') {
            this.onSelect(itemId);
            return;
        }

        // openLink 模式（默认）：打开链接
        const linkUrl = item.link_url;

        if (!linkUrl) {
            ToastNotification.show('该图标没有设置链接', 'warning');
            return;
        }

        // 关闭搜索模态框
        this.close();

        // 延迟打开链接，确保模态框已关闭
        setTimeout(() => {
            window.open(linkUrl, '_blank');
        }, 300);
    }

    /**
     * 显示图标右键菜单
     * @param {MouseEvent} e - 鼠标事件
     * @param {HTMLElement} iconItem - 图标元素
     */
    showIconContextMenu(e, iconItem) {
        const itemId = parseInt(iconItem.dataset.itemId);
        const item = this.searchResults.find(r => r.id === itemId);

        if (!item) return;

        // 使用全局的 ContextMenuHandler
        const contextMenuHandler = window.ContextMenuHandler;
        if (!contextMenuHandler) {
            console.warn('ContextMenuHandler 未初始化');
            return;
        }

        // 构建菜单项
        const menuItems = [
            {
                label: '编辑图标',
                icon: '✏️',
                action: async () => {
                    // 不关闭搜索模态框，直接在上层显示编辑模态框
                    try {
                        // 动态导入 IconEditorHandler（正确的相对路径）
                        const iconEditorModule = await import('../core/handlers/IconEditorHandler.js');
                        const iconEditor = iconEditorModule.default;

                        // 准备图标数据
                        const iconData = {
                            uuid: itemId,
                            name: item.title || '',
                            target: item.link_url || '',
                            bgimage: item.icon_path || '',
                            category_id: item.category_id
                        };

                        // 打开编辑器
                        iconEditor.open(iconData);
                    } catch (error) {
                        console.error('打开编辑器失败:', error);
                        ToastNotification.show('打开编辑器失败', 'error');
                    }
                }
            },
            {
                label: '添加到 Dock 栏',
                icon: '➕',
                action: () => {
                    this.addToDock(itemId);
                }
            },
            {
                label: '删除图标',
                icon: '🗑️',
                className: 'danger',
                action: () => {
                    this.deleteIcon(itemId);
                }
            }
        ];

        // 显示右键菜单
        contextMenuHandler.showCustomMenu(e, menuItems);
    }

    /**
     * 添加到 Dock 栏
     * @param {number} itemId - 图标ID
     */
    async addToDock(itemId) {
        try {
            const response = await fetch('/api/dock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ item_id: itemId })
            });

            if (!response.ok) {
                throw new Error('添加失败');
            }

            ToastNotification.show('已添加到 Dock 栏', 'success');

            // 通知 Dock 刷新
            const dockRefreshEvent = new CustomEvent('dock-refresh');
            document.dispatchEvent(dockRefreshEvent);
        } catch (error) {
            console.error('添加到 Dock 失败:', error);
            ToastNotification.show('添加失败，请重试', 'error');
        }
    }

    /**
     * 删除图标
     * @param {number} itemId - 图标ID
     */
    async deleteIcon(itemId) {
        // 确认删除
        const confirmed = await this.confirmDelete();
        if (!confirmed) return;

        try {
            const response = await fetch(`/api/items/${itemId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('删除失败');
            }

            ToastNotification.show('图标已删除', 'success');

            // 重新搜索以更新结果
            const query = this.inputEl.value.trim();
            if (query) {
                this.performSearch(query);
            }

            // 通知网格刷新
            const gridRefreshEvent = new CustomEvent('grid-refresh');
            document.dispatchEvent(gridRefreshEvent);
        } catch (error) {
            console.error('删除图标失败:', error);
            ToastNotification.show('删除失败，请重试', 'error');
        }
    }

    /**
     * 确认删除对话框
     * @returns {Promise<boolean>}
     */
    confirmDelete() {
        return new Promise((resolve) => {
            const confirmModal = document.querySelector('confirm-modal');
            if (confirmModal) {
                confirmModal.show(
                    '确认删除',
                    '确定要删除这个图标吗？此操作不可恢复。',
                    () => resolve(true),
                    () => resolve(false)
                );
            } else {
                // 如果没有 confirm-modal，使用原生 confirm
                resolve(window.confirm('确定要删除这个图标吗？'));
            }
        });
    }

    /**
     * HTML 转义
     * @param {string} text - 原始文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

export default new SearchModal();
