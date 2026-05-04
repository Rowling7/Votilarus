// ==================== 性能优化工具函数 ====================

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit = 200) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 请求动画帧包装器
 * @param {Function} func - 要执行的函数
 * @returns {Function} rAF 包装的函数
 */
export function rafWrapper(func) {
    let ticking = false;
    return function executedFunction(...args) {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                func(...args);
                ticking = false;
            });
            ticking = true;
        }
    };
}

/**
 * 批量 DOM 操作
 * @param {Function} callback - 回调函数，接收 DocumentFragment
 * @returns {DocumentFragment} 文档片段
 */
export function batchDOM(callback) {
    const fragment = document.createDocumentFragment();
    callback(fragment);
    return fragment;
}

/**
 * 内存清理工具
 */
export class MemoryCleaner {
    static observers = [];
    
    /**
     * 注册观察器以便后续清理
     */
    static register(observer) {
        this.observers.push(observer);
    }
    
    /**
     * 清理所有观察器
     */
    static cleanup() {
        this.observers.forEach(observer => {
            if (observer && observer.disconnect) {
                observer.disconnect();
            }
        });
        this.observers = [];
    }
}
