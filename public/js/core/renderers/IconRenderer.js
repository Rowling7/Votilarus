// ==================== 图标渲染器 ====================

import CategoryManager from '../../managers/CategoryManager.js';
import DragHandler from '../handlers/DragHandler.js';

class IconRenderer {
    constructor() {
        this.contentArea = document.getElementById('contentArea');
        this.imageObserver = null; // 图片懒加载观察器
        this.initLazyLoad();
    }

    /**
     * 初始化图片懒加载
     */
    initLazyLoad() {
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.dataset.lazySrc;
                        if (src) {
                            // 使用 requestAnimationFrame 延迟加载，避免阻塞主线程
                            requestAnimationFrame(() => {
                                img.style.backgroundImage = `url(${src})`;
                                img.removeAttribute('data-lazy-src');
                                observer.unobserve(img);
                            });
                        }
                    }
                });
            }, {
                rootMargin: '100px 0px', // 提前 100px 开始加载
                threshold: 0
            });
        }
    }

    renderAllCategories() {
        const startTime = performance.now();
        const categories = CategoryManager.getCategories();

        this.contentArea.innerHTML = '';

        // 创建“首页”面板（data-category-id = -1）
        const homePanel = this.createHomePanel();
        this.contentArea.appendChild(homePanel);

        // 优化：其他分类使用懒渲染，只创建空面板，切换时再填充内容
        const fragment = document.createDocumentFragment();

        categories.forEach((category, index) => {
            const panel = this.createLazyCategoryPanel(category, index);
            fragment.appendChild(panel);
        });

        // 一次性添加到 DOM
        this.contentArea.appendChild(fragment);

        // 激活首页面板
        const homePanelElement = document.getElementById('category--1');
        if (homePanelElement) {
            homePanelElement.classList.add('active');
        }

        // 渲染完成后应用网格设置
        this.applyGridSettingsAfterRender();

        const endTime = performance.now();
    }

    /**
     * 渲染完成后应用网格设置
     */
    applyGridSettingsAfterRender() {
        // 等待一帧确保 DOM 完全渲染
        requestAnimationFrame(() => {
            const settingsManager = window.settingsManager;
            if (settingsManager && settingsManager.settings) {
                const gridCols = parseInt(settingsManager.settings.grid_cols) || 13;
                const gridRows = parseInt(settingsManager.settings.grid_rows) || 5;

                const gridContainers = document.querySelectorAll('.grid-container');

                gridContainers.forEach((container) => {
                    const categoryPanel = container.closest('.category-panel');
                    if (!categoryPanel) return;

                    // 计算容器可用宽度
                    const panelStyle = window.getComputedStyle(categoryPanel);
                    const panelPadding = parseFloat(panelStyle.paddingLeft) + parseFloat(panelStyle.paddingRight);
                    const availableWidth = categoryPanel.clientWidth - panelPadding;

                    // 计算网格所需宽度
                    const cellSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-base-size')) || 64;
                    const cellGap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-gap')) || 32;
                    const gridWidth = gridCols * cellSize + (gridCols - 1) * cellGap;

                    // 如果网格宽度大于可用宽度，自动调整列数
                    if (gridWidth > availableWidth) {
                        const maxCols = Math.floor((availableWidth + cellGap) / (cellSize + cellGap));
                        const actualCols = Math.max(maxCols, 1);
                        container.style.gridTemplateColumns = `repeat(${actualCols}, var(--cell-base-size))`;
                    } else {
                        container.style.gridTemplateColumns = `repeat(${gridCols}, var(--cell-base-size))`;
                    }
                });
            } else {
                // 如果 settingsManager 还没准备好，稍后重试
                setTimeout(() => this.applyGridSettingsAfterRender(), 200);
            }
        });
    }

    /**
     * 创建首页面板（data-category-id = -1）
     */
    createHomePanel() {
        const panel = document.createElement('div');
        panel.className = 'category-panel';
        panel.id = 'category--1';
        panel.dataset.categoryId = '-1';

        // 创建网格容器
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid-container';

        // 在首页添加默认小组件
        this.addDefaultWidgets(gridContainer);

        // 使用 requestAnimationFrame 优化渲染
        requestAnimationFrame(() => {
            panel.appendChild(gridContainer);
        });

        return panel;
    }

    /**
     * 添加默认小组件到首页
     */
    addDefaultWidgets(container) {
        // 添加时钟小组件
        const clockWidget = document.createElement('nav-widget');
        clockWidget.setAttribute('type', 'clock');
        clockWidget.setAttribute('size', '2x2');
        clockWidget.setAttribute('uuid', 'widget-clock');
        container.appendChild(clockWidget);

        // 添加日历小组件
        const calendarWidget = document.createElement('nav-widget');
        calendarWidget.setAttribute('type', 'calendar');
        calendarWidget.setAttribute('size', '2x2');
        calendarWidget.setAttribute('uuid', 'widget-calendar');
        container.appendChild(calendarWidget);
    }

    /**
     * 创建懒加载分类面板（只创建容器，不渲染图标）
     */
    createLazyCategoryPanel(category, index) {
        const panel = document.createElement('div');
        panel.className = 'category-panel';
        panel.id = `category-${category.uuid}`;
        panel.dataset.categoryId = category.uuid;
        panel.dataset.loaded = 'false'; // 标记为未加载

        // 创建一个空的网格容器，稍后填充
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid-container';
        gridContainer.id = `grid-${category.uuid}`;
        panel.appendChild(gridContainer);

        return panel;
    }

    /**
     * 按需加载分类的图标内容
     */
    loadCategoryContent(categoryUuid) {
        const panel = document.getElementById(`category-${categoryUuid}`);
        if (!panel || panel.dataset.loaded === 'true') {
            return; // 已经加载过
        }

        const gridContainer = document.getElementById(`grid-${categoryUuid}`);
        if (!gridContainer) return;

        // 获取该分类下的图标
        const items = CategoryManager.getItems(categoryUuid);

        // 按 sort_order 排序
        const sortedItems = items.sort((a, b) => {
            const layoutA = CategoryManager.getLayout(a.uuid);
            const layoutB = CategoryManager.getLayout(b.uuid);
            if (!layoutA || !layoutB) return 0;
            return layoutA.sort_order - layoutB.sort_order;
        });

        // 使用文档片段批量添加图标
        const iconFragment = document.createDocumentFragment();
        sortedItems.forEach(item => {
            const iconElement = this.createIcon(item);
            if (iconElement) {
                iconFragment.appendChild(iconElement);
            }
        });

        gridContainer.appendChild(iconFragment);
        panel.dataset.loaded = 'true'; // 标记为已加载
    }

    createCategoryPanel(category, index) {
        const panel = document.createElement('div');
        panel.className = 'category-panel';
        panel.id = `category-${category.uuid}`;
        panel.dataset.categoryId = category.uuid;

        // 创建网格容器
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid-container';

        // 获取该分类下的图标
        const items = categoryManager.getItems(category.uuid);

        // 按 sort_order 排序
        const sortedItems = items.sort((a, b) => {
            const layoutA = CategoryManager.getLayout(a.uuid);
            const layoutB = CategoryManager.getLayout(b.uuid);
            if (!layoutA || !layoutB) return 0;
            return layoutA.sort_order - layoutB.sort_order;
        });

        // 优化：使用文档片段批量添加图标
        const iconFragment = document.createDocumentFragment();
        sortedItems.forEach(item => {
            const iconElement = this.createIcon(item);
            if (iconElement) {
                iconFragment.appendChild(iconElement);
            }
        });

        gridContainer.appendChild(iconFragment);
        panel.appendChild(gridContainer);

        return panel;
    }

    createIcon(item) {
        const layout = CategoryManager.getLayout(item.uuid);

        if (!layout) {
            return null;
        }

        const gridItem = document.createElement('div');
        gridItem.className = `grid-item size-${layout.width}x${layout.height}`;
        gridItem.dataset.itemUuid = item.uuid;
        gridItem.dataset.url = item.target;
        gridItem.dataset.tooltip = item.name; // 添加 tooltip

        const iconDiv = document.createElement('div');
        iconDiv.className = 'nav-icon';

        // 如果有背景图，显示图片（使用懒加载）
        if (item.bgimage) {
            const bgDiv = document.createElement('div');
            bgDiv.className = 'nav-icon-bg';
            // 将 Windows 路径分隔符 \ 转换为 URL 友好的 /
            const imageUrl = item.bgimage.replace(/\\/g, '/');
            bgDiv.dataset.lazySrc = imageUrl; // 标记为懒加载
            iconDiv.appendChild(bgDiv);

            // 注册到观察器
            if (this.imageObserver) {
                this.imageObserver.observe(bgDiv);
            }
        } else {
            // 否则显示首字母
            const letterDiv = document.createElement('div');
            letterDiv.className = 'nav-icon-letter';
            letterDiv.textContent = this.getFirstLetter(item.name);
            iconDiv.appendChild(letterDiv);
        }

        gridItem.appendChild(iconDiv);

        // 启用拖拽
        DragHandler.enableDrag(gridItem);

        // 添加标题
        const showTitle = true; // 从设置中获取
        if (showTitle) {
            const titleDiv = document.createElement('div');
            titleDiv.className = 'nav-icon-title';
            titleDiv.textContent = item.name;
            titleDiv.title = item.name;
            gridItem.appendChild(titleDiv);
        }

        // 点击事件 - 使用事件委托优化
        gridItem.addEventListener('click', () => {
            if (item.target) {
                window.open(item.target, '_blank');
            }
        });

        return gridItem;
    }

    getFirstLetter(name) {
        if (!name || name.length === 0) return '?';

        // 如果是中文，返回第一个汉字
        const firstChar = name.charAt(0);
        if (/[\u4e00-\u9fa5]/.test(firstChar)) {
            return firstChar;
        }

        // 如果是英文，返回第一个字母并大写
        return firstChar.toUpperCase();
    }
}

export default new IconRenderer();
