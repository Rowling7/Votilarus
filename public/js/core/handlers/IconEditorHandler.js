// ==================== 图标编辑对话框处理器 ====================

import ToastNotification from '../../utils/ToastNotification.js';

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
                    <label for="edit-icon-category">所属分类</label>
                    <select id="edit-icon-category"></select>
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
     * 加载分类列表
     */
    async loadCategories() {
        try {
            const { fetchCategories } = await import('../api-client.js');
            const categories = await fetchCategories();

            const categorySelect = document.getElementById('edit-icon-category');
            if (!categorySelect) return;

            // 清空现有选项
            categorySelect.innerHTML = '';

            // 添加选项
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.category_name; // 使用 category_name 字段
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error('加载分类列表失败:', error);
            ToastNotification.error('加载分类列表失败');
        }
    }

    /**
     * 打开编辑器
     */
    async open(itemData) {
        this.currentItem = itemData;

        // 加载分类列表
        await this.loadCategories();

        // 填充表单
        document.getElementById('edit-icon-name').value = itemData.name || '';
        document.getElementById('edit-icon-url').value = itemData.target || '';
        document.getElementById('edit-icon-image').value = itemData.bgimage || '';

        // 设置当前分类
        const categorySelect = document.getElementById('edit-icon-category');
        if (categorySelect && itemData.category_id !== undefined) {
            categorySelect.value = itemData.category_id;
        }

        // 更新预览
        this.updatePreview();

        // 显示对话框
        this.overlay.classList.add('active');
        this.dialog.classList.add('active');
    }

    /**
     * 关闭编辑器
     */
    close() {
        this.overlay.classList.remove('active');
        this.dialog.classList.remove('active');
        this.currentItem = null;
    }

    /**
     * 更新预览
     */
    updatePreview() {
        const name = document.getElementById('edit-icon-name').value || '图标名称';
        let imageUrl = document.getElementById('edit-icon-image').value;

        const previewIcon = document.getElementById('preview-icon');
        const previewName = document.getElementById('preview-name');

        previewName.textContent = name;

        if (imageUrl) {
            // 将 Windows 路径分隔符 \ 转换为 URL 友好的 /
            let formattedUrl = imageUrl.replace(/\\/g, '/');
            // 如果路径不是完整URL且不以 static/ 开头，则添加 static/ico/ 前缀
            if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://') && !formattedUrl.startsWith('data:') && !formattedUrl.startsWith('static/')) {
                formattedUrl = 'static/ico/' + formattedUrl;
            }
            // 如果路径不是以 / 开头，添加 /
            const finalUrl = formattedUrl.startsWith('/') ? formattedUrl : `/${formattedUrl}`;
            previewIcon.style.backgroundImage = `url(${finalUrl})`;
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
        let bgimage = document.getElementById('edit-icon-image').value.trim();
        const categoryId = document.getElementById('edit-icon-category').value;

        console.log('=== 开始保存图标 ===');
        console.log('当前图标数据:', this.currentItem);
        console.log('新名称:', name);
        console.log('新链接:', target);
        console.log('新背景图:', bgimage);
        console.log('新分类 ID:', categoryId);

        if (!name) {
            ToastNotification.warning('请输入图标名称');
            return;
        }

        // 如果提供了图片路径且不是完整URL，则添加 static/ico/ 前缀
        if (bgimage && !bgimage.startsWith('http://') && !bgimage.startsWith('https://') && !bgimage.startsWith('data:')) {
            // 将 Windows 路径分隔符 \ 转换为 /
            bgimage = bgimage.replace(/\\/g, '/');
            // 如果路径不以 static/ 开头，则添加 static/ico/ 前缀
            if (!bgimage.startsWith('static/')) {
                bgimage = 'static/ico/' + bgimage;
            }
        }

        try {
            const { updateItem } = await import('../api-client.js');

            console.log('调用 API 更新数据库...');
            await updateItem(this.currentItem.uuid, {
                name,
                target,
                bgimage,
                category_id: parseInt(categoryId)
            });
            console.log('数据库更新成功');

            // 检查分类是否改变
            const categoryChanged = parseInt(categoryId) !== this.currentItem.category_id;

            // 直接更新 DOM 中的图标元素
            console.log('开始更新 DOM...');
            this.updateIconInDOM(name, target, bgimage);
            console.log('DOM 更新完成');

            // 如果分类改变了，需要刷新页面以重新渲染
            if (categoryChanged) {
                ToastNotification.success('保存成功！分类已更改，页面将在2秒后自动刷新...', 'success', 2000);
                setTimeout(() => {
                    location.reload();
                }, 2000);
            } else {
                ToastNotification.success('保存成功！');
            }

            this.close();
            console.log('=== 图标保存完成 ===\n');
        } catch (error) {
            console.error('保存失败:', error);
            ToastNotification.error('保存失败: ' + error.message);
        }
    }

    /**
     * 直接更新 DOM 中的图标元素
     */
    updateIconInDOM(name, target, bgimage) {
        console.log('[updateIconInDOM] 查找图标元素, UUID:', this.currentItem.uuid);

        // 找到对应的 grid-item 元素（注意：是 .grid-item 而不是 nav-icon）
        const gridItem = document.querySelector(`.grid-item[data-item-id="${this.currentItem.uuid}"]`);
        if (!gridItem) {
            console.warn('[updateIconInDOM] 未找到对应的图标元素!');
            console.log('[updateIconInDOM] 尝试查找所有 grid-item 元素:');
            const allItems = document.querySelectorAll('.grid-item');
            console.log('[updateIconInDOM] 找到的 grid-item 数量:', allItems.length);
            allItems.forEach((item, index) => {
                console.log(`[updateIconInDOM]   [${index}] UUID:`, item.dataset.itemId);
            });
            return;
        }
        console.log('[updateIconInDOM] 找到图标元素:', gridItem);

        // 获取 nav-icon 元素
        const iconElement = gridItem.querySelector('.nav-icon');
        if (!iconElement) {
            console.warn('[updateIconInDOM] 未找到 .nav-icon 元素');
            return;
        }

        // 更新标题
        const titleElement = gridItem.querySelector('.nav-icon-title');
        if (titleElement) {
            console.log('[updateIconInDOM] 更新标题:', titleElement.textContent, '->', name);
            titleElement.textContent = name;
            titleElement.title = name; // 同时更新 tooltip
        } else {
            console.warn('[updateIconInDOM] 未找到标题元素 .nav-icon-title');
        }

        // 更新背景图片或首字母
        const bgElement = iconElement.querySelector('.nav-icon-bg');
        const letterElement = iconElement.querySelector('.nav-icon-letter');

        if (bgimage) {
            console.log('[updateIconInDOM] 设置背景图:', bgimage);
            // 将 Windows 路径分隔符 \ 转换为 URL 友好的 /
            let imageUrl = bgimage.replace(/\\/g, '/');
            // 如果路径不是完整URL且不以 static/ 开头，则添加 static/ico/ 前缀
            if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:') && !imageUrl.startsWith('static/')) {
                imageUrl = 'static/ico/' + imageUrl;
            }

            if (bgElement) {
                bgElement.style.backgroundImage = `url(${imageUrl})`;
                bgElement.style.display = 'block';
                console.log('[updateIconInDOM] 背景图元素已更新');
            } else {
                console.warn('[updateIconInDOM] 未找到背景图元素 .nav-icon-bg，需要创建');
                // 如果不存在背景图元素，需要创建
                const newBgDiv = document.createElement('div');
                newBgDiv.className = 'nav-icon-bg';
                newBgDiv.style.backgroundImage = `url(${imageUrl})`;
                newBgDiv.style.display = 'block';
                iconElement.insertBefore(newBgDiv, iconElement.firstChild);
                console.log('[updateIconInDOM] 已创建新的背景图元素');
            }

            // 隐藏首字母
            if (letterElement) {
                console.log('[updateIconInDOM] 隐藏首字母元素');
                letterElement.style.display = 'none';
            }
        } else {
            console.log('[updateIconInDOM] 无背景图，显示首字母');
            // 显示首字母
            if (letterElement) {
                const firstLetter = name.charAt(0).toUpperCase();
                console.log('[updateIconInDOM] 设置首字母:', firstLetter);
                letterElement.textContent = firstLetter;
                letterElement.style.display = 'flex';
            } else {
                console.warn('[updateIconInDOM] 未找到首字母元素 .nav-icon-letter，需要创建');
                // 如果不存在首字母元素，需要创建
                const newLetterDiv = document.createElement('div');
                newLetterDiv.className = 'nav-icon-letter';
                const firstLetter = name.charAt(0).toUpperCase();
                newLetterDiv.textContent = firstLetter;
                newLetterDiv.style.display = 'flex';
                iconElement.appendChild(newLetterDiv);
                console.log('[updateIconInDOM] 已创建新的首字母元素');
            }

            if (bgElement) {
                console.log('[updateIconInDOM] 隐藏背景图元素');
                bgElement.style.display = 'none';
            }
        }

        // 更新 data 属性
        console.log('[updateIconInDOM] 更新 data-url:', gridItem.dataset.url, '->', target);
        gridItem.dataset.url = target;
        console.log('[updateIconInDOM] 更新 tooltip:', gridItem.dataset.tooltip, '->', name);
        gridItem.dataset.tooltip = name;

        console.log('[updateIconInDOM] 所有更新完成');
    }
}

export default new IconEditorHandler();
