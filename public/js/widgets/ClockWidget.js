// ==================== 时钟小组件 ====================

import BaseWidget from './BaseWidget.js';

class ClockWidget extends BaseWidget {
    /**
     * 构造函数
     * @param {HTMLElement} container - widget 容器元素
     * @param {number|null} widgetId - icon_widgets.id（数字ID）
     */
    constructor(container, widgetId = null) {
        super(container, widgetId, 'ClockWidget');
        // 时钟组件只支持 2x2,2x3 和 2x4 尺寸
        this.supportedSizes = ['2x2', '2x3', '2x4'];
    }

    /**
     * 渲染时钟小组件
     */
    render() {
        // 获取当前尺寸
        const currentSize = this.container.closest('.grid-item')?.dataset.size || '2x3';
        const isWideLayout = currentSize === '2x3' || currentSize === '2x4';

        // 创建时钟 DOM 结构
        if (isWideLayout) {
            // 宽屏布局：时分秒在一行
            this.container.innerHTML = `
                <div class="clock-widget">
                    <div class="clock-time-wide">
                        <span class="time-digit">0</span>
                        <span class="time-digit">0</span>
                        <span class="time-separator">:</span>
                        <span class="time-digit">0</span>
                        <span class="time-digit">0</span>
                        <span class="time-separator">:</span>
                        <span class="time-digit">0</span>
                        <span class="time-digit">0</span>
                    </div>
                    <div class="clock-date">YYYY-MM-DD</div>
                    <div class="clock-weekday">星期X</div>
                </div>
            `;
        } else {
            // 默认布局：时分在上，秒在下
            this.container.innerHTML = `
                <div class="clock-widget">
                    <div class="clock-time">
                        <span class="time-digit">0</span>
                        <span class="time-digit">0</span>
                        <span class="time-separator">:</span>
                        <span class="time-digit">0</span>
                        <span class="time-digit">0</span>
                    </div>
                    <div class="clock-seconds">
                        <span class="time-digit">0</span>
                        <span class="time-digit">0</span>
                    </div>
                    <div class="clock-date">YYYY-MM-DD</div>
                    <div class="clock-weekday">星期X</div>
                </div>
            `;
        }

        // 立即更新一次
        this.updateClock();

        // 启动定时器，每秒更新
        this.setInterval(() => {
            this.updateClock();
        }, 1000);

        return {
            destroy: () => this.destroy()
        };
    }

    /**
     * 更新时钟显示
     */
    updateClock() {
        if (this.isDestroyed) return;

        const now = new Date();

        // 检查是否使用宽屏布局
        const timeWideEl = this.container.querySelector('.clock-time-wide');

        if (timeWideEl) {
            // 宽屏布局：时分秒在一行
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const digits = timeWideEl.querySelectorAll('.time-digit');

            // 设置小时数字
            digits[0].textContent = hours[0];
            digits[1].textContent = hours[1];

            // 设置分钟数字
            digits[2].textContent = minutes[0];
            digits[3].textContent = minutes[1];

            // 设置秒钟数字
            digits[4].textContent = seconds[0];
            digits[5].textContent = seconds[1];

            // 为包含7的数字添加特殊样式
            this.applySevenHighlight(digits);
        } else {
            // 默认布局：时分在上，秒在下
            // 更新时:分
            const timeEl = this.container.querySelector('.clock-time');
            if (timeEl) {
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const digits = timeEl.querySelectorAll('.time-digit');

                // 设置小时数字
                digits[0].textContent = hours[0];
                digits[1].textContent = hours[1];

                // 设置分钟数字
                digits[2].textContent = minutes[0];
                digits[3].textContent = minutes[1];

                // 为包含7的数字添加特殊样式
                this.applySevenHighlight(digits);
            }

            // 更新秒数
            const secondsEl = this.container.querySelector('.clock-seconds');
            if (secondsEl) {
                const seconds = String(now.getSeconds()).padStart(2, '0');
                const secDigits = secondsEl.querySelectorAll('.time-digit');

                secDigits[0].textContent = seconds[0];
                secDigits[1].textContent = seconds[1];

                // 为包含7的数字添加特殊样式
                this.applySevenHighlight(secDigits);
            }
        }

        // 更新日期
        const dateEl = this.container.querySelector('.clock-date');
        if (dateEl) {
            dateEl.textContent = now.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        }

        // 更新星期
        const weekdayEl = this.container.querySelector('.clock-weekday');
        if (weekdayEl) {
            const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            weekdayEl.textContent = weekdays[now.getDay()];
        }
    }

    /**
     * 为包含数字7的元素添加高亮样式
     * @param {NodeList} digits - 数字元素集合
     */
    applySevenHighlight(digits) {
        digits.forEach(digit => {
            if (digit.textContent === '7') {
                digit.classList.add('highlight-seven');
            } else {
                digit.classList.remove('highlight-seven');
            }
        });
    }

    /**
     * 刷新时钟显示
     */
    refresh() {
        this.render();
    }
}

export default ClockWidget;
