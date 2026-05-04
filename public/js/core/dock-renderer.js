// ==================== Dock 栏渲染器 ====================

import { fetchDockItems, reorderDock } from '../core/api.js';

class DockRenderer {
    constructor() {
        this.dockContainer = null;
        this.dockItems = [];
        this.maxItems = 10;
        this.fisheyeScale = 1.5; // 鱼眼放大倍数
        this.fisheyeRange = 2;   // 鱼眼影响范围
        this.fisheyeTimer = null; // 鱼眼效果定时器
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
        
        // 在 Dock 容器上监听 mouseleave（而不是在每个图标上）
        // 这样只有当鼠标完全离开 Dock 区域时才会重置效果
        this.dockContainer.addEventListener('mouseleave', () => {
            this.resetFisheyeEffect();
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
        
        // 启用拖拽
        dockItem.draggable = true;
        dockItem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.item_uuid);
            e.dataTransfer.effectAllowed = 'move';
            dockItem.classList.add('dragging');
            this.draggedDockItem = dockItem;
        });
        
        dockItem.addEventListener('dragend', () => {
            dockItem.classList.remove('dragging');
            this.draggedDockItem = null;
        });
        
        // 监听 Dock 内的拖拽排序
        dockItem.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (this.draggedDockItem && dockItem !== this.draggedDockItem) {
                this.handleDockDragOver(e, dockItem);
            }
        });
        
        dockItem.addEventListener('drop', (e) => {
            e.preventDefault();
            if (this.draggedDockItem && dockItem !== this.draggedDockItem) {
                this.handleDockDrop(dockItem);
            }
        });
        
        // 鱼眼效果 - 鼠标移动时放大（使用 requestAnimationFrame 优化）
        dockItem.addEventListener('mousemove', (e) => {
            if (this.fisheyeTimer) {
                cancelAnimationFrame(this.fisheyeTimer);
            }
            this.fisheyeTimer = requestAnimationFrame(() => {
                this.applyFisheyeEffect(dockItem);
            });
        });
        
        return dockItem;
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
    
    /**
     * 处理 Dock 拖拽经过
     */
    handleDockDragOver(e, targetItem) {
        const allItems = Array.from(this.dockContainer.querySelectorAll('.dock-item'));
        const draggedIndex = allItems.indexOf(this.draggedDockItem);
        const targetIndex = allItems.indexOf(targetItem);
        
        if (draggedIndex < targetIndex) {
            this.dockContainer.insertBefore(this.draggedDockItem, targetItem.nextSibling);
        } else {
            this.dockContainer.insertBefore(this.draggedDockItem, targetItem);
        }
    }
    
    /**
     * 处理 Dock 放置并保存排序
     */
    async handleDockDrop(targetItem) {
        try {
            const items = Array.from(this.dockContainer.querySelectorAll('.dock-item'));
            const reorderData = items.map((item, index) => ({
                item_uuid: item.dataset.itemUuid,
                sort_order: index
            }));
            
            await reorderDock(reorderData);
            console.log('✅ Dock 排序已保存');
        } catch (error) {
            console.error('❌ 保存 Dock 排序失败:', error);
        }
    }
    
    /**
     * 应用鱼眼效果
     */
    applyFisheyeEffect(hoveredItem) {
        const allItems = Array.from(this.dockContainer.querySelectorAll('.dock-item'));
        const hoveredIndex = allItems.indexOf(hoveredItem);
        
        if (hoveredIndex === -1) return;
        
        // 使用 DocumentFragment 批量更新 DOM
        allItems.forEach((item, index) => {
            const distance = Math.abs(index - hoveredIndex);
            
            if (distance <= this.fisheyeRange) {
                // 计算缩放比例：距离越近，放大越多
                const scale = 1 + (this.fisheyeScale - 1) * (1 - distance / (this.fisheyeRange + 1));
                const translateY = (scale - 1) * -20; // 向上移动
                
                item.style.transform = `scale(${scale}) translateY(${translateY}px)`;
            } else {
                item.style.transform = 'scale(1) translateY(0)';
            }
        });
    }
    
    /**
     * 重置鱼眼效果
     */
    resetFisheyeEffect() {
        const allItems = Array.from(this.dockContainer.querySelectorAll('.dock-item'));
        allItems.forEach(item => {
            item.style.transform = 'scale(1) translateY(0)';
        });
    }
}

export default new DockRenderer();
