// ==================== 日历小组件 ====================

import BaseWidget from './BaseWidget.js';
import CalendarModal from '../modal/CalendarModal.js';
import lunarConverter from '../utils/Lunar.js';

class CalendarWidget extends BaseWidget {
    /**
     * 构造函数
     * @param {HTMLElement} container - widget 容器元素
     * @param {number|null} widgetId - icon_widgets.id（数字ID）
     */
    constructor(container, widgetId = null) {
        super(container, widgetId, 'CalendarWidget');
        // 日历组件支持多种尺寸
        this.supportedSizes = ['2x2', '2x3', '2x4'];
        // 当前显示的年月
        this.currentYear = new Date().getFullYear();
        this.currentMonth = new Date().getMonth();
    }

    /**
     * 渲染日历小组件
     */
    render() {
        this.container.innerHTML = `
            <div class="calendar-widget" data-widget-id="${this.widgetId}">
                <div class="calendar-header">
                    <span class="calendar-title">${this.currentYear}年${this.currentMonth + 1}月</span>
                </div>
                <div class="calendar-body">
                    <div class="calendar-date">${new Date().getDate()}</div>
                    <div class="calendar-info">
                        <div class="calendar-day-info">第${this.getDayOfYear()}天 第${this.getWeekNumber()}周</div>
                        <div class="calendar-lunar">${this.getLunarDate()}</div>
                    </div>
                </div>
            </div>
        `;

        // 绑定点击事件，打开日历模态弹窗
        this.bindClickEvent();

        // 启动定时更新
        this.startAutoUpdate();

        return {
            destroy: () => this.destroy()
        };
    }

    /**
     * 绑定点击事件
     */
    bindClickEvent() {
        const widgetEl = this.container.querySelector('.calendar-widget');
        if (widgetEl) {
            widgetEl.addEventListener('click', () => {
                CalendarModal.open();
            });
        }
    }

    /**
     * 更新显示内容
     */
    updateDisplay() {
        const titleEl = this.container.querySelector('.calendar-title');
        if (titleEl) {
            titleEl.textContent = `${this.currentYear}年${this.currentMonth + 1}月`;
        }
    }

    /**
     * 获取年内第几天
     * @returns {number}
     */
    getDayOfYear() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    /**
     * 获取周数
     * @returns {number}
     */
    getWeekNumber() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + start.getDay() + 1) / 7);
    }

    /**
     * 获取农历日期（标准算法）
     * @returns {string}
     */
    getLunarDate() {
        const now = new Date();
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const weekday = weekdays[now.getDay()];

        const lunar = lunarConverter.solarToLunar(now.getFullYear(), now.getMonth() + 1, now.getDate());
        return `${lunar.month}${lunar.day} ${weekday}`;
    }



    /**
     * 启动自动更新
     */
    startAutoUpdate() {
        // 每分钟更新一次时间相关数据
        this.setInterval(() => {
            const now = new Date();
            const dateEl = this.container.querySelector('.calendar-date');
            const infoEl = this.container.querySelector('.calendar-day-info');

            if (dateEl) {
                dateEl.textContent = now.getDate();
            }

            if (infoEl) {
                infoEl.textContent = `第${this.getDayOfYear()}天 第${this.getWeekNumber()}周`;
            }

            // 如果是新年第一天，更新农历显示
            if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
                this.updateLunarDisplay();
            }
        }, 60000); // 60秒更新一次
    }

    /**
     * 更新农历显示
     */
    updateLunarDisplay() {
        const lunarEl = this.container.querySelector('.calendar-lunar');
        if (lunarEl) {
            lunarEl.textContent = this.getLunarDate();
        }
    }

    /**
     * 刷新日历显示
     */
    refresh() {
        // 重新渲染整个日历组件
        this.render();
    }
}

export default CalendarWidget;
