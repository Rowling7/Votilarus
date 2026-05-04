// ==================== 图标渲染器 ====================

import categoryManager from '../managers/category-manager.js';

class IconRenderer {
    constructor() {
        this.contentArea = document.getElementById('contentArea');
    }

    renderAllCategories() {
        const categories = categoryManager.getCategories();
        
        this.contentArea.innerHTML = '';
        
        categories.forEach((category, index) => {
            const panel = this.createCategoryPanel(category, index);
            this.contentArea.appendChild(panel);
        });
    }

    createCategoryPanel(category, index) {
        const panel = document.createElement('div');
        panel.className = 'category-panel';
        panel.id = `category-${category.uuid}`;
        panel.dataset.categoryId = category.uuid;
        
        // 创建标题
        const title = document.createElement('h2');
        title.textContent = category.name;
        title.style.cssText = 'margin-bottom: 1.5rem; color: var(--text-primary); font-size: 1.5rem;';
        panel.appendChild(title);
        
        // 创建网格容器
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid-container';
        gridContainer.style.position = 'relative';
        gridContainer.style.width = '100%';
        gridContainer.style.height = 'calc(100vh - 150px)';
        
        // 获取该分类下的图标
        const items = categoryManager.getItems(category.uuid);
        items.forEach(item => {
            const iconElement = this.createIcon(item);
            if (iconElement) {
                gridContainer.appendChild(iconElement);
            }
        });
        
        panel.appendChild(gridContainer);
        
        return panel;
    }

    createIcon(item) {
        const layout = categoryManager.getLayout(item.uuid);
        
        if (!layout) {
            return null;
        }
        
        // 获取 CSS 变量值
        const cellBaseSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-base-size'));
        const cellGap = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-gap'));
        const cellSizePx = cellBaseSize * 16; // rem to px
        const gapSizePx = cellGap * 16; // rem to px
        
        const gridItem = document.createElement('div');
        gridItem.className = `grid-item size-${layout.width}x${layout.height}`;
        gridItem.style.left = `${layout.pos_x * (cellSizePx + gapSizePx)}px`;
        gridItem.style.top = `${layout.pos_y * (cellSizePx + gapSizePx)}px`;
        gridItem.dataset.itemUuid = item.uuid;
        gridItem.dataset.url = item.target;
        
        const iconDiv = document.createElement('div');
        iconDiv.className = 'nav-icon';
        
        // 如果有背景图，显示图片
        if (item.bgimage) {
            const bgDiv = document.createElement('div');
            bgDiv.className = 'nav-icon-bg';
            bgDiv.style.backgroundImage = `url(${item.bgimage})`;
            iconDiv.appendChild(bgDiv);
        } else {
            // 否则显示首字母
            const letterDiv = document.createElement('div');
            letterDiv.className = 'nav-icon-letter';
            letterDiv.textContent = this.getFirstLetter(item.name);
            iconDiv.appendChild(letterDiv);
        }
        
        gridItem.appendChild(iconDiv);
        
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
