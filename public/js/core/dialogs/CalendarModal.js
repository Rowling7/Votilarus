// ==================== 日历模态弹窗 ====================

class CalendarModal {
    constructor() {
        this.currentYear = new Date().getFullYear();
        this.currentMonth = new Date().getMonth();
        this.today = new Date();
        this.holidays = [];
        this.overlay = null;
        this.modal = null;
        this.yearPicker = null;
        this.isYearPickerVisible = false;
        this.lunarInfo = null;
    }

    /**
     * 初始化模态弹窗
     */
    init() {
        this.renderModal();
        this.bindEvents();
    }

    /**
     * 渲染模态弹窗 HTML
     */
    renderModal() {
        // 创建遮罩层
        this.overlay = document.createElement('div');
        this.overlay.className = 'calendar-modal-overlay';
        this.overlay.id = 'calendarModalOverlay';

        // 创建模态框
        this.modal = document.createElement('div');
        this.modal.className = 'calendar-modal';
        this.modal.id = 'calendarModal';

        // 渲染内容
        this.modal.innerHTML = `
            <div class="calendar-modal-header">
                <div class="calendar-modal-title-section">
                    <div class="calendar-modal-month-year" id="calendarModalMonthYear">
                        <span id="calendarModalTitle">${this.currentYear}年${this.currentMonth + 1}月</span>
                        <span class="calendar-modal-dropdown-icon">▼</span>
                    </div>
                    <div class="calendar-modal-year-picker" id="calendarModalYearPicker">
                        <div class="calendar-modal-year-grid" id="calendarModalYearGrid"></div>
                    </div>
                </div>
                <div class="calendar-modal-nav-buttons">
                    <button class="calendar-modal-nav-btn" id="calendarModalPrevMonth">‹</button>
                    <button class="calendar-modal-today-btn" id="calendarModalTodayBtn">今天</button>
                    <button class="calendar-modal-nav-btn" id="calendarModalNextMonth">›</button>
                </div>
                <button class="calendar-modal-close-btn" id="calendarModalCloseBtn">×</button>
            </div>
            <div class="calendar-modal-weekdays" id="calendarModalWeekdays"></div>
            <div class="calendar-modal-grid" id="calendarModalGrid"></div>
        `;

        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);

        // 缓存 DOM 元素
        this.monthYearEl = document.getElementById('calendarModalMonthYear');
        this.yearPickerEl = document.getElementById('calendarModalYearPicker');
        this.yearGridEl = document.getElementById('calendarModalYearGrid');
        this.titleEl = document.getElementById('calendarModalTitle');
        this.weekdaysEl = document.getElementById('calendarModalWeekdays');
        this.gridEl = document.getElementById('calendarModalGrid');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 关闭按钮
        document.getElementById('calendarModalCloseBtn').addEventListener('click', () => {
            this.close();
        });

        // 点击遮罩层关闭
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // 月份导航
        document.getElementById('calendarModalPrevMonth').addEventListener('click', () => {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.renderCalendar();
        });

