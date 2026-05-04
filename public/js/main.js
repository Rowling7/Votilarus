// ==================== 应用主入口 ====================

import settingsManager from './managers/settings-manager.js';
import categoryManager from './managers/category-manager.js';
import iconRenderer from './core/icon-renderer.js';
import sidebarRenderer from './core/sidebar-renderer.js';
import searchManager from './core/search-manager.js';

class App {
    constructor() {
        this.init();
    }

    async init() {
        try {
            // 初始化设置
            await settingsManager.init();
            
            // 初始化分类和数据
            await categoryManager.init();
            
            // 渲染侧边栏
            const categories = categoryManager.getCategories();
            sidebarRenderer.render(categories);
            
            // 渲染所有图标
            iconRenderer.renderAllCategories();
            
            // 设置横向滚动支持（Shift + 滚轮）
            this.setupHorizontalScroll();
            
            // 设置键盘导航
            this.setupKeyboardNavigation();
            
        } catch (error) {
            // 处理初始化错误
        }
    }

    setupHorizontalScroll() {
        const contentArea = document.getElementById('contentArea');
        
        // Shift + 滚轮横向滚动
        contentArea.addEventListener('wheel', (e) => {
            if (e.shiftKey) {
                e.preventDefault();
                contentArea.scrollLeft += e.deltaY;
            }
        });
        
        // 监听滚动事件，更新侧边栏激活状态
        let scrollTimeout;
        contentArea.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.updateActiveCategoryOnScroll();
            }, 100);
        });
    }

    updateActiveCategoryOnScroll() {
        const contentArea = document.getElementById('contentArea');
        const panels = contentArea.querySelectorAll('.category-panel');
        const scrollLeft = contentArea.scrollLeft;
        
        let activePanel = null;
        let minDistance = Infinity;
        
        panels.forEach(panel => {
            const panelLeft = panel.offsetLeft - contentArea.offsetLeft;
            const distance = Math.abs(panelLeft - scrollLeft);
            
            if (distance < minDistance) {
                minDistance = distance;
                activePanel = panel;
            }
        });
        
        if (activePanel) {
            const categoryId = activePanel.dataset.categoryId;
            categoryManager.setCurrentCategory(categoryId);
            
            // 更新侧边栏激活状态
            const sidebarCategories = document.querySelectorAll('.sidebar-category');
            sidebarCategories.forEach(cat => {
                cat.classList.remove('active');
                if (cat.dataset.categoryId == categoryId) {
                    cat.classList.add('active');
                }
            });
        }
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
