// ==================== 侧边栏渲染器 ====================

import categoryManager from '../managers/category-manager.js';

class SidebarRenderer {
    constructor() {
        this.categoriesContainer = document.getElementById('categories');
    }

    render(categories) {
        this.categoriesContainer.innerHTML = '';
        
        // 获取当前选中的分类
        const currentCategory = categoryManager.getCurrentCategory();
        
        // 添加"首页"分类（data-category-id = -1）
        const homeCategoryDiv = document.createElement('div');
        homeCategoryDiv.className = 'sidebar-category';
        homeCategoryDiv.dataset.categoryId = '-1';
        homeCategoryDiv.title = '首页';
                
        // 创建 SVG 图标容器
        const iconContainer = document.createElement('div');
        iconContainer.className = 'sidebar-icon';
        iconContainer.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house" viewBox="0 0 16 16"><path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"/></svg>';
        homeCategoryDiv.appendChild(iconContainer);
        
        // 如果当前选中首页，添加 active 样式
        if (currentCategory === '-1') {
            homeCategoryDiv.classList.add('active');
        }
        
        homeCategoryDiv.addEventListener('click', () => {
            this.switchCategory('-1');
        });
        
        this.categoriesContainer.appendChild(homeCategoryDiv);
        
        // 渲染其他分类
        categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'sidebar-category';
            categoryDiv.dataset.categoryId = category.uuid;
            
            // 如果有 ico 字段（SVG 内容），直接渲染 SVG；否则显示 aindex 文字
            if (category.ico) {
                // 创建容器并插入 SVG 内容
                const iconContainer = document.createElement('div');
                iconContainer.className = 'sidebar-icon';
                iconContainer.innerHTML = category.ico;
                categoryDiv.appendChild(iconContainer);
            } else {
                // 显示 aindex 文字
                categoryDiv.textContent = category.aindex;
            }
            
            // 如果当前选中该分类，添加 active 样式
            if (category.uuid == currentCategory) {
                categoryDiv.classList.add('active');
            }
            
            categoryDiv.addEventListener('click', () => {
                this.switchCategory(category.uuid);
            });
            
            this.categoriesContainer.appendChild(categoryDiv);
        });
    }

    switchCategory(uuid) {
        // 更新侧边栏激活状态
        const allCategories = this.categoriesContainer.querySelectorAll('.sidebar-category');
        allCategories.forEach(cat => {
            cat.classList.remove('active');
            if (cat.dataset.categoryId == uuid) {
                cat.classList.add('active');
            }
        });
        
        // 隐藏所有分类面板
        const allPanels = document.querySelectorAll('.category-panel');
        allPanels.forEach(panel => {
            panel.classList.remove('active');
        });
        
        // 显示目标分类面板
        const targetPanel = document.getElementById(`category-${uuid}`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
        
        // 更新当前分类
        categoryManager.setCurrentCategory(uuid);
    }
}

export default new SidebarRenderer();
