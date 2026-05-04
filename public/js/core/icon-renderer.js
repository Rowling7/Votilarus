// ==================== 图标渲染器 ====================

import categoryManager from '../managers/category-manager.js';
import dragHandler from './drag-handler.js';

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
                            img.style.backgroundImage = `url(${src})`;
                            img.removeAttribute('data-lazy-src');
                            observer.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px', // 提前 50px 开始加载
                threshold: 0.01
            });
        }
    }

    renderAllCategories() {
        console.log('🎨 [IconRenderer] 开始渲染所有分类');
        const categories = categoryManager.getCategories();
        console.log('  - 分类数量:', categories.length);
        
        this.contentArea.innerHTML = '';
        
        // 创建“首页”面板（data-category-id = -1）
        const homePanel = this.createHomePanel();
        this.contentArea.appendChild(homePanel);
        
        // 渲染其他分类
        categories.forEach((category, index) => {
            console.log(`\n🎨 渲染分类面板: ${category.name} (${category.uuid})`);
            const panel = this.createCategoryPanel(category, index);
            this.contentArea.appendChild(panel);
        });
        
        // 激活首页面板
        const homePanelElement = document.getElementById('category--1');
        if (homePanelElement) {
            homePanelElement.classList.add('active');
            console.log('  - ✅ 激活首页面板');
        }
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
        
        // 首页可以显示欢迎信息或常用图标
        // 这里暂时留空，后续可以添加常用图标或小组件
        
        // 使用 requestAnimationFrame 优化渲染
        requestAnimationFrame(() => {
            panel.appendChild(gridContainer);
        });
        
        return panel;
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
        console.log(`  - 获取到 ${items.length} 个图标`);
        
        // 按 sort_order 排序
        const sortedItems = items.sort((a, b) => {
            const layoutA = categoryManager.getLayout(a.uuid);
            const layoutB = categoryManager.getLayout(b.uuid);
            if (!layoutA || !layoutB) return 0;
            return layoutA.sort_order - layoutB.sort_order;
        });
        
        sortedItems.forEach(item => {
            const iconElement = this.createIcon(item);
            if (iconElement) {
                gridContainer.appendChild(iconElement);
            }
        });
        
        console.log(`  - ✅ 网格容器创建完成，包含 ${gridContainer.children.length} 个图标元素`);
        
        // 使用 requestAnimationFrame 优化渲染
        requestAnimationFrame(() => {
            panel.appendChild(gridContainer);
        });
        
        return panel;
    }

    createIcon(item) {
        const layout = categoryManager.getLayout(item.uuid);
        
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
            bgDiv.dataset.lazySrc = item.bgimage; // 标记为懒加载
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
        dragHandler.enableDrag(gridItem);
        
        // 添加标题
        const showTitle = true; // 从设置中获取
        if (showTitle) {
            const titleDiv = document.createElement('div');
            titleDiv.className = 'nav-icon-title';
            titleDiv.textContent = item.name;
            titleDiv.title = item.name;
            gridItem.appendChild(titleDiv);
        }
        
        // 点击事件
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
