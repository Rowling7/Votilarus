// ==================== Toast 提示组件 ====================

class Toast {
    constructor() {
        this.container = null;
        this.toasts = [];
    }

    /**
     * 初始化 Toast 容器
     */
    init() {
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        this.container.id = 'toast-container';

        // 添加到页面
        document.body.appendChild(this.container);
    }

    /**
     * 显示 Toast 提示
     * @param {string} message - 提示信息
     * @param {string} type - 类型: success, error, warning, info
     * @param {number} duration - 显示时长（毫秒）
     * @param {Object} options - 可选配置 { showUndo: boolean, onUndo: function }
     */
    show(message, type = 'info', duration = 3000, options = {}) {
        this.init();

        // 创建 Toast 元素
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        // 如果有撤销按钮，添加撤销按钮
        const undoButton = options.showUndo ?
            '<button class="toast-undo-btn">撤销</button>' : '';

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
            ${undoButton}
            <button class="toast-close" aria-label="关闭">×</button>
        `;

        // 添加到容器
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // 绑定关闭按钮
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeToast(toast);
        });

        // 绑定撤销按钮
        if (options.showUndo && options.onUndo) {
            const undoBtn = toast.querySelector('.toast-undo-btn');
            undoBtn.addEventListener('click', () => {
                options.onUndo();
                this.removeToast(toast);
            });
        }

        // 自动消失（默认3秒）
        const autoHideDuration = duration > 0 ? duration : 3000;
        setTimeout(() => {
            this.removeToast(toast);
        }, autoHideDuration);

        return toast;
    }

    /**
     * 移除 Toast
     */
    removeToast(toast) {
        toast.classList.add('toast-hide');

        // 动画结束后移除 DOM
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            this.toasts = this.toasts.filter(t => t !== toast);
        }, 300);
    }

    /**
     * 成功提示
     */
    success(message, duration = 3000, options = {}) {
        return this.show(message, 'success', duration, options);
    }

    /**
     * 错误提示
     */
    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    /**
     * 警告提示
     */
    warning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    }

    /**
     * 信息提示
     */
    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }

    /**
     * 清除所有 Toast
     */
    clear() {
        this.toasts.forEach(toast => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
        this.toasts = [];
    }
}

// 创建全局单例
const toast = new Toast();

// 添加 Toast 样式
const style = document.createElement('style');
style.textContent = `
    .toast-container {
        position: fixed;
        top: 2rem;
        right: 2rem;
        z-index: 10001;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        max-width: 400px;
    }

    .toast {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        background: var(--bg-primary, #1a1a1a);
        border-radius: 0.75rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        animation: toast-in 0.3s ease;
        transition: all 0.3s ease;
    }

    .toast-hide {
        opacity: 0;
        transform: translateX(100%);
    }

    .toast-success {
        border-left: 4px solid #10b981;
    }

    .toast-error {
        border-left: 4px solid #ef4444;
    }

    .toast-warning {
        border-left: 4px solid #f59e0b;
    }

    .toast-info {
        border-left: 4px solid #3b82f6;
    }

    .toast-icon {
        font-size: 1.25rem;
        flex-shrink: 0;
    }

    .toast-message {
        flex: 1;
        color: var(--text-primary, white);
        font-size: 0.95rem;
        line-height: 1.5;
    }

    .toast-close {
        width: 24px;
        height: 24px;
        border: none;
        background: transparent;
        color: var(--text-tertiary, rgba(255, 255, 255, 0.6));
        font-size: 1.25rem;
        cursor: pointer;
        border-radius: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }

    .toast-close:hover {
        background: var(--bg-secondary, rgba(255, 255, 255, 0.1));
        color: var(--text-primary, white);
    }

    .toast-undo-btn {
        padding: 0.4rem 0.8rem;
        background: var(--theme-color, #3b82f6);
        color: white;
        border: none;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 500;
    }

    .toast-undo-btn:hover {
        opacity: 0.9;
        transform: scale(1.05);
    }

    .toast-undo-btn:active {
        transform: scale(0.95);
    }

    @keyframes toast-in {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    /* 移动端适配 */
    @media (max-width: 768px) {
        .toast-container {
            top: auto;
            bottom: 2rem;
            right: 1rem;
            left: 1rem;
            max-width: none;
        }

        .toast {
            width: 100%;
        }
    }
`;
document.head.appendChild(style);

export default toast;
