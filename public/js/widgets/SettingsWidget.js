// ==================== 设置小组件 ====================

import BaseWidget from './BaseWidget.js';
import SettingsModalHandler from '../core/handlers/SettingsModalHandler.js';

class SettingsWidget extends BaseWidget {
    /**
     * 构造函数
     * @param {HTMLElement} container - widget 容器元素
     * @param {number|null} widgetId - icon_widgets.id（数字ID）
     */
    constructor(container, widgetId = null) {
        super(container, widgetId, 'SettingsWidget');
        // 设置组件仅支持 1x1 尺寸
        this.supportedSizes = ['1x1', '2x2'];
    }

    /**
     * 渲染设置小组件
     */
    render() {
        this.container.innerHTML = `
            <div class="settings-widget">
                <div class="settings-widget-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                </div>
            </div>
        `;

        // 绑定点击事件
        this.container.addEventListener('click', () => {
            this.handleSettingsClick();
        });

        return {
            destroy: () => this.destroy()
        };
    }

    /**
     * 处理设置点击 - 打开设置模态框
     */
    handleSettingsClick() {
        SettingsModalHandler.open();
    }

    /**
     * 刷新设置组件
     */
    refresh() {
        this.render();
    }
}

export default SettingsWidget;