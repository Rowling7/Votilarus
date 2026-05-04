// ==================== 侧边栏渲染器 ====================

import categoryManager from '../managers/category-manager.js';

class SidebarRenderer {
    constructor() {
        this.categoriesContainer = document.getElementById('categories');
    }

    render(categories) {
        this.categoriesContainer.innerHTML = '';
        
        categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'sidebar-category';
            // 显示 aindex 字段
            categoryDiv.textContent = category.aindex;
            categoryDiv.dataset.categoryId = category.uuid;
            
            if (category.uuid == categoryManager.getCurrentCategory()) {
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
