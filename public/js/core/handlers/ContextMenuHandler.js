// ==================== 右键菜单处理器 ====================

import ConfirmModal from '../../components/ConfirmModal.js';
import ToastNotification from '../../utils/ToastNotification.js';

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

        // 判断是图标还是 widget
        const isWidget = gridItem.dataset.type === 'widget';
        const itemId = isWidget ? gridItem.dataset.uuid : gridItem.dataset.itemId;

        if (isWidget) {
            // Widget 的右键菜单
            this.showWidgetMenu(e, gridItem);
        } else {
            // 图标的右键菜单
            const layout = this.getItemLayout(itemId);

            const menuItems = [
                {
                    label: '编辑图标',
                    action: () => this.editItem(gridItem)
                },
                {
                    label: '设置大小',
                    action: () => this.showSizeSelector(gridItem, itemId),
                    hasSubmenu: true
                },
                {
                    label: '添加到 Dock',
                    action: () => this.addToDock(itemId)
                },
                {
                    label: '删除',
                    action: () => this.deleteItem(itemId),
                    className: 'danger'
                }
            ];

            this.renderMenu(menuItems, e.clientX, e.clientY);
        }
    }

    /**
     * 显示 Widget 右键菜单
     */
    showWidgetMenu(e, gridItem) {
        const widgetUuid = gridItem.dataset.uuid;
        const currentSize = gridItem.dataset.size || '2x2';

        const menuItems = [
            {
                label: '设置大小',
                action: () => this.showSizeSelector(gridItem, widgetUuid),
                hasSubmenu: true
            },
            {
                label: '删除',
                action: () => this.deleteWidget(widgetUuid),
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

        // 智能边界检测：确保菜单不超出视口
        setTimeout(() => {
            const rect = this.menu.getBoundingClientRect();
            const menuWidth = rect.width;
            const menuHeight = rect.height;
            const padding = 10; // 边距

            let finalX = x;
            let finalY = y;

            // 水平方向检测
            if (x + menuWidth > window.innerWidth - padding) {
                // 右侧超出，显示在鼠标左侧
                finalX = x - menuWidth;
            }
            if (finalX < padding) {
                // 左侧超出，贴左边显示
                finalX = padding;
            }

            // 垂直方向检测
            if (y + menuHeight > window.innerHeight - padding) {
                // 底部超出，显示在鼠标上方
                finalY = y - menuHeight;
            }
            if (finalY < padding) {
                // 顶部超出，贴顶边显示
                finalY = padding;
            }

            this.menu.style.left = finalX + 'px';
            this.menu.style.top = finalY + 'px';
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
    showSizeSelector(gridItem, itemId) {
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
            action: () => this.changeSize(itemId, size)
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

        // 智能边界检测：确保子菜单不超出视口
        setTimeout(() => {
            const rect = this.submenu.getBoundingClientRect();
            const mainRect = this.menu.getBoundingClientRect();
            const submenuWidth = rect.width;
            const submenuHeight = rect.height;
            const padding = 10; // 边距

            let finalX = x;
            let finalY = y;

            // 水平方向检测
            if (x + submenuWidth > window.innerWidth - padding) {
                // 右侧超出，显示在主菜单左侧
                finalX = mainRect.left - submenuWidth - 5;
            }
            if (finalX < padding) {
                // 左侧超出，贴左边显示
                finalX = padding;
            }

            // 垂直方向检测
            if (y + submenuHeight > window.innerHeight - padding) {
                // 底部超出，向上调整
                finalY = window.innerHeight - submenuHeight - padding;
            }
            if (finalY < padding) {
                // 顶部超出，贴顶边显示
                finalY = padding;
            }

            this.submenu.style.left = finalX + 'px';
            this.submenu.style.top = finalY + 'px';
        }, 0);
    }

    /**
     * 更改图标/widget 尺寸
     */
    async changeSize(itemId, size) {
        const [width, height] = size.split('x').map(Number);

        // 判断是图标还是 widget
        const gridItem = document.querySelector(`[data-item-id="${itemId}"]`) ||
            document.querySelector(`[data-uuid="${itemId}"]`);

        if (!gridItem) {
            ToastNotification.error('未找到元素');
            return;
        }

        const isWidget = gridItem.dataset.type === 'widget';

        try {
            if (isWidget) {
                // Widget 只需更新 UI 和 dataset
                gridItem.className = `grid-item widget-item widget-${size}`;
                gridItem.dataset.size = size;

                ToastNotification.success(`小组件尺寸已更改为 ${size}`);
            } else {
                // 图标需要调用 API 更新数据库
                const layout = this.getItemLayout(itemId);
                if (!layout || !layout.category_id) {
                    ToastNotification.error('无法获取图标布局信息');
                    return;
                }

                const { updateItemLayout } = await import('../api-client.js');
                await updateItemLayout({
                    item_id: itemId,
                    category_id: layout.category_id,
                    width: width,
                    height: height
                });

                // 更新 UI
                gridItem.className = `grid-item size-${size}`;

                // 同步更新 CategoryManager 缓存
                if (window.categoryManager && window.categoryManager.layouts[itemId]) {
                    window.categoryManager.layouts[itemId].width = width;
                    window.categoryManager.layouts[itemId].height = height;
                }

                ToastNotification.success(`图标尺寸已更改为 ${size}`);
            }
        } catch (error) {
            ToastNotification.error('更新尺寸失败: ' + error.message);
        }
    }

    /**
     * 编辑图标
     */
    async editItem(gridItem) {
        const itemId = gridItem.dataset.itemId;

        // 从 CategoryManager 获取完整的图标数据
        const categoryManagerModule = await import('../../managers/CategoryManager.js');
        const categoryManager = categoryManagerModule.default;

        // 查找图标所属的分类
        let iconData = null;
        const categories = categoryManager.getCategories();

        for (const category of categories) {
            const items = categoryManager.getItems(category.id);
            const item = items.find(i => i.id === itemId);
            if (item) {
                iconData = {
                    uuid: item.id,
                    name: item.title,
                    target: item.link_url,
                    bgimage: item.icon_path || '',
                    category_id: category.id
                };
                break;
            }
        }

        // 如果没找到，使用 DOM 中的数据作为后备
        if (!iconData) {
            iconData = {
                uuid: itemId,
                name: gridItem.querySelector('.nav-icon-title')?.textContent || '',
                target: gridItem.dataset.url || '',
                bgimage: ''
            };
        }

        try {
            const iconEditor = await import('./IconEditorHandler.js');
            iconEditor.default.open(iconData);
        } catch (error) {
            console.error('打开编辑器失败:', error);
        }
    }

    /**
     * 添加到 Dock
     */
    async addToDock(itemId) {
        try {
            const dockRenderer = await import('../renderers/DockRenderer.js');
            await dockRenderer.default.addItem(itemId);
            ToastNotification.success('已添加到 Dock');
        } catch (error) {
            if (error.message.includes('已在 Dock 中')) {
                ToastNotification.warning('该图标已在 Dock 中');
            } else {
                ToastNotification.error('添加失败: ' + error.message);
            }
        }
    }

    /**
     * 删除图标
     */
    async deleteItem(itemId) {
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

        try {
            const { deleteItem } = await import('../api-client.js');
            await deleteItem(itemId);

            // 从 DOM 中移除
            const gridItem = document.querySelector(`[data-item-id="${itemId}"]`);
            if (gridItem) {
                gridItem.remove();
            }

            ToastNotification.success('图标已删除');
        } catch (error) {
            ToastNotification.error('删除失败: ' + error.message);
        }
    }

    /**
     * 删除 Widget
     */
    async deleteWidget(widgetUuid) {
        const confirmed = await ConfirmModal.show({
            title: '删除小组件',
            message: '确定要删除这个小组件吗？',
            confirmText: '删除',
            cancelText: '取消',
            type: 'danger'
        });

        if (!confirmed) {
            return;
        }

        try {
            // 销毁 widget 实例
            if (window.widgetManager) {
                window.widgetManager.destroy(widgetUuid);
            }

            // 从 DOM 中移除
            const gridItem = document.querySelector(`[data-uuid="${widgetUuid}"]`);
            if (gridItem) {
                gridItem.remove();
            }

            ToastNotification.success('小组件已删除');
        } catch (error) {
            ToastNotification.error('删除失败: ' + error.message);
        }
    }

    /**
     * 添加图标
     */
    async addIcon(categoryId) {
        try {
            const addIconDialog = await import('../dialogs/AddIconDialog.js');
            addIconDialog.default.open(categoryId);
        } catch (error) {
        }
    }

    /**
     * 添加小组件
     */
    async addWidget(categoryId) {
        try {
            const addWidgetDialog = await import('../dialogs/AddWidgetDialog.js');
            addWidgetDialog.default.open(categoryId);
        } catch (error) {
            ToastNotification.error('打开对话框失败');
        }
    }

    /**
     * 获取图标布局信息
     */
    getItemLayout(itemId) {
        // 优先从 CategoryManager 获取布局信息
        if (window.categoryManager) {
            const layout = window.categoryManager.getLayout(itemId);
            if (layout) {
                return layout; // 包含 { pos_x, pos_y, width, height, sort_order, category_id }
            }
        }

        // 降级方案：从 DOM 中获取当前尺寸
        const gridItem = document.querySelector(`[data-item-id="${itemId}"]`);
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
        const itemId = dockItem.dataset.itemId;

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
                        navigator.clipboard.writeText(url);
                    }
                }
            },
            {
                label: '从 Dock 移除',
                action: () => this.removeFromDock(itemId),
            },
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
    async removeFromDock(itemId) {
        try {
            const { removeFromDock } = await import('../api-client.js');
            await removeFromDock(itemId);

            // 从 DOM 中移除
            const dockItem = document.querySelector(`.dock-item[data-item-id="${itemId}"]`);
            if (dockItem) {
                dockItem.remove();
            }
        } catch (error) {
            ToastNotification.error('移除失败: ' + error.message);
        }
    }
}

export default new ContextMenuHandler();
