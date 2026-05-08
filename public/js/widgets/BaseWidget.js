// ==================== Widget 基类 ====================

/**
 * Widget 基类，提供所有 widget 的公共方法
 */
class BaseWidget {
    /**
     * 构造函数
     * @param {HTMLElement} container - widget 容器元素
     */
    constructor(container) {
        this.container = container;
        this.intervalId = null;
        this.isDestroyed = false;
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
