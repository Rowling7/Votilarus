// ==================== 右键菜单处理器 ====================

import ConfirmModal from '../components/confirm-modal.js';
import toast from '../utils/toast.js';

class ContextMenuHandler {
    constructor() {
        this.menu = null;
        this.submenu = null; // 子菜单
        this.targetElement = null;
    }

    /**
     * 初始化右键菜单
     */
    init() {
        // 创建右键菜单 DOM
        this.createMenuElement();

        // 监听右键事件（整个页面）
        document.addEventListener('contextmenu', (e) => {
            const gridItem = e.target.closest('.grid-item');
            const gridContainer = e.target.closest('.grid-container');
            const dockItem = e.target.closest('.dock-item');
            const sidebar = e.target.closest('.sidebar');
            const searchBox = e.target.closest('.search-container');

            if (gridItem) {
                // 图标上的右键
                e.preventDefault();
                this.showItemMenu(e, gridItem);
            } else if (dockItem) {
                // Dock 图标上的右键
                e.preventDefault();
                this.showDockItemMenu(e, dockItem);
            } else if (gridContainer) {
                // 网格空白区域的右键
                e.preventDefault();
                this.showEmptyMenu(e, gridContainer);
            } else if (sidebar) {
                // 侧栏区域的右键
                e.preventDefault();
                this.showSidebarMenu(e);
            } else if (searchBox) {
                // 搜索框区域的右键
                e.preventDefault();
                this.showSearchMenu(e);
            } else {
                // 页面其他空白区域的右键
                e.preventDefault();
                this.showPageMenu(e);
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
        
        // 创建子菜单
        this.submenu = document.createElement('div');
        this.submenu.className = 'context-menu submenu';
        this.submenu.style.display = 'none';
        document.body.appendChild(this.submenu);
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
                label: '设置大小 ',
                action: () => this.showSizeSelector(gridItem, itemUuid),
                hasSubmenu: true
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
            
            // 如果有子菜单标记，添加样式
            if (item.hasSubmenu) {
                menuItem.classList.add('has-submenu');
            }
            
            menuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // 如果有子菜单，不隐藏主菜单
                if (item.hasSubmenu) {
                    item.action();
                } else {
                    item.action();
                    this.hideMenu();
                }
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
        this.hideAllMenus();
    }

    /**
     * 隐藏所有菜单
     */
    hideAllMenus() {
        if (this.menu) {
            this.menu.style.display = 'none';
        }
        if (this.submenu) {
            this.submenu.style.display = 'none';
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

        // 优先从 DOM 获取当前实际尺寸（确保实时更新）
        let currentSize = '1x1';
        const className = gridItem.className;
        const match = className.match(/size-(\d+)x(\d+)/);
        if (match) {
            currentSize = `${match[1]}x${match[2]}`;
        }

        const menuItems = sizes.map(size => ({
            label: size === currentSize ? `✓ ${size}` : size,
            action: () => this.changeSize(itemUuid, size)
        }));

        // 获取主菜单位置，在它右侧显示子菜单
        const rect = this.menu.getBoundingClientRect();
        this.renderSubmenu(menuItems, rect.right + 5, rect.top);
    }

    /**
     * 渲染子菜单
     */
    renderSubmenu(items, x, y) {
        this.submenu.innerHTML = '';

        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = `context-menu-item ${item.className || ''}`;
            menuItem.textContent = item.label;
            
            menuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                item.action();
                this.hideAllMenus();
            });

            this.submenu.appendChild(menuItem);
        });

        // 定位子菜单
        this.submenu.style.display = 'block';
        this.submenu.style.left = x + 'px';
        this.submenu.style.top = y + 'px';

        // 确保子菜单不超出视口
        setTimeout(() => {
            const rect = this.submenu.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                // 如果右侧超出，显示在主菜单左侧
                const mainRect = this.menu.getBoundingClientRect();
                this.submenu.style.left = (mainRect.left - rect.width - 5) + 'px';
            }
            if (rect.bottom > window.innerHeight) {
                this.submenu.style.top = (y - rect.height) + 'px';
            }
        }, 0);
    }

    /**
     * 更改图标尺寸
     */
    async changeSize(itemUuid, size) {
        console.log(`📐 更改图标 ${itemUuid} 尺寸为 ${size}`);
        
        const [width, height] = size.split('x').map(Number);
        
        // 从 CategoryManager 获取布局信息（包含 category_id）
        const layout = this.getItemLayout(itemUuid);
        if (!layout || !layout.category_id) {
            toast.error('无法获取图标布局信息');
            return;
        }
        
        try {
            // 调用 API 更新数据库
            const { updateItemLayout } = await import('./api.js');
            await updateItemLayout({
                item_uuid: itemUuid,
                category_id: layout.category_id,
                width: width,
                height: height
            });
            console.log('✅ 布局尺寸已更新到数据库');
            
            // 更新 UI
            const gridItem = document.querySelector(`[data-item-uuid="${itemUuid}"]`);
            if (gridItem) {
                gridItem.className = `grid-item size-${size}`;
                
                // 同步更新 CategoryManager 缓存
                if (window.categoryManager && window.categoryManager.layouts[itemUuid]) {
                    window.categoryManager.layouts[itemUuid].width = width;
                    window.categoryManager.layouts[itemUuid].height = height;
                    console.log('✅ CategoryManager 缓存已更新');
                }
                
                toast.success(`图标尺寸已更改为 ${size}`);
            }
        } catch (error) {
            console.error('❌ 更新尺寸失败:', error);
            toast.error('更新尺寸失败: ' + error.message);
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
            toast.success('已添加到 Dock');
        } catch (error) {
            console.error('❌ 添加到 Dock 失败:', error);
            if (error.message.includes('已在 Dock 中')) {
                toast.warning('该图标已在 Dock 中');
            } else {
                toast.error('添加失败: ' + error.message);
            }
        }
    }

    /**
     * 删除图标
     */
    async deleteItem(itemUuid) {
        const confirmed = await ConfirmModal.show({
            title: '删除图标',
            message: '确定要删除这个图标吗？',
            confirmText: '删除',
            cancelText: '取消',
            type: 'danger'
        });
        
        if (!confirmed) {
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
                
            toast.success('图标已删除');
        } catch (error) {
            console.error('❌ 删除失败:', error);
            toast.error('删除失败: ' + error.message);
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
    async addWidget(categoryId) {
        console.log(`🧩 添加小组件到分类: ${categoryId}`);
        
        try {
            const addWidgetDialog = await import('./add-widget-dialog.js');
            addWidgetDialog.default.open(categoryId);
        } catch (error) {
            console.error('❌ 打开添加小组件对话框失败:', error);
            toast.error('打开对话框失败');
        }
    }

    /**
     * 获取图标布局信息
     */
    getItemLayout(itemUuid) {
        // 优先从 CategoryManager 获取布局信息
        if (window.categoryManager) {
            const layout = window.categoryManager.getLayout(itemUuid);
            if (layout) {
                return layout; // 包含 { pos_x, pos_y, width, height, sort_order, category_id }
            }
        }
        
        // 降级方案：从 DOM 中获取当前尺寸
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

    /**
     * 显示 Dock 图标右键菜单
     */
    showDockItemMenu(e, dockItem) {
        const itemUuid = dockItem.dataset.itemUuid;

        const menuItems = [
            {
                label: '打开链接',
                action: () => {
                    const url = dockItem.dataset.url;
                    if (url) window.open(url, '_blank');
                }
            },
            {
                label: '复制链接',
                action: () => {
                    const url = dockItem.dataset.url;
                    if (url) {
                        navigator.clipboard.writeText(url).then(() => {
                            console.log('✅ 链接已复制');
                        });
                    }
                }
            },
            {
                label: '从 Dock 移除',
                action: () => this.removeFromDock(itemUuid),
                className: 'danger'
            }
        ];

        this.renderMenu(menuItems, e.clientX, e.clientY);
    }

    /**
     * 显示侧栏右键菜单
     */
    showSidebarMenu(e) {
        const menuItems = [
            {
                label: '刷新页面',
                action: () => location.reload()
            },
            {
                label: '打开设置',
                action: () => {
                    const avatar = document.getElementById('avatar');
                    if (avatar) avatar.click();
                }
            }
        ];

        this.renderMenu(menuItems, e.clientX, e.clientY);
    }

    /**
     * 显示搜索框右键菜单
     */
    showSearchMenu(e) {
        const menuItems = [
            {
                label: '清空搜索',
                action: () => {
                    const searchBox = document.getElementById('searchBox');
                    if (searchBox) searchBox.value = '';
                }
            },
            {
                label: '刷新页面',
                action: () => location.reload()
            }
        ];

        this.renderMenu(menuItems, e.clientX, e.clientY);
    }

    /**
     * 显示页面空白区域右键菜单
     */
    showPageMenu(e) {
        const menuItems = [
            {
                label: '刷新页面',
                action: () => location.reload()
            },
            {
                label: '打开设置',
                action: () => {
                    const avatar = document.getElementById('avatar');
                    if (avatar) avatar.click();
                }
            },
            {
                label: '返回顶部',
                action: () => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        ];

        this.renderMenu(menuItems, e.clientX, e.clientY);
    }

    /**
     * 从 Dock 移除图标
     */
    async removeFromDock(itemUuid) {
        try {
            const { removeFromDock } = await import('./api.js');
            await removeFromDock(itemUuid);
            console.log('✅ 已从 Dock 移除');
            
            // 从 DOM 中移除
            const dockItem = document.querySelector(`.dock-item[data-item-uuid="${itemUuid}"]`);
            if (dockItem) {
                dockItem.remove();
            }
        } catch (error) {
            console.error('❌ 从 Dock 移除失败:', error);
            toast.error('移除失败: ' + error.message);
        }
    }
}

export default new ContextMenuHandler();
