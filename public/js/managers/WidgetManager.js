// ==================== Widget 管理器 ====================

import ClockWidget from '../widgets/ClockWidget.js';
import CalendarWidget from '../widgets/CalendarWidget.js';
import WeatherWidget from '../widgets/WeatherWidget.js';
import NotebookWidget from '../widgets/NotebookWidget.js';
import SearchWidget from '../widgets/SearchWidget.js';
import HotPointWidget from '../widgets/HotPointWidget.js';
import WorkTimeWidget from '../widgets/WorkTimeWidget.js';
import CompleteLeaveWidget from '../widgets/CompleteLeaveWidget.js';
import YiyanWidget from '../widgets/YiyanWidget.js';
import FolderWidget from '../widgets/FolderWidget.js'; 
import ConsoleWidget from '../widgets/ConsoleWidget.js';
import SettingsWidget from '../widgets/SettingsWidget.js';

class WidgetManager {
    constructor() {
        this.widgetRegistry = new Map();
        this.activeWidgets = new Map(); // 跟踪活跃的 widget 实例
        this.registerDefaultWidgets();
    }

    /**
     * 注册默认 widget
     */
    registerDefaultWidgets() {
        this.register('clock', ClockWidget);
        this.register('calendar', CalendarWidget);
        this.register('weather', WeatherWidget);
        this.register('notebook', NotebookWidget);
        this.register('search', SearchWidget);
        this.register('hotpoint', HotPointWidget);
        this.register('worktime', WorkTimeWidget);
        this.register('compleave', CompleteLeaveWidget);
        this.register('yiyan', YiyanWidget);
        this.register('folder', FolderWidget);
        this.register('console', ConsoleWidget);
        this.register('settings', SettingsWidget);
    }

    /**
     * 注册 widget 类型
     * @param {string} type - widget 类型名称
     * @param {Class} WidgetClass - widget 类
     */
    register(type, WidgetClass) {
        this.widgetRegistry.set(type.toLowerCase(), WidgetClass);
    }

    /**
     * 创建 widget
     * @param {string} type - widget 类型
     * @param {HTMLElement} container - 容器元素
     * @param {number|null} widgetId - icon_widgets.id（数字ID）
     * @param {string|null} titleCn - 中文标题
     * @returns {Object|null} widget 实例或 null
     */
    create(type, container, widgetId = null, titleCn = null) {
        const widgetType = type.toLowerCase();
        const WidgetClass = this.widgetRegistry.get(widgetType);

        if (!WidgetClass) {
            console.warn(`Unknown widget type: ${type}`);
            return null;
        }

        // 设置容器属性
        container.className = 'widget-container';
        container.dataset.widgetId = widgetId;  // 使用 widgetId
        container.dataset.type = widgetType;

        // 创建 widget 实例，传递 widgetId 和 titleCn
        const widget = new WidgetClass(container, widgetId, null, titleCn);
        const result = widget.render();

        // 如果 widget 有 init 方法，则调用它来初始化组件（加载数据）
        if (typeof widget.init === 'function') {
            widget.init();
        }

        // 记录活跃的 widget
        if (widgetId) {
            this.activeWidgets.set(widgetId, widget);  // 使用数字ID
        }

        return result;
    }

    /**
     * 创建 widget 元素（包含 grid-item 容器）
     * @param {string} type - widget 类型
     * @param {string} size - widget 尺寸（如 '2x2'）
     * @param {number|null} widgetId - icon_widgets.id（数字ID）
     * @param {string|null} titleCn - 中文标题（title_cn）
     * @returns {HTMLElement} 完整的 widget grid-item 元素
     */
    createWidgetElement(type, size = '2x2', widgetId = null, titleCn = null) {
        // 创建 grid-item 容器
        const container = document.createElement('div');
        container.className = `grid-item widget-item widget-${size}`;
        container.dataset.type = 'widget';
        container.dataset.widgetType = type.toLowerCase();
        container.dataset.widgetId = widgetId;  // 存储数字ID
        container.dataset.size = size; // 保存尺寸信息，用于右键菜单

        // 创建 widget 内容容器
        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'widget-content';
        container.appendChild(widgetContainer);

        // 使用 WidgetManager 创建 widget，传入 titleCn
        const widgetInstance = this.create(type, widgetContainer, widgetId, titleCn);

        // 将 supportedSizes 保存到 dataset，以便右键菜单可以读取
        if (widgetInstance && widgetInstance.supportedSizes) {
            container.dataset.supportedSizes = JSON.stringify(widgetInstance.supportedSizes);
        }

        // 如果有中文标题，在组件下方添加标题显示
        if (titleCn) {
            const titleDiv = document.createElement('div');
            titleDiv.className = 'widget-title-cn';
            titleDiv.textContent = titleCn;
            titleDiv.title = titleCn; // 完整标题作为 tooltip
            container.appendChild(titleDiv);
        }

        return container;
    }

    /**
     * 销毁 widget
     * @param {number} widgetId - icon_widgets.id（数字ID）
     */
    destroy(widgetId) {
        const widget = this.activeWidgets.get(widgetId);
        if (widget) {
            widget.destroy();
            this.activeWidgets.delete(widgetId);
        }
    }

    /**
     * 销毁所有 widget
     */
    destroyAll() {
        this.activeWidgets.forEach((widget, widgetId) => {
            widget.destroy();
        });
        this.activeWidgets.clear();
    }

    /**
     * 刷新指定 widget
     * @param {number} widgetId - icon_widgets.id（数字ID）
     */
    refresh(widgetId) {
        const widget = this.activeWidgets.get(widgetId);
        if (widget && typeof widget.refresh === 'function') {
            widget.refresh();
        }
    }

    /**
     * 刷新所有 widget
     */
    refreshAll() {
        this.activeWidgets.forEach((widget, widgetId) => {
            if (typeof widget.refresh === 'function') {
                widget.refresh();
            }
        });
    }

    /**
     * 获取已注册的 widget 类型列表
     * @returns {Array<string>} widget 类型列表
     */
    getRegisteredTypes() {
        return Array.from(this.widgetRegistry.keys());
    }

    /**
     * 检查 widget 类型是否已注册
     * @param {string} type - widget 类型
     * @returns {boolean}
     */
    isRegistered(type) {
        return this.widgetRegistry.has(type.toLowerCase());
    }
}

export default new WidgetManager();
