// ==================== 拖拽功能处理器 ====================

import { updateItemLayout, reorderItems } from './api.js';

class DragHandler {
    constructor() {
        this.draggedElement = null;
        this.draggedData = null;
        this.dropZone = null;
        this.gridContainer = null;
    }

    /**
     * 初始化拖拽功能
     */
    init() {
        // 监听图标的拖拽开始事件（事件委托）
        document.addEventListener('dragstart', (e) => {
            const gridItem = e.target.closest('.grid-item');
            if (gridItem) {
                this.handleDragStart(e, gridItem);
            }
        });

        // 监听拖拽结束事件
        document.addEventListener('dragend', (e) => {
            this.handleDragEnd(e);
        });

        // 监听放置区域的拖拽事件（事件委托）
        document.addEventListener('dragover', (e) => {
            const dropZone = e.target.closest('.category-panel');
            if (dropZone) {
                this.handleDragOver(e, dropZone);
            }
        });

        document.addEventListener('drop', (e) => {
            const dropZone = e.target.closest('.category-panel');
            if (dropZone) {
                this.handleDrop(e, dropZone);
            }
        });
        
        // 监听网格内的拖拽排序
        document.addEventListener('dragenter', (e) => {
            const gridItem = e.target.closest('.grid-item');
            if (gridItem && this.draggedElement && gridItem !== this.draggedElement) {
                e.preventDefault();
                this.handleDragEnter(e, gridItem);
            }
        });

        console.log('✅ 拖拽功能已初始化');
    }

    /**
     * 处理拖拽开始
     */
    handleDragStart(e, element) {
        this.draggedElement = element;
        this.draggedData = {
            itemUuid: element.dataset.itemUuid,
            url: element.dataset.url,
            sourcePanel: element.closest('.category-panel').dataset.categoryId
        };

        // 设置拖拽数据
        e.dataTransfer.setData('text/plain', JSON.stringify(this.draggedData));
        e.dataTransfer.effectAllowed = 'move';

        // 添加拖拽中的样式
        setTimeout(() => {
            element.classList.add('dragging');
        }, 0);

        console.log(' 开始拖拽:', this.draggedData);
    }

    /**
     * 处理拖拽结束
     */
    handleDragEnd(e) {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
        }

        // 清除所有放置区的高亮
        document.querySelectorAll('.category-panel').forEach(panel => {
            panel.classList.remove('drag-over');
        });

        this.draggedElement = null;
        this.draggedData = null;
        this.dropZone = null;

        console.log('✅ 拖拽结束');
    }

    /**
     * 处理拖拽经过
     */
    handleDragOver(e, panel) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // 高亮当前放置区域
        document.querySelectorAll('.category-panel').forEach(p => {
            p.classList.remove('drag-over');
        });
        panel.classList.add('drag-over');
    }

    /**
     * 处理放置
     */
    async handleDrop(e, panel) {
        e.preventDefault();
        panel.classList.remove('drag-over');

        if (!this.draggedData) return;

        const targetPanelId = panel.dataset.categoryId;
        const sourcePanelId = this.draggedData.sourcePanel;
        
        console.log('📍 放置到分类:', targetPanelId);

        // 如果是同一个分类，不做处理（排序由 dragenter 处理）
        if (targetPanelId === sourcePanelId) {
            console.log('⚠️ 同一分类内移动，跳过');
            return;
        }

        try {
            // 更新图标的分类归属
            // TODO: 需要后端 API 支持更新 a70Id
            console.log('✅ 拖拽分类移动功能待实现：需要后端 API 支持更新 a70Id');
            
            // 暂时只做视觉反馈
            alert('分类移动功能暂未实现');
        } catch (error) {
            console.error('❌ 拖拽移动失败:', error);
            alert('移动失败: ' + error.message);
        }
    }
    
    /**
     * 处理拖拽进入另一个图标上方
     */
    async handleDragEnter(e, targetItem) {
        if (!this.draggedElement || !targetItem) return;
        
        const gridContainer = this.draggedElement.closest('.grid-container');
        if (!gridContainer) return;
        
        // 获取所有网格项
        const allItems = Array.from(gridContainer.querySelectorAll('.grid-item'));
        const draggedIndex = allItems.indexOf(this.draggedElement);
        const targetIndex = allItems.indexOf(targetItem);
        
        if (draggedIndex === -1 || targetIndex === -1) return;
        
        // 交换位置
        if (draggedIndex < targetIndex) {
            gridContainer.insertBefore(this.draggedElement, targetItem.nextSibling);
        } else {
            gridContainer.insertBefore(this.draggedElement, targetItem);
        }
        
        // 保存排序到数据库
        await this.saveSortOrder(gridContainer);
    }
    
    /**
     * 保存排序到数据库
     */
    async saveSortOrder(gridContainer) {
        try {
            const categoryId = gridContainer.closest('.category-panel').dataset.categoryId;
            const items = Array.from(gridContainer.querySelectorAll('.grid-item'));
            
            const layoutUpdates = items.map((item, index) => ({
                item_uuid: item.dataset.itemUuid,
                category_id: categoryId,
                sort_order: index
            }));
            
            await reorderItems(layoutUpdates);
            console.log('✅ 排序已保存到数据库');
        } catch (error) {
            console.error('❌ 保存排序失败:', error);
        }
    }

    /**
     * 启用元素的拖拽功能
     */
    enableDrag(element) {
        element.setAttribute('draggable', 'true');
    }
}

export default new DragHandler();
