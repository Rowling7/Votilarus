// ==================== Dock 栏渲染器 ====================

import { fetchDockItems, removeFromDock } from '../core/api.js';

class DockRenderer {
    constructor() {
        this.dockContainer = null;
        this.dockItems = [];
        this.maxItems = 10;
    }

    /**
     * 初始化 Dock 栏
     */
    async init() {
        // 创建 Dock DOM
        this.createDockElement();
        
        // 加载 Dock 数据
        await this.loadDockItems();
        
        console.log('✅ Dock 栏已初始化');
    }

    /**
     * 创建 Dock DOM 结构
     */
    createDockElement() {
        this.dockContainer = document.createElement('div');
        this.dockContainer.className = 'dock-container';
        this.dockContainer.id = 'dock';
        
        // 添加到页面
        document.body.appendChild(this.dockContainer);
    }

    /**
     * 加载 Dock 项
     */
    async loadDockItems() {
        try {
            this.dockItems = await fetchDockItems();
            this.render();
        } catch (error) {
            console.error('❌ 加载 Dock 项失败:', error);
        }
    }

    /**
     * 渲染 Dock 栏
     */
    render() {
        this.dockContainer.innerHTML = '';
        
        if (this.dockItems.length === 0) {
            this.dockContainer.style.display = 'none';
            return;
        }
        
        this.dockContainer.style.display = 'flex';
        
        // 限制最大数量
        const itemsToShow = this.dockItems.slice(0, this.maxItems);
        
        itemsToShow.forEach(item => {
            const dockItem = this.createDockItem(item);
            this.dockContainer.appendChild(dockItem);
        });
    }

    /**
     * 创建单个 Dock 项
     */
    createDockItem(item) {
        const dockItem = document.createElement('div');
        dockItem.className = 'dock-item';
        dockItem.dataset.itemUuid = item.item_uuid;
        dockItem.title = item.name;
        
        // 图标
        const icon = document.createElement('div');
        icon.className = 'dock-item-icon';
        
        if (item.bgimage) {
            icon.style.backgroundImage = `url(${item.bgimage})`;
        } else {
            // 使用默认图标或首字母
            icon.textContent = item.name.charAt(0).toUpperCase();
        }
        
        dockItem.appendChild(icon);
        
        // 点击事件 - 打开链接
        dockItem.addEventListener('click', () => {
            if (item.target) {
                window.open(item.target, '_blank');
            }
        });
        
        // 右键菜单 - 从 Dock 移除
        dockItem.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showRemoveMenu(e, item);
        });
        
        // 启用拖拽
        dockItem.draggable = true;
        dockItem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.item_uuid);
            e.dataTransfer.effectAllowed = 'move';
            dockItem.classList.add('dragging');
        });
        
        dockItem.addEventListener('dragend', () => {
            dockItem.classList.remove('dragging');
        });
        
        return dockItem;
    }

    /**
     * 显示移除菜单
     */
    showRemoveMenu(event, item) {
        // 创建临时菜单
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;
        
        const removeItem = document.createElement('div');
        removeItem.className = 'context-menu-item danger';
        removeItem.textContent = '从 Dock 移除';
        
        removeItem.addEventListener('click', async () => {
            try {
                await removeFromDock(item.item_uuid);
                console.log('✅ 已从 Dock 移除:', item.name);
                
                // 重新加载
                await this.loadDockItems();
                
                // 隐藏菜单
                document.body.removeChild(menu);
            } catch (error) {
                console.error('❌ 移除失败:', error);
                alert('移除失败: ' + error.message);
            }
        });
        
        menu.appendChild(removeItem);
        document.body.appendChild(menu);
        
        // 点击其他地方关闭菜单
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                document.body.removeChild(menu);
                document.removeEventListener('click', closeMenu);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 0);
    }

    /**
     * 添加图标到 Dock
     */
    async addItem(itemUuid) {
        try {
            const { addToDock } = await import('../core/api.js');
            await addToDock(itemUuid);
            await this.loadDockItems();
            console.log('✅ 已添加到 Dock');
        } catch (error) {
            console.error('❌ 添加到 Dock 失败:', error);
            throw error;
        }
    }

    /**
     * 更新最大图标数量
     */
    setMaxItems(max) {
        this.maxItems = max;
        this.render();
    }
}

export default new DockRenderer();
