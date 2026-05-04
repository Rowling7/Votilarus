// ==================== 拖拽功能处理器 ====================

class DragHandler {
    constructor() {
        this.draggedElement = null;
        this.draggedData = null;
        this.dropZone = null;
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
    handleDrop(e, panel) {
        e.preventDefault();
        panel.classList.remove('drag-over');

        if (!this.draggedData) return;

        const targetPanelId = panel.dataset.categoryId;
        
        console.log('📍 放置到分类:', targetPanelId);

        // TODO: 这里后续会处理：
        // 1. 更新图标的分类归属
        // 2. 保存到数据库
        // 3. 重新渲染网格

        // 暂时只做视觉反馈
        console.log('️ 拖拽分类移动功能待实现：需要后端 API 支持');
    }

    /**
     * 启用元素的拖拽功能
     */
    enableDrag(element) {
        element.setAttribute('draggable', 'true');
    }
}

export default new DragHandler();
