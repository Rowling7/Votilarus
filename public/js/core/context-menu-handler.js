// ==================== 右键菜单处理器 ====================

class ContextMenuHandler {
    constructor() {
        this.menu = null;
        this.targetElement = null;
    }

    /**
     * 初始化右键菜单
     */
    init() {
        // 创建右键菜单 DOM
        this.createMenuElement();

        // 监听右键事件
        document.addEventListener('contextmenu', (e) => {
            const gridItem = e.target.closest('.grid-item');
            const gridContainer = e.target.closest('.grid-container');

            if (gridItem) {
                // 图标上的右键
                e.preventDefault();
                this.showItemMenu(e, gridItem);
            } else if (gridContainer) {
                // 空白区域的右键
                e.preventDefault();
                this.showEmptyMenu(e, gridContainer);
            } else {
                // 其他区域隐藏菜单
                this.hideMenu();
            }
        });

        // 点击其他地方隐藏菜单
        document.addEventListener('click', () => {
            this.hideMenu();
        });

        // 按 ESC 键隐藏菜单
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideMenu();
            }
        });

        console.log(' 右键菜单已初始化');
    }

    /**
     * 创建菜单 DOM 元素
     */
    createMenuElement() {
        this.menu = document.createElement('div');
        this.menu.className = 'context-menu';
        this.menu.style.display = 'none';
        document.body.appendChild(this.menu);
    }

    /**
     * 显示图标右键菜单
     */
    showItemMenu(e, gridItem) {
        this.targetElement = gridItem;
        const itemUuid = gridItem.dataset.itemUuid;
        const layout = this.getItemLayout(itemUuid);

        const menuItems = [
            {
                label: '编辑图标',
                action: () => this.editItem(gridItem)
            },
            {
                label: '设置大小',
                action: () => this.showSizeSelector(gridItem, itemUuid)
            },
            {
                label: '添加到 Dock',
                action: () => this.addToDock(itemUuid)
            },
            {
                label: '删除',
                action: () => this.deleteItem(itemUuid),
                className: 'danger'
            }
        ];

        this.renderMenu(menuItems, e.clientX, e.clientY);
    }

    /**
     * 显示空白区域右键菜单
     */
    showEmptyMenu(e, gridContainer) {
        this.targetElement = gridContainer;
        const categoryId = gridContainer.closest('.category-panel').dataset.categoryId;

        const menuItems = [
            {
                label: '添加图标',
                action: () => this.addIcon(categoryId)
            },
            {
                label: '添加小组件',
                action: () => this.addWidget(categoryId)
            },
            {
                label: '刷新',
                action: () => location.reload()
            }
        ];

        this.renderMenu(menuItems, e.clientX, e.clientY);
    }

    /**
     * 渲染菜单
     */
    renderMenu(items, x, y) {
        this.menu.innerHTML = '';

        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = `context-menu-item ${item.className || ''}`;
            menuItem.textContent = item.label;
            
            menuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                item.action();
                this.hideMenu();
            });

            this.menu.appendChild(menuItem);
        });

        // 定位菜单
        this.menu.style.display = 'block';
        this.menu.style.left = x + 'px';
        this.menu.style.top = y + 'px';

        // 确保菜单不超出视口
        setTimeout(() => {
            const rect = this.menu.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                this.menu.style.left = (x - rect.width) + 'px';
            }
            if (rect.bottom > window.innerHeight) {
                this.menu.style.top = (y - rect.height) + 'px';
            }
        }, 0);
    }

    /**
     * 隐藏菜单
     */
    hideMenu() {
        if (this.menu) {
            this.menu.style.display = 'none';
        }
        this.targetElement = null;
    }

    /**
     * 显示尺寸选择器（子菜单）
     */
    showSizeSelector(gridItem, itemUuid) {
        const sizes = [
            '1x1', '1x2', '1x3', '1x4',
            '2x1', '2x2', '2x3', '2x4'
        ];

        const menuItems = sizes.map(size => ({
            label: size,
            action: () => this.changeSize(itemUuid, size)
        }));

        // 获取当前鼠标位置
        const rect = this.menu.getBoundingClientRect();
        this.renderMenu(menuItems, rect.right, rect.top);
    }

    /**
     * 更改图标尺寸
     */
    async changeSize(itemUuid, size) {
        console.log(`📐 更改图标 ${itemUuid} 尺寸为 ${size}`);
        
        const [width, height] = size.split('x').map(Number);
        
        // TODO: 调用 API 更新数据库
        console.log(' 待实现：更新布局尺寸到数据库');
        
        // 暂时只更新 UI
        const gridItem = document.querySelector(`[data-item-uuid="${itemUuid}"]`);
        if (gridItem) {
            gridItem.className = `grid-item size-${size}`;
        }
    }

    /**
     * 编辑图标
     */
    async editItem(gridItem) {
        const itemUuid = gridItem.dataset.itemUuid;
        
        // 获取图标数据
        const iconData = {
            uuid: itemUuid,
            name: gridItem.querySelector('.nav-icon-title')?.textContent || '',
            target: gridItem.dataset.url || '',
            bgimage: '' // TODO: 从数据库获取
        };
        
        try {
            const iconEditor = await import('./icon-editor-handler.js');
            iconEditor.default.open(iconData);
        } catch (error) {
            console.error('❌ 打开编辑器失败:', error);
        }
    }

    /**
     * 添加到 Dock
     */
    async addToDock(itemUuid) {
        try {
            const dockRenderer = await import('./dock-renderer.js');
            await dockRenderer.default.addItem(itemUuid);
            alert('已添加到 Dock');
        } catch (error) {
            console.error('❌ 添加到 Dock 失败:', error);
            if (error.message.includes('已在 Dock 中')) {
                alert('该图标已在 Dock 中');
            } else {
                alert('添加失败: ' + error.message);
            }
        }
    }

    /**
     * 删除图标
     */
    async deleteItem(itemUuid) {
        if (!confirm('确定要删除这个图标吗？')) {
            return;
        }
    
        console.log(`🗑️ 删除图标: ${itemUuid}`);
            
        try {
            const { deleteItem } = await import('./api.js');
            await deleteItem(itemUuid);
            console.log('✅ 图标已删除');
                
            // 从 DOM 中移除
            const gridItem = document.querySelector(`[data-item-uuid="${itemUuid}"]`);
            if (gridItem) {
                gridItem.remove();
            }
                
            alert('图标已删除');
        } catch (error) {
            console.error('❌ 删除失败:', error);
            alert('删除失败: ' + error.message);
        }
    }

    /**
     * 添加图标
     */
    async addIcon(categoryId) {
        try {
            const addIconDialog = await import('./add-icon-dialog.js');
            addIconDialog.default.open(categoryId);
        } catch (error) {
            console.error('❌ 打开添加图标对话框失败:', error);
        }
    }

    /**
     * 添加小组件
     */
    addWidget(categoryId) {
        console.log(` 添加小组件到分类: ${categoryId}`);
        console.log(' 待实现：添加小组件对话框');
    }

    /**
     * 获取图标布局信息
     */
    getItemLayout(itemUuid) {
        // 从 DOM 中获取当前尺寸
        const gridItem = document.querySelector(`[data-item-uuid="${itemUuid}"]`);
        if (!gridItem) return { width: 1, height: 1 };

        const className = gridItem.className;
        const match = className.match(/size-(\d+)x(\d+)/);
        if (match) {
            return {
                width: parseInt(match[1]),
                height: parseInt(match[2])
            };
        }
        return { width: 1, height: 1 };
    }
}

export default new ContextMenuHandler();
