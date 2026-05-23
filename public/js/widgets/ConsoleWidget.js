// ==================== 控制台小组件 ====================

import BaseWidget from './BaseWidget.js';
import consoleModal from '../modal/ConsoleModal.js';

class ConsoleWidget extends BaseWidget {
    /**
     * 构造函数
     * @param {HTMLElement} container - widget 容器元素
     * @param {number|null} widgetId - icon_widgets.id（数字ID）
     */
    constructor(container, widgetId = null) {
        super(container, widgetId, 'ConsoleWidget');
        // 控制台组件仅支持 1x1 尺寸
        this.supportedSizes = ['1x1'];
    }

    /**
     * 渲染控制台小组件
     */
    render() {
        this.container.innerHTML = `
            <div class="console-widget">
                <div class="console-widget-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="4 17 10 11 4 5"></polyline>
                        <line x1="12" y1="19" x2="20" y2="19"></line>
                    </svg>
                </div>
            </div>
        `;

        // 绑定点击事件
        this.container.addEventListener('click', () => {
            this.handleConsoleClick();
        });

        return {
            destroy: () => this.destroy()
        };
    }

    /**
     * 处理控制台点击
     */
    handleConsoleClick() {
        consoleModal.open();
    }

    /**
     * 刷新控制台组件
     */
    refresh() {
        this.render();
    }
}

export default ConsoleWidget;