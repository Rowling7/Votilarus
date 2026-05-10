// ==================== 日历小组件 ====================

import BaseWidget from './BaseWidget.js';

class CalendarWidget extends BaseWidget {
    /**
     * 构造函数
     * @param {HTMLElement} container - widget 容器元素
     * @param {number|null} widgetId - icon_widgets.id（数字ID）
     */
    constructor(container, widgetId = null) {
        super(container, widgetId, 'CalendarWidget');
        // 日历组件支持多种尺寸
        this.supportedSizes = ['1x1', '1x2', '2x1', '2x2'];
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

        // 启动定时更新
        this.startAutoUpdate();

        return {
            destroy: () => this.destroy()
        };
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

        const lunar = this.solarToLunar(now.getFullYear(), now.getMonth() + 1, now.getDate());
        return `${lunar.month}${lunar.day} ${weekday}`;
    }

    /**
     * 公历转农历（标准算法）
     * @param {number} y - 年份
     * @param {number} m - 月份
     * @param {number} d - 日期
     * @returns {Object} 农历信息
     */
    solarToLunar(y, m, d) {
        const lunarInfo = [
            0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
            0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
            0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
            0x06566, 0x0d4a0, 0x0ea50, 0x16a95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
            0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
            0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
            0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
            0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
            0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
            0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
            0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
            0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
            0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
            0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
            0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
            0x14b63
        ];

        const lunarMonthName = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
        const lunarDayName = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
            '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
            '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];

        // 基准日期：1900-01-31 农历 1900-01-01
        const baseDate = new Date(1900, 0, 31);
        const targetDate = new Date(y, m - 1, d);
        let offset = Math.floor((targetDate - baseDate) / 86400000);

        let lunarY = 1900;
        let temp = 0;
        for (let i = 1900; i < 2100; i++) {
            temp = this.lunarYearDays(i, lunarInfo);
            if (offset < temp) break;
            offset -= temp;
            lunarY = i;
        }

        const leap = this.leapMonth(lunarY, lunarInfo);
        let isLeap = false;
        let lunarM = 1;

        for (let i = 0; i < 13; i++) {
            if (leap > 0 && i === (leap + 1) && !isLeap) {
                --i;
                isLeap = true;
                temp = this.leapDays(lunarY, lunarInfo);
            } else {
                temp = this.monthDays(lunarY, i, lunarInfo);
            }

            if (isLeap && i === (leap + 1)) isLeap = false;

            offset -= temp;
            if (offset < 0) {
                offset += temp;
                lunarM = i + 1;
                break;
            }
        }

        const lunarD = offset + 1;

        return {
            year: lunarY,
            month: (isLeap ? '闰' : '') + lunarMonthName[lunarM - 1] + '月',
            day: lunarDayName[lunarD - 1]
        };
    }

    leapMonth(y, info) {
        return info[y - 1900] & 0xf;
    }

    leapDays(y, info) {
        if (this.leapMonth(y, info)) {
            return (info[y - 1900] & 0x10000) ? 30 : 29;
        }
        return 0;
    }

    monthDays(y, m, info) {
        return (info[y - 1900] & (0x10000 >> m)) ? 30 : 29;
    }

    lunarYearDays(y, info) {
        let sum = 348;
        for (let i = 0x8000; i > 0x8; i >>= 1) {
            sum += (info[y - 1900] & i) ? 1 : 0;
        }
        return sum + this.leapDays(y, info);
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
