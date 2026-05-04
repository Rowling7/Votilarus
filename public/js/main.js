// ==================== 应用主入口 ====================

import settingsManager from './managers/settings-manager.js';
import categoryManager from './managers/category-manager.js';
import iconRenderer from './core/icon-renderer.js';
import sidebarRenderer from './core/sidebar-renderer.js';
import searchHandler from './core/search-handler.js';
import dragHandler from './core/drag-handler.js';
import contextMenuHandler from './core/context-menu-handler.js';
import settingsModalHandler from './core/settings-modal-handler.js';

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
            
            // 初始化拖拽功能
            dragHandler.init();
            
            // 初始化右键菜单
            contextMenuHandler.init();
            
            // 初始化设置 Modal
            settingsModalHandler.init();
            
            // 绑定头像点击事件（打开设置）
            this.bindAvatarClick();
            
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
        
        // 鼠标滚轮实现左右切换分类
        let scrollTimeout;
        contentArea.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            // 防抖处理
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const categories = categoryManager.getCategories();
                const currentUuid = categoryManager.getCurrentCategory();
                const currentIndex = categories.findIndex(c => c.uuid == currentUuid);
                
                let nextIndex;
                if (e.deltaY > 0 || e.deltaX > 0) {
                    // 向下或向右滚动 -> 下一个分类
                    nextIndex = (currentIndex + 1) % categories.length;
                } else {
                    // 向上或向左滚动 -> 上一个分类
                    nextIndex = (currentIndex - 1 + categories.length) % categories.length;
                }
                
                // 切换分类
                const nextCategory = categories[nextIndex];
                sidebarRenderer.switchCategory(nextCategory.uuid);
            }, 50);
        });
    }

    updateActiveCategoryOnScroll() {
        // 此方法不再需要，因为现在使用显示/隐藏切换
    }

    /**
     * 绑定头像点击事件
     */
    bindAvatarClick() {
        const avatar = document.querySelector('.sidebar-avatar');
        if (avatar) {
            avatar.addEventListener('click', () => {
                settingsModalHandler.open();
            });
        }
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
