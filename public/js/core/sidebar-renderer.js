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
            categoryDiv.textContent = category.name;
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
        // 更新激活状态
        const allCategories = this.categoriesContainer.querySelectorAll('.sidebar-category');
        allCategories.forEach(cat => {
            cat.classList.remove('active');
            if (cat.dataset.categoryId == uuid) {
                cat.classList.add('active');
            }
        });
        
        // 滚动到对应分类面板
        const panel = document.getElementById(`category-${uuid}`);
        if (panel) {
            const contentArea = document.getElementById('contentArea');
            const scrollLeft = panel.offsetLeft - contentArea.offsetLeft - 50;
            contentArea.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
        
        // 更新当前分类
        categoryManager.setCurrentCategory(uuid);
    }
}

export default new SidebarRenderer();
