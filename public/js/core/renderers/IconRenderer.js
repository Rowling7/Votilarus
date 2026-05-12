// ==================== 图标渲染器 ====================

import CategoryManager from '../../managers/CategoryManager.js';
import DragHandler from '../handlers/DragHandler.js';
import WidgetManager from '../../managers/WidgetManager.js';
import SettingsManager from '../../managers/SettingsManager.js';

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

    async renderAllCategories() {
        const startTime = performance.now();
        const categories = CategoryManager.getCategories();

        this.contentArea.innerHTML = '';

        // 创建“首页”面板（data-category-id = -1）
        const homePanel = await this.createHomePanel();
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
    async createHomePanel() {
        const panel = document.createElement('div');
        panel.className = 'category-panel';
        panel.id = 'category--1';
        panel.dataset.categoryId = '-1';

        // 创建网格容器
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid-container';

        // 在首页添加默认小组件
        await this.addDefaultWidgets(gridContainer);

        // 使用 requestAnimationFrame 优化渲染
        requestAnimationFrame(() => {
            panel.appendChild(gridContainer);
        });

        return panel;
    }

    /**
     * 添加默认小组件到首页
     */
    async addDefaultWidgets(container) {
        try {
            const { getWidgets, createWidget } = await import('../api-client.js');

            // 从数据库获取 category_id = -1 的所有组件
            let widgets = await getWidgets(-1);

            // 如果数据库中没有组件，创建默认的 ClockWidget 记录
            if (!widgets || widgets.length === 0) {
                await createWidget({
                    title: 'ClockWidget',
                    category_id: -1,
                    pos_x: 0,
                    pos_y: 0,
                    width: 2,
                    height: 2,
                    active_flag: 1
                });

                // 重新获取刚创建的组件
                widgets = await getWidgets(-1);
            }

            // 按 sort_order 排序
            if (widgets && widgets.length > 0) {
                widgets.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

                // 渲染所有组件
                widgets.forEach(widget => {
                    // 根据标题判断 widget 类型
                    const widgetTypeMap = {
                        'ClockWidget': 'clock',
                        'CalendarWidget': 'calendar',
                        'WeatherWidget': 'weather',
                        'NotebookWidget': 'notebook'
                    };

                    const widgetType = widgetTypeMap[widget.title] || widget.title.toLowerCase().replace('widget', '');
                    const size = `${widget.width}x${widget.height}`;
                    const widgetId = widget.id;

                    // 创建 widget 元素
                    const widgetElement = WidgetManager.createWidgetElement(widgetType, size, widgetId);

                    // 添加 sort_order 属性
                    widgetElement.dataset.sortOrder = widget.sort_order !== undefined && widget.sort_order !== null ? widget.sort_order : 999999;

                    // 设置位置信息（如果需要绝对定位）
                    if (widget.pos_x !== undefined && widget.pos_y !== undefined) {
                        widgetElement.dataset.posX = widget.pos_x;
                        widgetElement.dataset.posY = widget.pos_y;
                    }

                    // 启用拖拽
                    DragHandler.enableDrag(widgetElement);

                    container.appendChild(widgetElement);
                });
            }
        } catch (error) {
            console.error('Failed to load/create default widgets:', error);

            // 降级方案：直接创建默认的 ClockWidget
            const clockWidget = WidgetManager.createWidgetElement('clock', '2x2', null);
            container.appendChild(clockWidget);
        }
    }

    /**
     * 创建懒加载分类面板（只创建容器，不渲染图标）
     */
    createLazyCategoryPanel(category, index) {
        const panel = document.createElement('div');
        panel.className = 'category-panel';
        panel.id = `category-${category.id}`;
        panel.dataset.categoryId = category.id;
        panel.dataset.loaded = 'false'; // 标记为未加载

        // 创建一个空的网格容器，稍后填充
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid-container';
        gridContainer.id = `grid-${category.id}`;
        panel.appendChild(gridContainer);

        return panel;
    }

    /**
     * 按需加载分类的图标内容
     * @param {string} categoryUuid - 分类UUID
     * @param {boolean} forceReload - 是否强制重新加载（即使已加载）
     */
    loadCategoryContent(categoryUuid, forceReload = false) {
        const panel = document.getElementById(`category-${categoryUuid}`);
        if (!panel) return;

        // 如果不是强制重载且已经加载过，则跳过
        if (!forceReload && panel.dataset.loaded === 'true') {
            return;
        }

        const gridContainer = document.getElementById(`grid-${categoryUuid}`);
        if (!gridContainer) return;

        // 清空现有内容
        gridContainer.innerHTML = '';

        // 获取该分类下的图标
        const items = CategoryManager.getItems(categoryUuid);

        // 按 sort_order 排序
        const sortedItems = items.sort((a, b) => {
            const orderA = a.sort_order !== undefined && a.sort_order !== null ? a.sort_order : 999999;
            const orderB = b.sort_order !== undefined && b.sort_order !== null ? b.sort_order : 999999;
            return orderA - orderB;
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
        panel.id = `category-${category.id}`;
        panel.dataset.categoryId = category.id;

        // 创建网格容器
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid-container';

        // 获取该分类下的图标
        const items = categoryManager.getItems(category.id);

        // 按 sort_order 排序
        const sortedItems = items.sort((a, b) => {
            const layoutA = CategoryManager.getLayout(a.id);
            const layoutB = CategoryManager.getLayout(b.id);
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
        // 检查是否是 widget（link_url 为空）
        const isWidget = !item.link_url || item.link_url.trim() === '';

        if (isWidget) {
            // 创建 widget
            const layout = {
                width: item.width || 2,
                height: item.height || 2,
                sort_order: item.sort_order
            };
            return this.createWidgetItem(item, layout);
        }

        // 创建普通图标
        const gridItem = document.createElement('div');
        // 确保 width 和 height 有默认值，避免 size-nullxnull
        const width = item.width || 1;
        const height = item.height || 1;
        gridItem.className = `grid-item size-${width}x${height}`;
        gridItem.dataset.itemId = item.id;
        gridItem.dataset.url = item.link_url;
        gridItem.dataset.tooltip = item.title; // 添加 tooltip
        gridItem.dataset.sortOrder = item.sort_order !== undefined && item.sort_order !== null ? item.sort_order : 999999; // 添加 sort_order

        const iconDiv = document.createElement('div');
        iconDiv.className = 'nav-icon';

        // 如果有背景图，显示图片（使用懒加载）
        if (item.icon_path) {
            const bgDiv = document.createElement('div');
            bgDiv.className = 'nav-icon-bg';
            // 将 Windows 路径分隔符 \ 转换为 URL 友好的 /
            let imageUrl = item.icon_path.replace(/\\/g, '/');
            // 如果路径不是完整URL且不以 static/ 开头，则添加 static/ico/ 前缀
            if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:') && !imageUrl.startsWith('static/')) {
                imageUrl = 'static/ico/' + imageUrl;
            }
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
            letterDiv.textContent = this.getFirstLetter(item.title);
            iconDiv.appendChild(letterDiv);
        }

        gridItem.appendChild(iconDiv);

        // 启用拖拽
        DragHandler.enableDrag(gridItem);

        // 添加标题 - 从设置中获取
        const showTitle = SettingsManager.get('show_title') === '1';
        if (showTitle) {
            const titleDiv = document.createElement('div');
            titleDiv.className = 'nav-icon-title';

            // 获取标题最大长度
            const titleMaxLength = parseInt(SettingsManager.get('title_max_length')) || 8;
            const displayTitle = item.title.length > titleMaxLength
                ? item.title.substring(0, titleMaxLength) + '...'
                : item.title;

            titleDiv.textContent = displayTitle;
            titleDiv.title = item.title; // 完整标题作为 tooltip

            // 根据标题位置调整布局
            const titlePosition = SettingsManager.get('title_position') || 'bottom';
            if (titlePosition === 'top') {
                gridItem.insertBefore(titleDiv, iconDiv);
            } else {
                gridItem.appendChild(titleDiv);
            }
        }

        // 点击事件 - 使用事件委托优化
        gridItem.addEventListener('click', () => {
            if (item.link_url) {
                window.open(item.link_url, '_blank');
            }
        });

        return gridItem;
    }

    /**
     * 创建 widget 元素
     */
    createWidgetItem(item, layout) {
        // 根据标题判断 widget 类型
        const widgetTypeMap = {
            'ClockWidget': 'clock',
            'CalendarWidget': 'calendar',
            'WeatherWidget': 'weather',
            'NotebookWidget': 'notebook'
        };

        const widgetType = widgetTypeMap[item.title] || item.title.toLowerCase().replace('widget', '');
        // 确保 width 和 height 有默认值
        const width = layout.width || 2;
        const height = layout.height || 2;
        const size = `${width}x${height}`;
        const widgetId = item.id;  // 直接使用 icon_widgets.id

        // 使用 WidgetManager 创建 widget 元素
        const widgetElement = WidgetManager.createWidgetElement(widgetType, size, widgetId);

        // 添加 sort_order 属性
        widgetElement.dataset.sortOrder = item.sort_order !== undefined && item.sort_order !== null ? item.sort_order : 999999;

        // 启用拖拽
        DragHandler.enableDrag(widgetElement);

        return widgetElement;
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
