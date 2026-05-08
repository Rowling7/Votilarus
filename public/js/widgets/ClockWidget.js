// ==================== 时钟小组件 ====================

import BaseWidget from './BaseWidget.js';

class ClockWidget extends BaseWidget {
    /**
     * 渲染时钟小组件
     */
    render() {
        // 创建时钟 DOM 结构
        this.container.innerHTML = `
            <div class="clock-widget">
                <div class="clock-time">00:00:00</div>
                <div class="clock-date">YYYY-MM-DD</div>
                <div class="clock-weekday">星期X</div>
            </div>
        `;

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

        // 更新时间
        const timeEl = this.container.querySelector('.clock-time');
        if (timeEl) {
            timeEl.textContent = now.toLocaleTimeString('zh-CN', { hour12: false });
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
}

export default ClockWidget;
