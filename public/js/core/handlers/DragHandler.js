// ==================== 拖拽功能处理器 ====================

import { updateItemLayout, reorderItems, moveItemToCategory } from '../api-client.js';
import SidebarRenderer from '../renderers/SidebarRenderer.js';
import CategoryManager from '../../managers/CategoryManager.js';
import ToastNotification from '../../utils/ToastNotification.js';

class DragHandler {
    constructor() {
        this.draggedElement = null;
        this.draggedData = null;
        this.dropZone = null;
        this.gridContainer = null;

        // 新增：侧边栏拖拽支持
        this.undoTimeout = null;
        this.lastMoveState = null;
        this.placeholderElement = null;
        this.originalPosition = null;
    }

    /**
     * 初始化拖拽功能
     */
    init() {
        // 使用事件委托，减少事件监听器数量
        const contentArea = document.getElementById('contentArea');

        if (contentArea) {
            // 监听图标的拖拽开始事件（事件委托）- 只处理图标，不处理组件
            contentArea.addEventListener('dragstart', (e) => {
                const gridItem = e.target.closest('.grid-item');
                if (gridItem && gridItem.dataset.type !== 'widget') {
                    this.handleDragStart(e, gridItem);
                }
            });

            // 监听拖拽结束事件
            contentArea.addEventListener('dragend', (e) => {
                this.handleDragEnd(e);
            });

            // 监听网格内的拖拽排序（使用事件委托，支持动态加载的内容）
            contentArea.addEventListener('dragenter', (e) => {
                const gridItem = e.target.closest('.grid-item');
                // 只处理图标，不处理组件，且不是被拖拽的元素本身
                if (gridItem && this.draggedElement &&
                    gridItem !== this.draggedElement &&
                    gridItem.dataset.type !== 'widget' &&
                    !gridItem.classList.contains('placeholder')) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleDragEnter(e, gridItem);
                }
            }, true); // 使用捕获阶段确保能捕获到事件
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

        // 初始化侧边栏拖拽支持
        this.initSidebarDragSupport();
    }

    /**
     * 初始化侧边栏拖拽支持
     */
    initSidebarDragSupport() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        // 为所有侧边栏分类添加拖拽事件
        const setupSidebarCategories = () => {
            const categories = sidebar.querySelectorAll('.sidebar-category');
            categories.forEach(category => {
                category.addEventListener('dragover', (e) => {
                    this.handleSidebarDragOver(e, category);
                });

                category.addEventListener('dragleave', (e) => {
                    this.handleSidebarDragLeave(e, category);
                });

                category.addEventListener('drop', (e) => {
                    this.handleSidebarDrop(e, category);
                });
            });
        };

        setupSidebarCategories();

        // 监听 DOM 变化，动态添加的分类也需要支持拖拽
        const observer = new MutationObserver(() => {
            setupSidebarCategories();
        });

