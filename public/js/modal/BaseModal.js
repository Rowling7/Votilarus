// ==================== Modal 基类 ====================

/**
 * Modal 基类，提供所有模态框的公共方法
 */
class BaseModal {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     * @param {string} options.overlayClass - 遮罩层 CSS 类名
     * @param {string} options.modalClass - 模态框主体 CSS 类名
     * @param {boolean} options.closeOnOverlayClick - 是否允许点击遮罩层关闭，默认 true
     * @param {boolean} options.closeOnEscape - 是否允许按 ESC 键关闭，默认 true
     */
    constructor(options = {}) {
        this.options = {
            overlayClass: 'modal-overlay',
            modalClass: 'modal',
            closeOnOverlayClick: true,
            closeOnEscape: true,
            enableMaximize: true, // 是否启用最大化功能
            ...options
        };

        this.overlay = null;
        this.modal = null;
        this._isOpen = false;
        this._isMaximized = false; // 最大化状态
        this._handleOverlayClick = null;
        this._handleEscapeKey = null;
        this._originalSize = null; // 保存原始尺寸
    }

    /**
     * 初始化模态框（子类必须实现）
     */
    init() {
        throw new Error('BaseModal.init() must be implemented by subclass');
    }

    /**
     * 渲染模态框 HTML（子类必须实现）
     */
    renderModal() {
        throw new Error('BaseModal.renderModal() must be implemented by subclass');
    }

    /**
     * 渲染控制按钮后调用（子类可以覆盖此方法添加自定义事件）
     */
    bindEvents() {
        // 渲染悬浮控制按钮
        this._renderControlButtons();
        // 绑定通用事件
        this._bindCommonEvents();
    }

    /**
     * 渲染悬浮控制按钮（最大化和关闭）
     * @private
     */
    _renderControlButtons() {
        // 创建控制按钮容器
        const controlContainer = document.createElement('div');
        controlContainer.className = 'modal-control-buttons';

        // 最大化按钮（如果启用）
        if (this.options.enableMaximize) {
            const maximizeBtn = document.createElement('button');
            maximizeBtn.className = 'modal-control-btn modal-maximize-btn';
            maximizeBtn.innerHTML = '⛶';
            maximizeBtn.title = '最大化';
            maximizeBtn.setAttribute('aria-label', '最大化');

            maximizeBtn.addEventListener('click', () => {
                this.toggleMaximize();
            });

            controlContainer.appendChild(maximizeBtn);
            this.maximizeBtn = maximizeBtn;
        }

        // 关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-control-btn modal-close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.title = '关闭';
        closeBtn.setAttribute('aria-label', '关闭');

        closeBtn.addEventListener('click', () => {
            this.close();
        });

        controlContainer.appendChild(closeBtn);
        this.controlContainer = controlContainer;
        this.closeBtn = closeBtn;

        // 将控制按钮添加到 modal（而不是 overlay）
        this.modal.appendChild(controlContainer);
    }

    /**
     * 绑定通用事件
     * @private
     */
    _bindCommonEvents() {
        // 点击遮罩层关闭
        if (this.options.closeOnOverlayClick) {
            this._handleOverlayClick = (e) => {
                if (e.target === this.overlay) {
                    this.close();
                }
            };
            this.overlay.addEventListener('click', this._handleOverlayClick);
        }

        // ESC 键关闭
        if (this.options.closeOnEscape) {
            this._handleEscapeKey = (e) => {
                if (e.key === 'Escape' && this._isOpen) {
                    this.close();
                }
            };
            document.addEventListener('keydown', this._handleEscapeKey);
        }
    }

    /**
     * 打开模态框（子类可以覆盖此方法添加自定义逻辑）
     */
    async open() {
        if (this._isOpen) return;

        // 重置最大化状态
        if (this._isMaximized) {
            this._restoreFromMaximize();
        }

        // 显示模态框
        this.overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        this._isOpen = true;
    }

    /**
     * 关闭模态框
     */
    close() {
        if (!this._isOpen) return;

        // 如果处于最大化状态，先还原
        if (this._isMaximized) {
            this._restoreFromMaximize();
        }

        // 隐藏模态框
        this.overlay.classList.add('hidden');
        document.body.style.overflow = '';
        this._isOpen = false;
    }

    /**
     * 切换最大化状态
     */
    toggleMaximize() {
        if (!this.options.enableMaximize) return;

        if (this._isMaximized) {
            this._restoreFromMaximize();
        } else {
            this._maximize();
        }
    }

    /**
     * 最大化模态框
     * @private
     */
    _maximize() {
        if (!this.modal) return;

        // 保存原始尺寸和位置
        this._originalSize = {
            width: this.modal.style.width || '',
            height: this.modal.style.height || '',
            maxWidth: this.modal.style.maxWidth || '',
            maxHeight: this.modal.style.maxHeight || '',
            transform: this.modal.style.transform || ''
        };

        // 应用最大化样式
        this.modal.classList.add('modal-maximized');
        this._isMaximized = true;

        // 更新按钮图标和提示
        if (this.maximizeBtn) {
            this.maximizeBtn.innerHTML = '❐';
            this.maximizeBtn.title = '还原';
        }
    }

    /**
     * 从最大化状态还原
     * @private
     */
    _restoreFromMaximize() {
        if (!this.modal || !this._originalSize) return;

        // 移除最大化样式
        this.modal.classList.remove('modal-maximized');

        // 恢复原始尺寸
        this.modal.style.width = this._originalSize.width;
        this.modal.style.height = this._originalSize.height;
        this.modal.style.maxWidth = this._originalSize.maxWidth;
        this.modal.style.maxHeight = this._originalSize.maxHeight;
        this.modal.style.transform = this._originalSize.transform;

        this._isMaximized = false;
        this._originalSize = null;

        // 更新按钮图标和提示
        if (this.maximizeBtn) {
            this.maximizeBtn.innerHTML = '⛶';
            this.maximizeBtn.title = '最大化';
        }
    }

    /**
     * 检查模态框是否打开
     * @returns {boolean}
     */
    isOpen() {
        return this._isOpen;
    }

    /**
     * 销毁模态框，清理事件监听和资源
     */
    destroy() {
        // 移除事件监听
        if (this._handleOverlayClick && this.overlay) {
            this.overlay.removeEventListener('click', this._handleOverlayClick);
        }

        if (this._handleEscapeKey) {
            document.removeEventListener('keydown', this._handleEscapeKey);
        }

        // 移除 DOM 元素
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }

        this.overlay = null;
        this.modal = null;
        this._isOpen = false;
    }
}

export default BaseModal;