        document.getElementById('calendarModalNextMonth').addEventListener('click', () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.renderCalendar();
        });

        // 今天按钮
        document.getElementById('calendarModalTodayBtn').addEventListener('click', () => {
            const today = new Date();
            this.currentYear = today.getFullYear();
            this.currentMonth = today.getMonth();
            this.renderCalendar();
        });

        // 年份选择器切换
        this.monthYearEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleYearPicker();
        });

        // 点击其他地方关闭年份选择器
        document.addEventListener('click', (e) => {
            if (!this.monthYearEl.contains(e.target)) {
                this.hideYearPicker();
            }
        });

        // ESC 关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }

    /**
     * 显示模态弹窗
     */
    async open() {
        // 加载节假日数据
        await this.loadHolidays();

        // 渲染日历
        this.renderWeekdays();
        this.renderCalendar();

        // 显示模态框
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * 关闭模态弹窗
     */
    close() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.hideYearPicker();
    }

    /**
     * 检查是否打开
     */
    isOpen() {
        return this.overlay.classList.contains('active');
    }

    /**
     * 渲染星期标题
     */
    renderWeekdays() {
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        this.weekdaysEl.innerHTML = weekdays.map((day, index) => {
            const isWeekend = index === 0 || index === 6;
            return `<div class="calendar-modal-weekday ${isWeekend ? 'weekend' : ''}">${day}</div>`;
        }).join('');
    }

    /**
     * 渲染日历
     */
    renderCalendar() {
        // 更新标题
        this.titleEl.textContent = `${this.currentYear}年${this.currentMonth + 1}月`;

        // 获取当月第一天
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const firstDayOfWeek = firstDay.getDay(); // 0-6

        // 获取当月天数
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

        // 获取上个月的最后几天
        const prevMonth = new Date(this.currentYear, this.currentMonth, 0);
        const daysInPrevMonth = prevMonth.getDate();

        // 计算需要显示的上个月的天数
        const daysFromPrevMonth = firstDayOfWeek;

        // 渲染日期
        let html = '';

        // 渲染上个月的剩余天数
        for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const prevMonthDate = new Date(this.currentYear, this.currentMonth - 1, day);
            html += this.renderDayCell(prevMonthDate, true);
        }

        // 渲染当月天数
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            html += this.renderDayCell(date, false);
        }

        // 渲染下个月的开始天数（补齐 6 行）
        const totalDays = daysFromPrevMonth + daysInMonth;
        const remainingDays = 42 - totalDays; // 6 行 * 7 天 = 42

        for (let day = 1; day <= remainingDays; day++) {
            const nextMonthDate = new Date(this.currentYear, this.currentMonth + 1, day);
            html += this.renderDayCell(nextMonthDate, true);
        }

        this.gridEl.innerHTML = html;
    }

    /**
     * 渲染日期单元格
     */
    renderDayCell(date, isOtherMonth) {
        const isToday = this.isSameDay(date, this.today);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        // 获取节假日信息
        const holiday = this.getHolidayForDate(date);
        const isHoliday = holiday && holiday.type === 'public_holiday';

        // 获取农历信息
        const lunar = this.solarToLunar(
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
        );

        let classes = 'calendar-modal-day';
        if (isOtherMonth) classes += ' other-month';
        if (isToday) classes += ' today';
        if (isWeekend) classes += ' weekend';
        if (isHoliday) classes += ' holiday';

        let html = `<div class="${classes}" data-date="${this.formatDate(date)}">`;

        // 日期数字
        html += `<div class="calendar-modal-day-number">${date.getDate()}</div>`;

        // 节假日标记
        if (isHoliday) {
            html += `<div class="calendar-modal-day-badge holiday">休</div>`;
        }

        // 节假日名称
        if (holiday && holiday.name) {
            html += `<div class="calendar-modal-day-festival">${holiday.name}</div>`;
        } else {
            // 农历信息
            html += `<div class="calendar-modal-day-lunar">${lunar.day}</div>`;
        }

        html += '</div>';
        return html;
    }

    /**
     * 加载节假日数据
     */
    async loadHolidays() {
        try {
            const response = await fetch(`/api/holidays/year/${this.currentYear}`);
            if (response.ok) {
                this.holidays = await response.json();
            } else {
                this.holidays = [];
            }
        } catch (error) {
            console.error('加载节假日数据失败:', error);
            this.holidays = [];
        }
    }

    /**
     * 获取某天的节假日信息
     */
    getHolidayForDate(date) {
        const dateStr = this.formatDate(date);
        return this.holidays.find(h => h.date === dateStr);
    }

    /**
     * 格式化日期为 YYYY-MM-DD
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * 判断两个日期是否是同一天
     */
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    }

    /**
     * 切换年份选择器
     */
    toggleYearPicker() {
        if (this.isYearPickerVisible) {
            this.hideYearPicker();
        } else {
            this.showYearPicker();
        }
    }

    /**
     * 显示年份选择器
     */
    showYearPicker() {
        const currentYear = this.currentYear;
        const years = [];

        // 生成当前年份前后各 10 年的列表
        for (let year = currentYear - 10; year <= currentYear + 10; year++) {
            years.push(year);
        }

        this.yearGridEl.innerHTML = years.map(year => {
            const isCurrent = year === currentYear;
            return `<div class="calendar-modal-year-item ${isCurrent ? 'current' : ''}" data-year="${year}">${year}</div>`;
        }).join('');

        // 绑定年份点击事件
        this.yearGridEl.querySelectorAll('.calendar-modal-year-item').forEach(item => {
            item.addEventListener('click', () => {
                this.currentYear = parseInt(item.dataset.year);
                this.renderCalendar();
                this.hideYearPicker();
            });
        });

        this.yearPickerEl.classList.add('active');
        this.isYearPickerVisible = true;
    }

    /**
     * 隐藏年份选择器
     */
    hideYearPicker() {
        this.yearPickerEl.classList.remove('active');
        this.isYearPickerVisible = false;
    }

    /**
     * 公历转农历（从 CalendarWidget 复制）
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
}

export default new CalendarModal();
