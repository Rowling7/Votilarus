// ==================== Widget 管理器 ====================

import ClockWidget from '../widgets/ClockWidget.js';
import CalendarWidget from '../widgets/CalendarWidget.js';
import WeatherWidget from '../widgets/WeatherWidget.js';

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
     * @returns {Object|null} widget 实例或 null
     */
    create(type, container, widgetId = null) {
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

        // 创建 widget 实例，传递 widgetId
        const widget = new WidgetClass(container, widgetId);
        const result = widget.render();

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
     * @returns {HTMLElement} 完整的 widget grid-item 元素
     */
    createWidgetElement(type, size = '2x2', widgetId = null) {
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

        // 使用 WidgetManager 创建 widget
        const widgetInstance = this.create(type, widgetContainer, widgetId);

        // 将 supportedSizes 保存到 dataset，以便右键菜单可以读取
        if (widgetInstance && widgetInstance.supportedSizes) {
            container.dataset.supportedSizes = JSON.stringify(widgetInstance.supportedSizes);
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
