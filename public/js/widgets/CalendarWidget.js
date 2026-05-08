// ==================== 日历小组件 ====================

import BaseWidget from './BaseWidget.js';

class CalendarWidget extends BaseWidget {
    /**
     * 渲染日历小组件
     */
    render() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const today = now.getDate();

        // 生成日历 HTML
        const calendarHTML = this.generateCalendar(year, month, today);

        // 创建日历 DOM 结构
        this.container.innerHTML = `
            <div class="calendar-widget">
                <div class="calendar-header">${year}年${month + 1}月</div>
                <div class="calendar-days-header">
                    <div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div>
                </div>
                <div class="calendar-days">
                    ${calendarHTML}
                </div>
            </div>
        `;

        return {
            destroy: () => this.destroy()
        };
    }

    /**
     * 生成日历 HTML
     * @param {number} year - 年份
     * @param {number} month - 月份（0-11）
     * @param {number} today - 今天的日期
     * @returns {string} 日历 HTML
     */
    generateCalendar(year, month, today) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let html = '';

        // 填充空白（上月日期）
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }

        // 填充日期
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === today ? 'today' : '';
            html += `<div class="calendar-day ${isToday}">${day}</div>`;
        }

        return html;
    }
}

export default CalendarWidget;
