// ==================== 添加图标对话框处理器 ====================

import ConfirmModal from '../../components/ConfirmModal.js';
import ToastNotification from '../../utils/ToastNotification.js';

class AddIconDialogHandler {
    constructor() {
        this.dialog = null;
        this.overlay = null;
        this.currentCategoryId = null;
    }

    /**
     * 初始化对话框
     */
    init() {
        this.createDialog();
    }

    /**
     * 创建对话框 DOM
     */
    createDialog() {
        // 遮罩层
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';

        // 对话框
        this.dialog = document.createElement('div');
        this.dialog.className = 'icon-editor-dialog';

        this.dialog.innerHTML = `
            <div class="dialog-header">
                <h3>➕ 添加图标</h3>
                <button class="dialog-close-btn" aria-label="关闭">×</button>
            </div>
            <div class="dialog-body">
                <div class="form-group">
                    <label for="add-icon-name">名称 *</label>
                    <input type="text" id="add-icon-name" placeholder="输入图标名称" required>
                </div>
                
                <div class="form-group">
                    <label for="add-icon-url">链接地址 *</label>
                    <input type="url" id="add-icon-url" placeholder="https://example.com" required>
                </div>
                
                <div class="form-group">
                    <label for="add-icon-image">图标图片 URL（可选）</label>
                    <input type="url" id="add-icon-image" placeholder="https://example.com/icon.png">
                    <div class="form-hint">留空则显示首字母</div>
                </div>
                
                <div class="form-group">
                    <label>预览</label>
                    <div class="icon-preview" id="add-icon-preview">
                        <div class="preview-icon" id="add-preview-icon"></div>
                        <div class="preview-name" id="add-preview-name">图标名称</div>
                    </div>
                </div>
            </div>
            <div class="dialog-footer">
                <button class="btn btn-secondary" id="cancel-add-icon-btn">取消</button>
                <button class="btn btn-primary" id="save-add-icon-btn">添加</button>
            </div>
        `;

        document.body.appendChild(this.overlay);
        document.body.appendChild(this.dialog);

        this.bindEvents();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 关闭按钮
        const closeBtn = this.dialog.querySelector('.dialog-close-btn');
        closeBtn.addEventListener('click', () => this.close());

        // 点击遮罩层
        this.overlay.addEventListener('click', () => this.close());

        // ESC 键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.dialog.classList.contains('active')) {
                this.close();
            }
        });

        // 取消按钮
        const cancelBtn = document.getElementById('cancel-add-icon-btn');
        cancelBtn.addEventListener('click', () => this.close());

        // 保存按钮
        const saveBtn = document.getElementById('save-add-icon-btn');
        saveBtn.addEventListener('click', () => this.save());

        // 实时预览
        const nameInput = document.getElementById('add-icon-name');
        const imageInput = document.getElementById('add-icon-image');

        nameInput.addEventListener('input', () => this.updatePreview());
        imageInput.addEventListener('input', () => this.updatePreview());
    }

    /**
     * 打开对话框
     */
    open(categoryId) {
        this.currentCategoryId = categoryId;

        // 清空表单
        document.getElementById('add-icon-name').value = '';
        document.getElementById('add-icon-url').value = '';
        document.getElementById('add-icon-image').value = '';

        // 更新预览
        this.updatePreview();

        // 显示对话框
        this.overlay.classList.add('active');
        this.dialog.classList.add('active');

        // 聚焦到名称输入框
        setTimeout(() => {
            document.getElementById('add-icon-name').focus();
        }, 100);
    }

    /**
     * 关闭对话框
     */
    close() {
        this.overlay.classList.remove('active');
        this.dialog.classList.remove('active');
        this.currentCategoryId = null;
    }

    /**
     * 更新预览
     */
    updatePreview() {
        const name = document.getElementById('add-icon-name').value || '图标名称';
        const imageUrl = document.getElementById('add-icon-image').value;

        const previewIcon = document.getElementById('add-preview-icon');
        const previewName = document.getElementById('add-preview-name');

        previewName.textContent = name;

        if (imageUrl) {
            previewIcon.style.backgroundImage = `url(${imageUrl})`;
            previewIcon.textContent = '';
        } else {
            previewIcon.style.backgroundImage = '';
            previewIcon.textContent = name.charAt(0).toUpperCase();
        }
    }

    /**
     * 保存新图标
     */
    async save() {
        const name = document.getElementById('add-icon-name').value.trim();
        const target = document.getElementById('add-icon-url').value.trim();
        const bgimage = document.getElementById('add-icon-image').value.trim();

        if (!name) {
            ToastNotification.warning('请输入图标名称');
            return;
        }

        if (!target) {
            ToastNotification.warning('请输入链接地址');
            return;
        }

        try {
            const { createItem } = await import('../api-client.js');

            const result = await createItem({
                name,
                target,
                bgimage: bgimage || null,
                category_id: this.currentCategoryId
            });

            ToastNotification.success('图标创建成功！请刷新页面查看');
            this.close();
        } catch (error) {
            ToastNotification.error('创建失败: ' + error.message);
        }
    }
}

export default new AddIconDialogHandler();
