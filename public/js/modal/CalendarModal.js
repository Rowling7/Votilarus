// ==================== 日历模态弹窗 ====================

import lunarConverter from '../utils/Lunar.js';

// 从全局对象获取 TimeUtils（UMD 模式导出）
const TimeUtils = window.TimeUtils;

class CalendarModal {
    constructor() {
        // 使用东八区时间初始化
        const now = TimeUtils.getBeijingTime();
        this.currentYear = now.getFullYear();
        this.currentMonth = now.getMonth();
        this.today = now;
        this.holidays = [];
        this.overlay = null;
        this.modal = null;
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
                <button class="calendar-modal-nav-btn" id="calendarModalPrevMonth">‹</button>
                <div class="calendar-modal-title-section">
                    <div class="calendar-modal-month-year" id="calendarModalMonthYear">
                        <!-- <span id="calendarModalTitle">${this.currentYear}年${this.currentMonth + 1}月</span> -->
                    </div>
                    <select class="calendar-modal-year-select" id="calendarModalYearSelect"></select>
                    <select class="calendar-modal-month-select" id="calendarModalMonthSelect"></select>
                </div>
                <button class="calendar-modal-nav-btn" id="calendarModalNextMonth">›</button>
                <button class="calendar-modal-today-btn" id="calendarModalTodayBtn">今天</button>
            </div>
            <div class="calendar-modal-weekdays" id="calendarModalWeekdays"></div>
            <div class="calendar-modal-grid" id="calendarModalGrid"></div>
        `;

        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);

        // 缓存 DOM 元素
        this.monthYearEl = document.getElementById('calendarModalMonthYear');
        this.yearSelectEl = document.getElementById('calendarModalYearSelect');
        this.monthSelectEl = document.getElementById('calendarModalMonthSelect');
        this.titleEl = document.getElementById('calendarModalTitle');
        this.weekdaysEl = document.getElementById('calendarModalWeekdays');
        this.gridEl = document.getElementById('calendarModalGrid');

        // 初始化选择器
        this.initSelectors();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 点击遮罩层关闭
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // 月份导航
        document.getElementById('calendarModalPrevMonth').addEventListener('click', async () => {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            // 重新加载该年的节假日数据
            await this.loadHolidays();
            this.renderCalendar();
        });

        document.getElementById('calendarModalNextMonth').addEventListener('click', async () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            // 重新加载该年的节假日数据
            await this.loadHolidays();
            this.renderCalendar();
        });

        // 今天按钮
        document.getElementById('calendarModalTodayBtn').addEventListener('click', async () => {
            const today = TimeUtils.getBeijingTime();
            this.currentYear = today.getFullYear();
            this.currentMonth = today.getMonth();
            // 重新加载该年的节假日数据
            await this.loadHolidays();
            this.renderCalendar();
        });

        // 年份选择器变化
        this.yearSelectEl.addEventListener('change', async () => {
            this.currentYear = parseInt(this.yearSelectEl.value);
            // 重新加载该年的节假日数据
            await this.loadHolidays();
            this.renderCalendar();
        });

        // 月份选择器变化
        this.monthSelectEl.addEventListener('change', () => {
            this.currentMonth = parseInt(this.monthSelectEl.value);
            this.renderCalendar();
        });

        // 鼠标滚轮切换月份
        this.modal.addEventListener('wheel', async (e) => {
            e.preventDefault();
            if (e.deltaY > 0) {
                // 向下滚动 - 下个月
                this.currentMonth++;
                if (this.currentMonth > 11) {
                    this.currentMonth = 0;
                    this.currentYear++;
                }
            } else {
                // 向上滚动 - 上个月
                this.currentMonth--;
                if (this.currentMonth < 0) {
                    this.currentMonth = 11;
                    this.currentYear--;
                }
            }
            // 重新加载该年的节假日数据
            await this.loadHolidays();
            this.renderCalendar();
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
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
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
        // this.titleEl.textContent = `${this.currentYear}年${this.currentMonth + 1}月`;

        // 更新选择器的值
        this.updateSelectors();

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

        // 添加月份背景数字
        this.gridEl.innerHTML = `
            <div class="calendar-modal-month-bg">${this.currentMonth + 1}</div>
            ${html}
        `;
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
        const isWorkday = holiday && holiday.type === 'transfer_workday';

        // 获取农历信息
        const lunar = lunarConverter.solarToLunar(
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
        );

        let classes = 'calendar-modal-day';
        if (isOtherMonth) classes += ' other-month';
        if (isToday) classes += ' today';
        if (isWeekend) classes += ' weekend';
        if (isHoliday) classes += ' holiday';
        if (isWorkday) classes += ' workday';

        let html = `<div class="${classes}" data-date="${this.formatDate(date)}">`;

        // 日期数字
        html += `<div class="calendar-modal-day-number">${date.getDate()}</div>`;

        // 节假日标记
        if (isHoliday) {
            html += `<div class="calendar-modal-day-badge holiday">休</div>`;
        }

        // 补班标记
        if (isWorkday) {
            html += `<div class="calendar-modal-day-badge workday">班</div>`;
        }

        // 节假日名称
        if (holiday && holiday.name) {
            html += `<div class="calendar-modal-day-festival">${holiday.name}</div>`;
        } else {
            // 农历信息
            html += `<div class="calendar-modal-day-lunar">${lunar.month}${lunar.day}</div>`;
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
     * 初始化选择器
     */
    initSelectors() {
        const currentYear = TimeUtils.getBeijingTime().getFullYear();

        // 生成年份选项（前后各50年）
        let yearOptions = '';
        for (let year = currentYear - 50; year <= currentYear + 50; year++) {
            const selected = year === this.currentYear ? 'selected' : '';
            yearOptions += `<option value="${year}" ${selected}>${year}年</option>`;
        }
        this.yearSelectEl.innerHTML = yearOptions;

        // 生成月份选项
        const months = [
            '1月', '2月', '3月', '4月', '5月', '6月',
            '7月', '8月', '9月', '10月', '11月', '12月'
        ];
        let monthOptions = '';
        months.forEach((month, index) => {
            const selected = index === this.currentMonth ? 'selected' : '';
            monthOptions += `<option value="${index}" ${selected}>${month}</option>`;
        });
        this.monthSelectEl.innerHTML = monthOptions;
    }

    /**
     * 更新选择器的值
     */
    updateSelectors() {
        this.yearSelectEl.value = this.currentYear;
        this.monthSelectEl.value = this.currentMonth;
    }


}

export default new CalendarModal();
