// ==================== 历史记录小组件 ====================

import BaseWidget from './BaseWidget.js';
import HistoryViewModal from '../modal/HistoryViewModal.js';

class HistoryWidget extends BaseWidget {
    /**
     * 构造函数
     * @param {HTMLElement} container - widget 容器元素
     * @param {number|null} widgetId - icon_widgets.id（数字ID）
     */
    constructor(container, widgetId = null) {
        super(container, widgetId, 'HistoryWidget');
        // 支持 1x1, 1x2, 2x1, 2x2 四种尺寸
        this.supportedSizes = ['1x1', '1x2', '2x1', '2x2'];
    }

    /**
     * 初始化组件
     */
    init() {
        if (!this.container) {
            console.error('HistoryWidget: 容器未找到');
            return;
        }
        this.render();
    }

    /**
     * 渲染历史记录小组件
     */
    render() {
        this.container.innerHTML = `
            <div class="history-widget" title="查看历史记录">
                <div class="history-widget-icon">🌐</div>
            </div>
        `;

        // 绑定点击事件
        const widgetEl = this.container.querySelector('.history-widget');
        widgetEl.addEventListener('click', (e) => {
            e.stopPropagation();
            HistoryViewModal.open();
        });

        return { destroy: () => this.destroy() };
    }

    /**
     * 销毁组件
     */
    destroy() {
        super.destroy();
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

export default HistoryWidget;