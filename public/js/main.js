// ==================== 应用主入口 ====================

import { registerAllComponents } from './components/index.js';
import settingsManager from './managers/settings-manager.js';
import categoryManager from './managers/category-manager.js';
import iconRenderer from './core/icon-renderer.js';
import sidebarRenderer from './core/sidebar-renderer.js';
import searchHandler from './core/search-handler.js';
import dragHandler from './core/drag-handler.js';
import contextMenuHandler from './core/context-menu-handler.js';
import settingsModalHandler from './core/settings-modal-handler.js';
import dockRenderer from './core/dock-renderer.js';
import iconEditorHandler from './core/icon-editor-handler.js';
import tooltipManager from './core/tooltip-manager.js';
import addIconDialog from './core/add-icon-dialog.js';
import addWidgetDialog from './core/add-widget-dialog.js';

class App {
    constructor() {
        this.init();
    }

    async init() {
        try {
            const totalStartTime = performance.now();
            console.log('🚀 [App] 开始初始化应用');
            
            // 注册 Web Components
            registerAllComponents();
            
            // 初始化设置
            await settingsManager.init();
            
            // 将 settingsManager 暴露到全局，供其他模块使用
            window.settingsManager = settingsManager;
            
            // 初始化分类和数据
            const dataLoadStart = performance.now();
            await categoryManager.init();
            const dataLoadEnd = performance.now();
            console.log(`⏱️ [App] 数据加载耗时: ${(dataLoadEnd - dataLoadStart).toFixed(0)}ms`);
            
            // 将 categoryManager 暴露到全局，供其他模块使用
            window.categoryManager = categoryManager;
            
            // 渲染侧边栏
            sidebarRenderer.render(categoryManager.getCategories());
            
            // 渲染所有图标
            const renderStart = performance.now();
            iconRenderer.renderAllCategories();
            const renderEnd = performance.now();
            console.log(`⏱️ [App] 渲染耗时: ${(renderEnd - renderStart).toFixed(0)}ms`);
            
            // 初始化拖拽功能
            dragHandler.init();
            
            // 初始化右键菜单
            contextMenuHandler.init();
            
            // 初始化设置 Modal
            settingsModalHandler.init();
            
            // 初始化 Dock 栏
            await dockRenderer.init();
            
            // 初始化图标编辑器
            iconEditorHandler.init();
            
            // 初始化 Tooltip
            tooltipManager.init();
            
            // 初始化添加图标对话框
            addIconDialog.init();
            
            // 初始化添加小组件对话框
            addWidgetDialog.init();
            
            // 绑定头像点击事件（打开设置）
            this.bindAvatarClick();
            
            // 设置横向滚动支持（Shift + 滚轮）
            this.setupHorizontalScroll();
            
            const totalEndTime = performance.now();
            console.log(`✅ [App] 应用初始化完成，总耗时: ${(totalEndTime - totalStartTime).toFixed(0)}ms`);
            
        } catch (error) {
            console.error('❌ [App] 初始化失败:', error);
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
                // 获取包含首页的所有可切换分类
                const allCategories = categoryManager.getAllSwitchableCategories();
                const currentUuid = categoryManager.getCurrentCategory();
                const currentIndex = allCategories.findIndex(c => c.uuid == currentUuid);
                
                let nextIndex;
                if (e.deltaY > 0 || e.deltaX > 0) {
                    // 向下或向右滚动 -> 下一个分类
                    nextIndex = (currentIndex + 1) % allCategories.length;
                } else {
                    // 向上或向左滚动 -> 上一个分类
                    nextIndex = (currentIndex - 1 + allCategories.length) % allCategories.length;
                }
                
                // 切换分类
                const nextCategory = allCategories[nextIndex];
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
