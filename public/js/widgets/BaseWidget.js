// ==================== Widget 基类 ====================

/**
 * Widget 基类，提供所有 widget 的公共方法
 */
class BaseWidget {
    /**
     * 构造函数
     * @param {HTMLElement} container - widget 容器元素
     * @param {number|null} widgetId - icon_widgets.id（数字ID）
     * @param {string|null} widgetName - 组件名称，如 "ClockWidget"
     */
    constructor(container, widgetId = null, widgetName = null) {
        this.container = container;
        this.widgetId = widgetId;        // icon_widgets.id（数字ID）
        this.widgetName = widgetName;    // 如 "ClockWidget"
        this.title = widgetName;         // 显示标题
        this.intervalId = null;
        this.isDestroyed = false;
        // 默认支持所有尺寸，子类可以覆盖此属性
        this.supportedSizes = [
            '1x1', '1x2', '1x3', '1x4',
            '2x1', '2x2', '2x3', '2x4'
        ];
    }

    /**
     * 渲染 widget（子类必须实现）
     * @returns {Object} 包含 destroy 方法的对象
     */
    render() {
        throw new Error('BaseWidget.render() must be implemented by subclass');
    }

    /**
     * 更新 widget（可选实现）
     */
    update() {
        // 默认不执行任何操作
    }

    /**
     * 刷新 widget（子类可以实现具体逻辑）
     */
    refresh() {
        // 默认调用update方法，子类可以覆盖此方法实现特定刷新逻辑
        this.update();
    }

    /**
     * 销毁 widget，清理定时器和资源
     */
    destroy() {
        if (this.isDestroyed) return;

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.isDestroyed = true;
    }

    /**
     * 设置定时器
     * @param {Function} callback - 回调函数
     * @param {number} interval - 间隔时间（毫秒）
     */
    setInterval(callback, interval) {
        this.intervalId = setInterval(callback, interval);
    }
}

export default BaseWidget;
