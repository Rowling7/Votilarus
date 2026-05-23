// ==================== 文件夹展开大弹窗 ====================

import BaseModal from './BaseModal.js';
import ToastNotification from '../utils/ToastNotification.js';

class FolderExpandModal extends BaseModal {
    constructor() {
        super({
            overlayClass: 'folder-expand-modal-overlay',
            modalClass: 'folder-expand-modal',
            closeOnOverlayClick: true,
            closeOnEscape: false,
            enableMaximize: false
        });

        this.widgetId = null;
        this.folderItems = [];
        this.titleCn = null;

        this.init();
    }

    init() {
        this.renderModal();
        super.bindEvents();
    }

    renderModal() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'folder-expand-modal-overlay hidden';

        this.modal = document.createElement('div');
        this.modal.className = 'folder-expand-modal';
        this.modal.innerHTML = `
            <div class="folder-expand-header">
                <h3 id="folder-expand-title-o">📁</h3>
                <h3 id="folder-expand-title">📁 文件夹</h3>
            </div>
            <div class="folder-expand-body">
                <div class="folder-expand-grid" id="folder-expand-grid">
                </div>
            </div>
        `;

        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);

        this.gridEl = document.getElementById('folder-expand-grid');
        this.titleEl = document.getElementById('folder-expand-title');

        // 绑定标题编辑事件
        this._bindTitleEdit();
    }

    open(widgetId, folderItems, titleCn = null) {
        this.widgetId = widgetId;
        this.folderItems = [...folderItems];
        this.titleCn = titleCn;

        // 更新标题显示
        this.titleEl.textContent = titleCn || '📁 文件夹';

        this.renderExpandGrid();
        super.open();
    }

    _bindTitleEdit() {
        this.titleEl.addEventListener('click', (e) => {
            e.stopPropagation();

            const oldTitle = this.titleCn || '文件夹';
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'folder-expand-title-input';
            input.value = oldTitle;
            input.style.cssText = 'font-size: inherit; font-weight: inherit; text-align: center; border: 1px solid #ccc; border-radius: 4px; padding: 4px 8px; width: 80%; max-width: 300px;';

            // 替换 h3 内容
            this.titleEl.textContent = '';
            this.titleEl.appendChild(input);
            input.focus();
            input.select();

            const saveTitle = async () => {
                const newTitle = input.value.trim();
                if (!newTitle || newTitle === oldTitle) {
                    // 没变化，恢复原样
                    this.titleEl.textContent = oldTitle || '📁 文件夹';
                    return;
                }

                try {
                    const response = await fetch(`/api/widgets/${this.widgetId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title_cn: newTitle })
                    });

                    const result = await response.json();

                    if (!response.ok || !result.success) {
                        throw new Error(result.error || '更新失败');
                    }

                    this.titleCn = newTitle;
                    this.titleEl.textContent = newTitle;

                    // 更新 WidgetManager 中的 widget 实例 titleCn
                    if (window.widgetManager) {
                        const widget = window.widgetManager.activeWidgets.get(this.widgetId);
                        if (widget) {
                            widget.titleCn = newTitle;
                        }
                    }

                    // 更新 grid-item 下方显示的中文标题
                    const gridItem = document.querySelector(`.grid-item[data-widget-id="${this.widgetId}"]`);
                    if (gridItem) {
                        let titleDiv = gridItem.querySelector('.widget-title-cn');
                        if (!titleDiv) {
                            titleDiv = document.createElement('div');
                            titleDiv.className = 'widget-title-cn';
                            gridItem.appendChild(titleDiv);
                        }
                        titleDiv.textContent = newTitle;
                        titleDiv.title = newTitle;
                    }

                    ToastNotification.show('标题已更新', 'success');
                } catch (error) {
                    console.error('更新标题失败:', error);
                    ToastNotification.show('更新标题失败', 'error');
                    this.titleEl.textContent = oldTitle;
                }
            };

            input.addEventListener('blur', saveTitle);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    input.blur();
                } else if (e.key === 'Escape') {
                    this.titleEl.textContent = oldTitle;
                }
            });
        });
    }

    renderExpandGrid() {
        if (!this.gridEl) return;

        let html = '';

        if (this.folderItems.length === 0) {
            html = '<div class="folder-expand-empty">文件夹为空，在小组件内点击 ➕ 添加图标</div>';
        } else {
            this.folderItems.forEach(item => {
                const iconPath = this._processIconPath(item.icon_path);
                const title = item.title || '未命名';
                html += `
                    <div class="folder-expand-item" data-item-id="${item.item_id}">
                        <div class="folder-expand-icon-wrapper">
                            ${iconPath
                        ? `<div class="folder-expand-icon-bg" style="background-image: url('/${iconPath}')"></div>`
                        : `<div class="folder-expand-icon-letter">${title.charAt(0).toUpperCase()}</div>`
                    }
                            <div class="folder-expand-remove" data-item-id="${item.item_id}" title="从文件夹移除">❌</div>
                        </div>
                    </div>
                `;
            });
        }

        this.gridEl.innerHTML = html;
        this._bindExpandEvents();
    }

    _bindExpandEvents() {
        if (!this.gridEl) return;

        this.gridEl.querySelectorAll('.folder-expand-remove').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const itemId = parseInt(btn.dataset.itemId);
                await this.removeItem(itemId);
            });
        });
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

            this.folderItems = this.folderItems.filter(item => item.item_id !== itemId);
            this.renderExpandGrid();

            // 通知对应的 FolderWidget 刷新
            const refreshEvent = new CustomEvent(`folder-refresh-${this.widgetId}`);
            document.dispatchEvent(refreshEvent);
        } catch (error) {
            console.error('移除失败:', error);
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
}

const folderExpandModal = new FolderExpandModal();
export default folderExpandModal;