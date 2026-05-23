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
                <h3>📁 文件夹</h3>
            </div>
            <div class="folder-expand-body">
                <div class="folder-expand-grid" id="folder-expand-grid">
                </div>
            </div>
        `;

        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);

        this.gridEl = document.getElementById('folder-expand-grid');
    }

    open(widgetId, folderItems) {
        this.widgetId = widgetId;
        this.folderItems = [...folderItems];
        this.renderExpandGrid();
        super.open();
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
