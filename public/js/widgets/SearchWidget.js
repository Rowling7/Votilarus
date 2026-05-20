// ==================== 搜索小组件 ====================

import BaseWidget from './BaseWidget.js';
import searchModal from '../modal/SearchModal.js';

class SearchWidget extends BaseWidget {
    /**
     * 构造函数
     * @param {HTMLElement} container - widget 容器元素
     * @param {number|null} widgetId - icon_widgets.id（数字ID）
     */
    constructor(container, widgetId = null) {
        super(container, widgetId, 'SearchWidget');
        // 搜索组件支持 1x1, 1x2, 2x1, 2x2 尺寸
        this.supportedSizes = ['1x1', '1x2', '2x1', '2x2'];
    }

    /**
     * 渲染搜索小组件
     */
    render() {
        // 获取当前尺寸
        const currentSize = this.container.closest('.grid-item')?.dataset.size || '1x1';

        // 根据尺寸决定显示内容
        if (currentSize === '1x1') {
            // 1x1 尺寸仅显示放大镜图标
            this.container.innerHTML = `
                <div class="search-widget">
                    <div class="search-widget-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    </div>
                </div>
            `;
        } else {
            // 其他尺寸显示图标 + "搜索"文字
            this.container.innerHTML = `
                <div class="search-widget">
                    <div class="search-widget-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    </div>
                    <div class="search-widget-label">搜索</div>
                </div>
            `;
        }

        // 绑定点击事件
        this.container.addEventListener('click', () => {
            this.handleSearchClick();
        });

        return {
            destroy: () => this.destroy()
        };
    }

    /**
     * 处理搜索点击
     */
    handleSearchClick() {
        // 打开搜索模态框
        searchModal.open();
    }

    /**
     * 刷新搜索组件
     */
    refresh() {
        this.render();
    }
}

export default SearchWidget;