        observer.observe(sidebar, { childList: true, subtree: true });
    }

    /**
     * 处理拖拽开始 - 只处理图标
     */
    handleDragStart(e, element) {
        // 只处理图标，跳过组件
        if (element.dataset.type === 'widget') {
            e.preventDefault();
            return;
        }

        this.draggedElement = element;

        // 保存原始位置信息用于撤销
        this.originalPosition = {
            itemId: element.dataset.itemId,
            categoryId: element.closest('.category-panel').dataset.categoryId,
            element: element.cloneNode(true),
            nextSibling: element.nextSibling,
            parent: element.parentNode
        };

        this.draggedData = {
            itemId: element.dataset.itemId,
            itemType: 'icon',
            url: element.dataset.url,
            sourcePanel: element.closest('.category-panel').dataset.categoryId
        };

        // 设置拖拽数据
        e.dataTransfer.setData('text/plain', JSON.stringify(this.draggedData));
        e.dataTransfer.effectAllowed = 'move';

        // 添加拖拽中的样式 - 半透明效果
        setTimeout(() => {
            element.classList.add('dragging');
            // 显示占位符
            this.showPlaceholder(element);
        }, 0);
    }

    /**
     * 处理拖拽结束
     */
    handleDragEnd(e) {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
            // 清除临时样式
            this.draggedElement.style.opacity = '';
            this.draggedElement.style.transform = '';
        }

        // 清除所有放置区的高亮
        document.querySelectorAll('.category-panel').forEach(panel => {
            panel.classList.remove('drag-over');
        });

        // 清除侧边栏分类的高亮
        document.querySelectorAll('.sidebar-category').forEach(cat => {
            cat.classList.remove('drag-over');
        });

        // 隐藏占位符
        this.hidePlaceholder();

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
     * 处理在主内容区面板上的放置（同分类内排序）
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

        // 不同分类的移动，调用侧边栏放置逻辑
        await this.executeMove(this.draggedData, targetPanelId);
    }

    /**
     * 处理侧边栏拖拽悬停 - 立即切换分类
     */
    handleSidebarDragOver(e, categoryElement) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (!this.draggedData) return;

        const targetCategoryId = categoryElement.dataset.categoryId;
        const sourceCategoryId = this.draggedData.sourcePanel;
        const currentCategoryId = CategoryManager.getCurrentCategory();

        // 如果已经在目标分类，不需要切换
        if (targetCategoryId === sourceCategoryId) {
            return;
        }

        // 如果当前已经显示的是目标分类，不需要重复切换
        if (targetCategoryId === currentCategoryId) {
            return;
        }

        // 高亮当前悬停的分类
        document.querySelectorAll('.sidebar-category').forEach(cat => {
            cat.classList.remove('drag-over');
        });
        categoryElement.classList.add('drag-over');

        // 立即切换分类（无防抖）
        this.switchContentArea(targetCategoryId);
    }

    /**
     * 处理侧边栏拖拽离开
     */
    handleSidebarDragLeave(e, categoryElement) {
        // 检查是否真的离开了元素（不是移动到子元素）
        const rect = categoryElement.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            categoryElement.classList.remove('drag-over');
        }
    }

    /**
     * 处理侧边栏放置
     */
    async handleSidebarDrop(e, categoryElement) {
        e.preventDefault();
        e.stopPropagation();

        categoryElement.classList.remove('drag-over');

        if (!this.draggedData) return;

        const targetCategoryId = categoryElement.dataset.categoryId;
        const sourceCategoryId = this.draggedData.sourcePanel;

        // 如果是同一个分类，不做处理
        if (targetCategoryId === sourceCategoryId) {
            return;
        }

        // 执行移动操作
        await this.executeMove(this.draggedData, targetCategoryId);
    }

    /**
     * 切换主内容区到目标分类
     */
    switchContentArea(targetCategoryId) {
        // 添加切换动画
        const contentArea = document.getElementById('contentArea');
        if (contentArea) {
            contentArea.classList.add('switching');
            setTimeout(() => {
                contentArea.classList.remove('switching');
            }, 300);
        }

        // 调用 SidebarRenderer 切换分类
        SidebarRenderer.switchCategory(targetCategoryId);
    }

    /**
     * 执行移动操作
     */
    async executeMove(draggedData, targetCategoryId) {
        try {
            const itemId = draggedData.itemId;
            const sourceCategoryId = draggedData.sourcePanel;

            // 保存移动前的状态用于撤销
            this.lastMoveState = {
                itemId: itemId,
                sourceCategoryId: sourceCategoryId,
                targetCategoryId: targetCategoryId,
                timestamp: Date.now()
            };

            // 【重要】在移动之前获取原始的布局信息（包含 width 和 height）
            const originalLayout = CategoryManager.getLayout(itemId);
            const originalWidth = originalLayout ? originalLayout.width : 1;
            const originalHeight = originalLayout ? originalLayout.height : 1;
            console.log('原始布局信息:', { width: originalWidth, height: originalHeight });

            // 获取图标当前在网格中的位置索引（在移动之前）
            const gridItem = document.querySelector(`.grid-item[data-item-id="${itemId}"]`);
            let positionIndex = 0;

            if (gridItem) {
                const gridContainer = gridItem.closest('.grid-container');
                if (gridContainer) {
                    const allItems = Array.from(gridContainer.querySelectorAll('.grid-item:not(.placeholder)'));
                    positionIndex = allItems.indexOf(gridItem);
                    console.log('图标在新分类中的位置索引:', positionIndex);
                }
            }

            // 更新图标的分类归属
            await moveItemToCategory(itemId, targetCategoryId);

            // 更新或创建图标在新分类中的布局信息
            const layoutData = {
                item_id: itemId,
                category_id: targetCategoryId,
                pos_x: positionIndex, // 使用位置索引作为 pos_x
                pos_y: 0, // pos_y 设为 0，表示第一行
                width: originalWidth, // 保持原有宽度
                height: originalHeight // 保持原有高度
            };

            console.log('准备更新布局信息:', layoutData);

            const { updateItemLayout } = await import('../api-client.js');
            const result = await updateItemLayout(layoutData);
            console.log('布局更新结果:', result);

            // 重新加载目标分类的数据
            await CategoryManager.reloadCategoryItems(targetCategoryId);

            // 如果需要，也重新加载源分类
            if (sourceCategoryId !== targetCategoryId) {
                await CategoryManager.reloadCategoryItems(sourceCategoryId);
            }

            // 显示成功消息和撤销按钮
            const categoryName = CategoryManager.getCategoryName(targetCategoryId);
            this.showSuccessMessage(categoryName);

            // 8秒后自动清除撤销状态
            if (this.undoTimeout) {
                clearTimeout(this.undoTimeout);
            }
            this.undoTimeout = setTimeout(() => {
                this.lastMoveState = null;
            }, 8000);

        } catch (error) {
            console.error('移动失败:', error);
            ToastNotification.error('移动失败: ' + error.message);
        }
    }

    /**
     * 撤销上次移动
     */
    async undoLastMove() {
        if (!this.lastMoveState) {
            console.warn('没有可撤销的操作');
            return;
        }

        try {
            const { itemId, sourceCategoryId } = this.lastMoveState;

            // 移回原分类
            await moveItemToCategory(itemId, sourceCategoryId);

            // 重新加载相关分类的数据
            await CategoryManager.reloadCategoryItems(sourceCategoryId);
            await CategoryManager.reloadCategoryItems(this.lastMoveState.targetCategoryId);

            // 清除撤销状态
            this.lastMoveState = null;
            if (this.undoTimeout) {
                clearTimeout(this.undoTimeout);
                this.undoTimeout = null;
            }

            // 显示撤销成功消息
            ToastNotification.info('已撤销移动');

        } catch (error) {
            console.error('撤销失败:', error);
            ToastNotification.error('撤销失败: ' + error.message);
        }
    }

    /**
     * 显示成功消息和撤销按钮
     */
    showSuccessMessage(categoryName) {
        const message = `已移动到 ${categoryName}`;

        // 保存移动时的当前分类 ID
        const movedCategoryId = CategoryManager.getCurrentCategory();

        // 使用 ToastNotification，带撤销按钮，3秒后自动消失
        const toast = ToastNotification.success(message, 3000, {
            showUndo: true,
            onUndo: () => this.undoLastMove()
        });

        // 监听 Toast 消失，检查分类是否变化
        setTimeout(() => {
            const currentCategoryId = CategoryManager.getCurrentCategory();
            // 如果当前分类与移动时的分类不同，说明用户切换了分类
            if (currentCategoryId !== movedCategoryId) {
                console.log('检测到分类变化，刷新所有主内容区');
                this.refreshAllContentAreas();
            }
        }, 3000);
    }

    /**
     * 刷新所有主内容区
     */
    async refreshAllContentAreas() {
        try {
            // 获取所有分类面板
            const allPanels = document.querySelectorAll('.category-panel');

            // 重新加载每个分类的内容
            for (const panel of allPanels) {
                const categoryId = panel.dataset.categoryId;
                if (categoryId && categoryId !== '-1') {
                    // 标记为未加载，下次访问时会重新加载
                    panel.dataset.loaded = 'false';

                    // 如果面板是激活状态，立即重新加载
                    if (panel.classList.contains('active')) {
                        await CategoryManager.reloadCategoryItems(categoryId);

                        // 动态导入 IconRenderer 并重新渲染
                        const IconRenderer = await import('../renderers/IconRenderer.js');
                        IconRenderer.default.loadCategoryContent(categoryId);
                    }
                }
            }

            console.log('所有主内容区已刷新');
        } catch (error) {
            console.error('刷新主内容区失败:', error);
        }
    }

    /**
     * 显示占位符
     */
    showPlaceholder(originalElement) {
        if (!originalElement) return;

        // 创建占位符元素
        this.placeholderElement = document.createElement('div');
        this.placeholderElement.className = 'grid-item placeholder';

        // 复制原始元素的尺寸类
        const sizeClasses = Array.from(originalElement.classList).filter(cls =>
            cls.startsWith('size-') || cls.startsWith('widget-')
        );
        sizeClasses.forEach(cls => {
            this.placeholderElement.classList.add(cls);
        });

        // 插入到原始位置
        originalElement.parentNode.insertBefore(this.placeholderElement, originalElement);
    }

    /**
     * 隐藏占位符
     */
    hidePlaceholder() {
        if (this.placeholderElement) {
            this.placeholderElement.remove();
            this.placeholderElement = null;
        }
    }

    /**
     * 处理拖拽进入另一个图标上方
     */
    async handleDragEnter(e, targetItem) {
        if (!this.draggedElement || !targetItem) return;

        // 获取目标项所在的网格容器（可能是新分类的网格）
        const gridContainer = targetItem.closest('.grid-container');
        if (!gridContainer) return;

        // 如果被拖拽元素不在当前网格容器中（跨分类拖拽），需要特殊处理
        const draggedInCurrentGrid = this.draggedElement.closest('.grid-container') === gridContainer;

        if (!draggedInCurrentGrid) {
            // 跨分类拖拽：将被拖拽元素移动到目标网格中
            // 这里只是视觉上的移动，实际数据更新在 drop 时处理
            console.log('检测到跨分类拖拽，将元素移入目标网格');

            // 获取所有网格项（排除占位符）
            const allItems = Array.from(gridContainer.querySelectorAll('.grid-item:not(.placeholder)'));
            const targetIndex = allItems.indexOf(targetItem);

            // 将拖拽元素插入到目标位置
            if (targetIndex !== -1) {
                gridContainer.insertBefore(this.draggedElement, targetItem);
            } else {
                gridContainer.appendChild(this.draggedElement);
            }

            // 添加临时样式表示正在拖拽到新位置
            this.draggedElement.style.opacity = '0.7';
            this.draggedElement.style.transform = 'scale(0.95)';
        } else {
            // 同一分类内的拖拽排序
            const allItems = Array.from(gridContainer.querySelectorAll('.grid-item:not(.placeholder)'));
            const draggedIndex = allItems.indexOf(this.draggedElement);
            const targetIndex = allItems.indexOf(targetItem);

            if (draggedIndex === -1 || targetIndex === -1) return;

            // 交换位置
            if (draggedIndex < targetIndex) {
                gridContainer.insertBefore(this.draggedElement, targetItem.nextSibling);
            } else {
                gridContainer.insertBefore(this.draggedElement, targetItem);
            }
        }

        // 保存排序到数据库
        await this.saveSortOrder(gridContainer);
    }

    /**
     * 保存排序到数据库 - 只处理图标
     */
    async saveSortOrder(gridContainer) {
        try {
            const categoryId = gridContainer.closest('.category-panel').dataset.categoryId;
            // 排除占位符
            const items = Array.from(gridContainer.querySelectorAll('.grid-item:not(.placeholder)'));

            // 只处理图标，跳过组件
            const iconUpdates = [];

            items.forEach((item, index) => {
                // 跳过组件
                if (item.dataset.type === 'widget') {
                    return;
                }

                // 图标：更新 item_layouts 表的 sort_order
                iconUpdates.push({
                    item_id: item.dataset.itemId,
                    category_id: categoryId,
                    sort_order: index
                });
            });

            // 调用图标排序 API
            if (iconUpdates.length > 0) {
                await reorderItems(iconUpdates);
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
