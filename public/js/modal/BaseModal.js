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
            draggable: true,      // 是否启用拖拽，默认启用
            dragHandle: null,     // 拖拽手柄选择器，null 时自动检测 [class*="-header"] 的标题栏
            ...options
        };

        this.overlay = null;
        this.modal = null;
        this._isOpen = false;
        this._isMaximized = false; // 最大化状态
        this._handleOverlayClick = null;
        this._handleEscapeKey = null;
        this._originalSize = null; // 保存原始尺寸

        // 拖拽相关状态
        this._isDragging = false;
        this._dragStartX = 0;
        this._dragStartY = 0;
        this._modalStartLeft = 0;
        this._modalStartTop = 0;
        this._translateX = 0;
        this._translateY = 0;
        this._handleDragStart = null;
        this._handleDragMove = null;
        this._handleDragEnd = null;
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
        // 绑定拖拽事件
        this._bindDragEvents();
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

        // 重置拖拽偏移，让模态框居中显示
        this._resetDragPosition();

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
     * 绑定拖拽事件
     * @private
     */
    /**
     * 查找拖拽目标元素（dragTarget）
     * 优先使用 options.dragHandle 选择器，否则自动检测标题栏
     * @returns {HTMLElement|null}
     * @private
     */
    _findDragTarget() {
        if (this.options.dragHandle) {
            return this.modal.querySelector(this.options.dragHandle);
        }
        // 自动检测：查找第一个 class 名包含 "-header" 的子元素
        const headerEl = this.modal.querySelector('[class*="-header"]');
        return headerEl || this.modal;
    }

    /**
     * 绑定拖拽事件
     * @private
     */
    _bindDragEvents() {
        if (!this.options.draggable || !this.modal) return;

        this._handleDragStart = (e) => {
            this._onDragStart(e);
        };

        this._handleDragMove = (e) => {
            this._onDragMove(e);
        };

        this._handleDragEnd = () => {
            this._onDragEnd();
        };

        // 确定拖拽触发元素
        const dragTarget = this._findDragTarget();

        if (dragTarget) {
            dragTarget.style.cursor = 'grab';
            dragTarget.addEventListener('mousedown', this._handleDragStart);
        }
    }

    /**
     * 拖拽开始 - mousedown 事件处理
     * @param {MouseEvent} e
     * @private
     */
    _onDragStart(e) {
        // 最大化状态下不允许拖拽
        if (this._isMaximized) return;

        // 忽略来自交互元素的拖拽（input/textarea/select/button/a）
        const target = e.target;
        if (target.closest('input, textarea, select, button, a, .modal-control-buttons,.map-container, [data-no-drag]')) {
            return;
        }

        // 二次检查：确保拖拽起始点在拖拽手柄范围内
        const dragTarget = this._findDragTarget();
        if (dragTarget && dragTarget !== this.modal && !dragTarget.contains(target)) {
            return;
        }

        this._isDragging = true;

        // 记录鼠标起始位置
        this._dragStartX = e.clientX;
        this._dragStartY = e.clientY;

        // 保存当前累积的 translate 偏移
        this._modalStartLeft = this._translateX;
        this._modalStartTop = this._translateY;

        // 禁止文本选择
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';

        // 给 modal 添加拖拽中的视觉反馈
        this.modal.style.cursor = 'grabbing';
        this.modal.style.transition = 'none';
        this.modal.classList.add('modal-dragging');

        // 全局监听 mousemove 和 mouseup
        document.addEventListener('mousemove', this._handleDragMove);
        document.addEventListener('mouseup', this._handleDragEnd);
    }

    /**
     * 拖拽移动 - mousemove 事件处理
     * @param {MouseEvent} e
     * @private
     */
    _onDragMove(e) {
        if (!this._isDragging) return;

        const deltaX = e.clientX - this._dragStartX;
        const deltaY = e.clientY - this._dragStartY;

        this._translateX = this._modalStartLeft + deltaX;
        this._translateY = this._modalStartTop + deltaY;

        this._applyTransform();
    }

    /**
     * 拖拽结束 - mouseup 事件处理
     * @private
     */
    _onDragEnd() {
        if (!this._isDragging) return;

        this._isDragging = false;

        // 恢复文本选择
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';

        // 移除拖拽中的视觉反馈
        this.modal.style.transition = '';
        this.modal.classList.remove('modal-dragging');

        // 恢复拖拽手柄光标
        const dragTarget = this._findDragTarget();
        if (dragTarget) {
            dragTarget.style.cursor = 'grab';
        }

        // 移除全局监听
        document.removeEventListener('mousemove', this._handleDragMove);
        document.removeEventListener('mouseup', this._handleDragEnd);
    }

    /**
     * 应用 transform 到 modal 元素
     * @private
     */
    _applyTransform() {
        if (this._translateX === 0 && this._translateY === 0) {
            this.modal.style.transform = '';
        } else {
            this.modal.style.transform = `translate(${this._translateX}px, ${this._translateY}px)`;
        }
    }

    /**
     * 重置拖拽偏移
     * @private
     */
    _resetDragPosition() {
        this._translateX = 0;
        this._translateY = 0;
        this._applyTransform();
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
        // 移除拖拽全局监听（安全清理）
        document.removeEventListener('mousemove', this._handleDragMove);
        document.removeEventListener('mouseup', this._handleDragEnd);

        // 移除拖拽 mousedown 监听
        if (this._handleDragStart && this.modal) {
            const dragTarget = this._findDragTarget();
            if (dragTarget) {
                dragTarget.removeEventListener('mousedown', this._handleDragStart);
            }
        }

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
