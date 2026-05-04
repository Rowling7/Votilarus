// ==================== 日历小组件 ====================

class CalendarWidget {
    constructor() {
        this.container = null;
    }

    /**
     * 渲染日历小组件
     */
    render() {
        this.container = document.createElement('div');
        this.container.className = 'widget calendar-widget';
        
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        
        this.container.innerHTML = `
            <div class="calendar-header">
                <div class="calendar-month">${year}年${month + 1}月</div>
            </div>
            <div class="calendar-body" id="calendar-body">
                ${this.generateCalendar(year, month)}
            </div>
        `;
        
        return this.container;
    }

    /**
     * 生成日历 HTML
     */
    generateCalendar(year, month) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date().getDate();
        const isCurrentMonth = new Date().getMonth() === month;
        
        let html = '<div class="calendar-weekdays">';
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        weekdays.forEach(day => {
            html += `<div class="weekday">${day}</div>`;
        });
        html += '</div>';
        
        html += '<div class="calendar-days">';
        
        // 填充空白
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        // 填充日期
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = isCurrentMonth && day === today;
            const className = isToday ? 'calendar-day today' : 'calendar-day';
            html += `<div class="${className}">${day}</div>`;
        }
        
        html += '</div>';
        
        return html;
    }
}

export default new CalendarWidget();
