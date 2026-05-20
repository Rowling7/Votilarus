// ==================== 应用主入口 ====================

import { registerAllComponents } from './components/index.js';
import SettingsManager from './managers/SettingsManager.js';
import CategoryManager from './managers/CategoryManager.js';
import WidgetManager from './managers/WidgetManager.js';
import ModalManager from './managers/ModalManager.js';
import IconRenderer from './core/renderers/IconRenderer.js';
import SidebarRenderer from './core/renderers/SidebarRenderer.js';
import SearchHandler from './core/handlers/SearchHandler.js';
import DragHandler from './core/handlers/DragHandler.js';
import ContextMenuHandler from './core/handlers/ContextMenuHandler.js';
import SettingsModalHandler from './core/handlers/SettingsModalHandler.js';
import DockRenderer from './core/renderers/DockRenderer.js';
import IconEditorHandler from './core/handlers/IconEditorHandler.js';
import TooltipManager from './managers/TooltipManager.js';
import AddIconDialog from './dialogs/AddIconDialog.js';
import AddWidgetDialog from './dialogs/AddWidgetDialog.js';
import NavSidebar from './components/NavSidebar.js';

// 将 ModalManager 暴露到全局
window.modalManager = ModalManager;

// 将 ContextMenuHandler 暴露到全局，供 SearchModal 使用
window.ContextMenuHandler = ContextMenuHandler;

class App {
    constructor() {
        this.init();
    }

    async init() {
        try {
            const totalStartTime = performance.now();

            // 注入侧边栏样式（从 NavSidebar 组件）
            NavSidebar.injectStyles();

            // 注册 Web Components
            registerAllComponents();

            // 初始化设置
            await SettingsManager.init();

            // 将 SettingsManager 暴露到全局，供其他模块使用
            window.settingsManager = SettingsManager;

            // 初始化搜索处理器（需要在 SettingsManager 之后）
            await SearchHandler.init();

            // 初始化分类和数据
            const dataLoadStart = performance.now();
            await CategoryManager.init();
            const dataLoadEnd = performance.now();

            // 将 CategoryManager 暴露到全局，供其他模块使用
            window.categoryManager = CategoryManager;

            // 将 WidgetManager 暴露到全局，供其他模块使用
            window.widgetManager = WidgetManager;

            // 渲染侧边栏
            SidebarRenderer.render(CategoryManager.getCategories());

            // 渲染所有图标
            const renderStart = performance.now();
            await IconRenderer.renderAllCategories();
            const renderEnd = performance.now();

            // 初始化拖拽功能
            DragHandler.init();

            // 初始化右键菜单
            ContextMenuHandler.init();

            // 初始化设置 Modal
            SettingsModalHandler.init();

            // 初始化 Dock 栏
            await DockRenderer.init();

            // 初始化图标编辑器
            IconEditorHandler.init();

            // 初始化 Tooltip
            TooltipManager.init();

            // 初始化添加图标对话框
            AddIconDialog.init();

            // 初始化添加小组件对话框
            AddWidgetDialog.init();

            // 日历模态弹窗已在构造函数中自动初始化（单例模式）
            // CalendarModal.init();

            // 绑定头像点击事件（打开设置）
            this.bindAvatarClick();

            // 设置横向滚动支持（Shift + 滚轮）
            this.setupHorizontalScroll();

            const totalEndTime = performance.now();
        } catch (error) {
            // 静默处理初始化错误
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
                const allCategories = CategoryManager.getAllSwitchableCategories();
                const currentUuid = CategoryManager.getCurrentCategory();
                const currentIndex = allCategories.findIndex(c => c.id == currentUuid);

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
                SidebarRenderer.switchCategory(nextCategory.id);
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
                SettingsModalHandler.open();
            });
        }
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
