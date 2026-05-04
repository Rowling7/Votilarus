// ==================== 图标编辑对话框处理器 ====================

class IconEditorHandler {
    constructor() {
        this.dialog = null;
        this.overlay = null;
        this.currentItem = null;
    }

    /**
     * 初始化编辑器
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
                <h3>✏️ 编辑图标</h3>
                <button class="dialog-close-btn" aria-label="关闭">×</button>
            </div>
            <div class="dialog-body">
                <div class="form-group">
                    <label for="edit-icon-name">名称</label>
                    <input type="text" id="edit-icon-name" placeholder="输入图标名称">
                </div>
                
                <div class="form-group">
                    <label for="edit-icon-url">链接地址</label>
                    <input type="url" id="edit-icon-url" placeholder="https://example.com">
                </div>
                
                <div class="form-group">
                    <label for="edit-icon-image">图标图片 URL</label>
                    <input type="url" id="edit-icon-image" placeholder="https://example.com/icon.png">
                    <div class="form-hint">留空则显示首字母</div>
                </div>
                
                <div class="form-group">
                    <label>预览</label>
                    <div class="icon-preview" id="icon-preview">
                        <div class="preview-icon" id="preview-icon"></div>
                        <div class="preview-name" id="preview-name">图标名称</div>
                    </div>
                </div>
            </div>
            <div class="dialog-footer">
                <button class="btn btn-secondary" id="cancel-edit-btn">取消</button>
                <button class="btn btn-primary" id="save-edit-btn">保存</button>
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
        const cancelBtn = document.getElementById('cancel-edit-btn');
        cancelBtn.addEventListener('click', () => this.close());
        
        // 保存按钮
        const saveBtn = document.getElementById('save-edit-btn');
        saveBtn.addEventListener('click', () => this.save());
        
        // 实时预览
        const nameInput = document.getElementById('edit-icon-name');
        const imageInput = document.getElementById('edit-icon-image');
        
        nameInput.addEventListener('input', () => this.updatePreview());
        imageInput.addEventListener('input', () => this.updatePreview());
    }

    /**
     * 打开编辑器
     */
    open(itemData) {
        this.currentItem = itemData;
        
        // 填充表单
        document.getElementById('edit-icon-name').value = itemData.name || '';
        document.getElementById('edit-icon-url').value = itemData.target || '';
        document.getElementById('edit-icon-image').value = itemData.bgimage || '';
        
        // 更新预览
        this.updatePreview();
        
        // 显示对话框
        this.overlay.classList.add('active');
        this.dialog.classList.add('active');
        
        console.log('✅ 图标编辑器已打开');
    }

    /**
     * 关闭编辑器
     */
    close() {
        this.overlay.classList.remove('active');
        this.dialog.classList.remove('active');
        this.currentItem = null;
        
        console.log('✅ 图标编辑器已关闭');
    }

    /**
     * 更新预览
     */
    updatePreview() {
        const name = document.getElementById('edit-icon-name').value || '图标名称';
        const imageUrl = document.getElementById('edit-icon-image').value;
        
        const previewIcon = document.getElementById('preview-icon');
        const previewName = document.getElementById('preview-name');
        
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
     * 保存修改
     */
    async save() {
        if (!this.currentItem) return;
        
        const name = document.getElementById('edit-icon-name').value.trim();
        const target = document.getElementById('edit-icon-url').value.trim();
        const bgimage = document.getElementById('edit-icon-image').value.trim();
        
        if (!name) {
            alert('请输入图标名称');
            return;
        }
        
        try {
            // TODO: 调用 API 保存
            console.log('💾 保存图标:', { 
                uuid: this.currentItem.uuid,
                name,
                target,
                bgimage
            });
            
            // 模拟保存成功
            await new Promise(resolve => setTimeout(resolve, 500));
            
            alert('保存成功！请刷新页面查看效果');
            this.close();
        } catch (error) {
            console.error('❌ 保存失败:', error);
            alert('保存失败: ' + error.message);
        }
    }
}

export default new IconEditorHandler();
