// ==================== 文件夹小组件 ====================

import BaseWidget from './BaseWidget.js';
import searchModal from '../modal/SearchModal.js';
import folderExpandModal from '../modal/FolderExpandModal.js';
import ToastNotification from '../utils/ToastNotification.js';

class FolderWidget extends BaseWidget {
    constructor(container, widgetId = null) {
        super(container, widgetId, 'FolderWidget');
        this.folderItems = [];
        this.addToFolderCallback = null;
    }

    render() {
        this.container.innerHTML = `
            <div class="folder-widget">
                <div class="folder-grid" id="folder-grid-${this.widgetId}">
                </div>
            </div>
        `;

        this.gridEl = this.container.querySelector('.folder-grid');

        // 绑定空白区域点击（展开大弹窗）
        this.container.addEventListener('click', (e) => {
            // 只有点击到 folder-widget 本身或 folder-grid 空白区域时才展开
            if (e.target === this.container ||
                e.target.classList.contains('folder-widget') ||
                e.target === this.gridEl) {
                folderExpandModal.open(this.widgetId, this.folderItems);
            }
        });

        return {
            destroy: () => this.destroy()
        };
    }

    async init() {
        await this.loadItems();
    }

    async loadItems() {
        try {
            const response = await fetch(`/api/folder/${this.widgetId}/items`);
            if (!response.ok) throw new Error(`加载文件夹失败, status: ${response.status}`);
            const text = await response.text();
            this.folderItems = JSON.parse(text);
            this.renderGrid();
        } catch (error) {
            console.error(`[FolderWidget#${this.widgetId}] 加载文件夹图标失败:`, error);
        }
    }

    renderGrid() {
        if (!this.gridEl) return;

        let html = '';

        if (this.folderItems.length === 0) {
            // 初始空白态：大的 ➕ 居中占位
            html = `
                <div class="folder-grid-empty">
                    <div class="folder-empty-add" id="folder-add-${this.widgetId}" title="添加图标">➕</div>
                </div>
            `;
        } else {
            this.folderItems.forEach(item => {
                const iconPath = this._processIconPath(item.icon_path);
                html += `
                    <div class="folder-grid-item" data-item-id="${item.item_id}" data-folder-item-id="${item.folder_item_id}">
                        <div class="folder-icon-wrapper">
                            ${iconPath
                                ? `<div class="folder-icon-bg" style="background-image: url('/${iconPath}')"></div>`
                                : `<div class="folder-icon-letter">${(item.title || '?').charAt(0).toUpperCase()}</div>`
                            }
                            <div class="folder-icon-remove" data-item-id="${item.item_id}" title="从文件夹移除">❌</div>
                        </div>
                    </div>
                `;
            });

            // 末尾保留 ➕ 格子
            html += `
                <div class="folder-grid-item folder-grid-add" id="folder-add-${this.widgetId}">
                    <div class="folder-add-btn">➕</div>
                </div>
            `;
        }

        this.gridEl.innerHTML = html;

        this._bindGridEvents();
    }

    _bindGridEvents() {
        if (!this.gridEl) return;

        // 绑定添加按钮
        const addBtn = this.gridEl.querySelector(`#folder-add-${this.widgetId}`);
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openSearchModal();
            });
        }

        // 绑定移除按钮
        this.gridEl.querySelectorAll('.folder-icon-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemId = parseInt(btn.dataset.itemId);
                this.removeItem(itemId);
            });
        });
    }

    openSearchModal() {
        // 设置 SearchModal 为 addToFolder 模式
        searchModal.open({
            mode: 'addToFolder',
            onSelect: (itemId) => this.addItemToFolder(itemId)
        });
    }

    async addItemToFolder(itemId) {
        try {
            const response = await fetch(`/api/folder/${this.widgetId}/add-item`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item_id: itemId })
            });

            if (!response.ok) {
                const data = await response.json();
                if (response.status === 409) {
                    ToastNotification.show('该图标已在文件夹中', 'warning');
                } else {
                    throw new Error(data.error || '添加失败');
                }
                return;
            }

            ToastNotification.show('已添加到文件夹', 'success');
            await this.loadItems();
        } catch (error) {
            console.error('添加图标到文件夹失败:', error);
            ToastNotification.show('添加失败', 'error');
        }
    }

    async removeItem(itemId) {
        try {
            const response = await fetch(`/api/folder/${this.widgetId}/remove-item/${itemId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('移除失败');
            }

            ToastNotification.show('已从文件夹移除', 'success');

            // 更新内部数据
            this.folderItems = this.folderItems.filter(item => item.item_id !== itemId);

            // 重新渲染网格（正确处理从有到无的状态切换）
            this.renderGrid();
        } catch (error) {
            console.error('移除图标失败:', error);
            ToastNotification.show('移除失败', 'error');
        }
    }

    _processIconPath(iconPath) {
        if (!iconPath) return '';
        if (iconPath.startsWith('http://') || iconPath.startsWith('https://') || iconPath.startsWith('data:')) {
            return iconPath;
        }
        let path = iconPath.replace(/\\/g, '/');
        if (!path.startsWith('static/')) {
            path = 'static/ico/' + path;
        }
        return path;
    }

    refresh() {
        this.loadItems();
    }

    destroy() {
        super.destroy();
        this.folderItems = [];
        // 移除文件夹刷新事件监听
        document.removeEventListener(`folder-refresh-${this.widgetId}`, this._boundHandleFolderRefresh);
    }
}

// 绑定事件监听（在构造函数中调用）
const _originalInit = FolderWidget.prototype.init;
FolderWidget.prototype.init = async function () {
    // 监听来自 FolderExpandModal 的刷新事件
    this._boundHandleFolderRefresh = () => this.loadItems();
    document.addEventListener(`folder-refresh-${this.widgetId}`, this._boundHandleFolderRefresh);
    return _originalInit.call(this);
};

export default FolderWidget;
