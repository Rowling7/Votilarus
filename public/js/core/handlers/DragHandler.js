// ==================== 拖拽功能处理器 ====================

import { updateItemLayout, reorderItems, moveItemToCategory, reorderWidgets } from '../api-client.js';

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
        // 使用事件委托，减少事件监听器数量
        const contentArea = document.getElementById('contentArea');

        if (contentArea) {
            // 监听图标的拖拽开始事件（事件委托）
            contentArea.addEventListener('dragstart', (e) => {
                const gridItem = e.target.closest('.grid-item');
                if (gridItem) {
                    this.handleDragStart(e, gridItem);
                }
            });

            // 监听拖拽结束事件
            contentArea.addEventListener('dragend', (e) => {
                this.handleDragEnd(e);
            });

            // 监听网格内的拖拽排序
            contentArea.addEventListener('dragenter', (e) => {
                const gridItem = e.target.closest('.grid-item');
                if (gridItem && this.draggedElement && gridItem !== this.draggedElement) {
                    e.preventDefault();
                    this.handleDragEnter(e, gridItem);
                }
            }, true); // 使用捕获阶段
        }

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
    }

    /**
     * 处理拖拽开始
     */
    handleDragStart(e, element) {
        this.draggedElement = element;

        // 判断是图标还是组件
        const isWidget = element.dataset.type === 'widget';

        this.draggedData = {
            itemId: isWidget ? element.dataset.widgetId : element.dataset.itemId,
            itemType: isWidget ? 'widget' : 'icon',  // 新增：标识类型
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

        // 如果是同一个分类，不做处理（排序由 dragenter 处理）
        if (targetPanelId === sourcePanelId) {
            return;
        }

        try {
            // 更新图标的分类归属
            await moveItemToCategory(this.draggedData.itemId, targetPanelId);

            // TODO: 需要重新渲染网格
            alert('图标已移动，请刷新页面查看');
        } catch (error) {
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

            // 分离图标和组件
            const iconUpdates = [];
            const widgetUpdates = [];

            items.forEach((item, index) => {
                const isWidget = item.dataset.type === 'widget';

                if (isWidget) {
                    // 组件：更新 icon_widgets 表的 sort_order
                    widgetUpdates.push({
                        widget_id: item.dataset.widgetId,
                        category_id: categoryId,
                        sort_order: index
                    });
                } else {
                    // 图标：更新 item_layouts 表的 sort_order
                    iconUpdates.push({
                        item_id: item.dataset.itemId,
                        category_id: categoryId,
                        sort_order: index
                    });
                }
            });

            // 分别调用不同的 API
            if (iconUpdates.length > 0) {
                await reorderItems(iconUpdates);
            }

            if (widgetUpdates.length > 0) {
                await reorderWidgets(widgetUpdates);  // 新的 API
            }
        } catch (error) {
            console.error('保存排序失败:', error);
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
