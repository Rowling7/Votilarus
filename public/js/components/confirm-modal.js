// ==================== ConfirmModal Web Component ====================

class ConfirmModal extends HTMLElement {
    static get observedAttributes() {
        return ['visible', 'title', 'message', 'confirm-text', 'cancel-text', 'type'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.resolvePromise = null;
        this.isRendered = false;
        this.render();
    }

    connectedCallback() {
        if (!this.isRendered) {
            this.bindEvents();
            this.isRendered = true;
        }
    }

    disconnectedCallback() {
        // 清理事件监听器
        if (this.resolvePromise) {
            this.resolvePromise(false);
            this.resolvePromise = null;
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && name === 'visible') {
            this.updateVisibility(newValue === 'true');
        }
    }

    /**
     * 更新可见性（不重新渲染整个 DOM）
     */
    updateVisibility(visible) {
        const overlay = this.shadowRoot.querySelector('.modal-overlay');
        if (overlay) {
            if (visible) {
                overlay.classList.add('visible');
            } else {
                overlay.classList.remove('visible');
            }
        }
    }

    render() {
        const visible = this.getAttribute('visible') === 'true';
        const title = this.getAttribute('title') || '确认';
        const message = this.getAttribute('message') || '确定要执行此操作吗？';
        const confirmText = this.getAttribute('confirm-text') || '确定';
        const cancelText = this.getAttribute('cancel-text') || '取消';
        const type = this.getAttribute('type') || 'default'; // default, danger, warning, info

        // 根据类型设置图标和颜色
        const typeConfig = {
            default: { icon: '❓', color: '#667eea' },
            danger: { icon: '⚠️', color: '#ef4444' },
            warning: { icon: '⚠️', color: '#f59e0b' },
            info: { icon: 'ℹ️', color: '#3b82f6' }
        };

        const config = typeConfig[type] || typeConfig.default;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    z-index: 10000;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.3s ease, visibility 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .modal-overlay.visible {
                    opacity: 1;
                    visibility: visible;
                }

                .modal-container {
                    background: var(--bg-primary, #1a1a1a);
                    border-radius: 1rem;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                    width: 90%;
                    max-width: 420px;
                    padding: 2rem;
                    transform: scale(0.9) translateY(-20px);
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
                }

                .modal-overlay.visible .modal-container {
                    transform: scale(1) translateY(0);
                }

                .modal-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .modal-icon {
                    font-size: 2.5rem;
                    flex-shrink: 0;
                }

                .modal-title {
                    font-size: 1.25rem;
                    font-weight: bold;
                    color: var(--text-primary, #ffffff);
                    margin: 0;
                    flex: 1;
                }

                .modal-message {
                    color: var(--text-secondary, rgba(255, 255, 255, 0.8));
                    font-size: 0.95rem;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                    white-space: pre-line;
                }

                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                }

                .modal-btn {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 0.5rem;
                    font-size: 0.95rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    min-width: 80px;
                }

                .modal-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }

                .modal-btn:active {
                    transform: translateY(0);
                }

                .modal-btn.cancel {
                    background: var(--bg-secondary, rgba(255, 255, 255, 0.1));
                    color: var(--text-primary, white);
                    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
                }

                .modal-btn.cancel:hover {
                    background: var(--bg-tertiary, rgba(255, 255, 255, 0.15));
                }

                .modal-btn.confirm {
                    background: ${config.color};
                    color: white;
                }

                .modal-btn.confirm:hover {
                    opacity: 0.9;
                }

                .modal-btn.confirm.danger {
                    background: #ef4444;
                }

                .modal-btn.confirm.warning {
                    background: #f59e0b;
                }

                .modal-btn.confirm.info {
                    background: #3b82f6;
                }

                /* 键盘焦点样式 */
                .modal-btn:focus {
                    outline: 2px solid ${config.color};
                    outline-offset: 2px;
                }
            </style>
            <div class="modal-overlay ${visible ? 'visible' : ''}">
                <div class="modal-container">
                    <div class="modal-header">
                        <div class="modal-icon">${config.icon}</div>
                        <h3 class="modal-title">${title}</h3>
                    </div>
                    <div class="modal-message">${message}</div>
                    <div class="modal-footer">
                        <button class="modal-btn cancel" id="cancel-btn">${cancelText}</button>
                        <button class="modal-btn confirm ${type}" id="confirm-btn">${confirmText}</button>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const overlay = this.shadowRoot.querySelector('.modal-overlay');
        const cancelBtn = this.shadowRoot.querySelector('#cancel-btn');
        const confirmBtn = this.shadowRoot.querySelector('#confirm-btn');

        // 取消按钮
        cancelBtn.addEventListener('click', () => {
            this.close(false);
        });

        // 确认按钮
        confirmBtn.addEventListener('click', () => {
            this.close(true);
        });

        // 点击遮罩关闭
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.close(false);
            }
        });

        // ESC 键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.getAttribute('visible') === 'true') {
                this.close(false);
            }
        });
    }

    /**
     * 显示确认弹窗
     * @returns {Promise<boolean>} 用户选择的结果
     */
    show() {
        return new Promise((resolve) => {
            this.resolvePromise = resolve;
            this.setAttribute('visible', 'true');
            
            // 派发打开事件
            this.dispatchEvent(new CustomEvent('confirm-open', {
                bubbles: true
            }));

            // 自动聚焦确认按钮
            setTimeout(() => {
                const confirmBtn = this.shadowRoot.querySelector('#confirm-btn');
                if (confirmBtn) confirmBtn.focus();
            }, 100);
        });
    }

    /**
     * 关闭确认弹窗
     * @param {boolean} result - 用户的选择结果
     */
    close(result) {
        this.setAttribute('visible', 'false');
        
        // 派发关闭事件
        this.dispatchEvent(new CustomEvent('confirm-close', {
            bubbles: true,
            detail: { result }
        }));

        // 解析 Promise
        if (this.resolvePromise) {
            this.resolvePromise(result);
            this.resolvePromise = null;
        }
    }

    /**
     * 静态方法：快速显示确认弹窗
     * @param {Object} options - 配置选项
     * @returns {Promise<boolean>}
     */
    static async show(options = {}) {
        const {
            title = '确认',
            message = '确定要执行此操作吗？',
            confirmText = '确定',
            cancelText = '取消',
            type = 'default'
        } = options;

        // 创建弹窗实例
        const modal = document.createElement('confirm-modal');

        // 添加到页面（触发 connectedCallback）
        document.body.appendChild(modal);

        // 等待组件准备好后再设置属性
        await new Promise(resolve => setTimeout(resolve, 0));

        // 设置属性（此时 Shadow DOM 已渲染）
        modal.setAttribute('title', title);
        modal.setAttribute('message', message);
        modal.setAttribute('confirm-text', confirmText);
        modal.setAttribute('cancel-text', cancelText);
        modal.setAttribute('type', type);

        // 再次等待 render 完成
        await new Promise(resolve => setTimeout(resolve, 0));

        // 显示并等待结果
        const result = await modal.show();

        // 移除弹窗
        modal.remove();

        return result;
    }
}

// 注册自定义元素
customElements.define('confirm-modal', ConfirmModal);

export default ConfirmModal;
