// ==================== 加班调休小组件 ====================

import BaseWidget from './BaseWidget.js';

class CompleteLeaveWidget extends BaseWidget {
    /**
     * 构造函数
     * @param {HTMLElement} container - widget 容器元素
     * @param {number|null} widgetId - icon_widgets.id（数字ID）
     */
    constructor(container, widgetId = null) {
        super(container, widgetId, 'CompleteLeaveWidget');
        // 加班调休组件支持 2x2, 2x3, 2x4 尺寸
        this.supportedSizes = ['2x2', '2x3', '2x4'];
        this.config = null;
    }

    /**
     * 初始化组件，从后端加载配置
     */
    async init() {
        try {
            await this.loadConfig();
            this.render();
        } catch (error) {
            console.error('CompleteLeaveWidget 初始化失败:', error);
        }
    }

    /**
     * 从后端加载配置
     */
    async loadConfig() {
        try {
            const response = await fetch('/api/compleave/config');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();

            if (result.success) {
                this.config = result.data;
            } else {
                throw new Error(result.error || '获取配置失败');
            }
        } catch (error) {
            console.error('加载加班调休配置失败:', error);
            // 使用默认值
            this.config = {
                overtimeHours: 0,
                overtimeMinutes: 0,
                leaveHours: 0,
                leaveMinutes: 0,
                availableHours: 0,
                availableMinutes: 0
            };
        }
    }

    /**
     * 将分钟数转换为天、小时、分钟格式
     * 1天 = 8小时 = 480分钟
     * @param {number} totalMinutes - 总分钟数
     * @returns {Object} { days, hours, minutes }
     */
    formatTime(totalMinutes) {
        const minutesPerDay = 480; // 8小时 = 480分钟
        const minutesPerHour = 60;

        const days = Math.floor(totalMinutes / minutesPerDay);
        const remainingAfterDays = totalMinutes % minutesPerDay;
        const hours = Math.floor(remainingAfterDays / minutesPerHour);
        const minutes = remainingAfterDays % minutesPerHour;

        return { days, hours, minutes };
    }

    /**
     * 格式化时间为 "XX天XX时XX分"
     * @param {number} hours - 小时数
     * @param {number} minutes - 分钟数
     * @returns {string} 格式化后的时间字符串
     */
    formatTimeDisplay(hours, minutes) {
        const totalMinutes = hours * 60 + minutes;
        const { days, hours: remainingHours, minutes: remainingMinutes } = this.formatTime(totalMinutes);

        let result = '';
        if (days > 0) {
            result += `${days}天`;
        }
        if (remainingHours > 0 || days > 0) {
            result += `${remainingHours}时`;
        }
        result += `${remainingMinutes}分`;

        return result;
    }

    /**
     * 渲染组件内容
     */
    render() {
        if (!this.config) return;

        // 获取当前尺寸
        const size = this.container.closest('.grid-item')?.dataset.size || '2x4';
        let html = '';

        switch (size) {
            case '2x2':
                html = this.render2x2();
                break;
            case '2x3':
                html = this.render2x3();
                break;
            case '2x4':
                html = this.render2x4();
                break;
            default:
                html = this.render2x4();
        }

        this.container.innerHTML = html;
    }

    /**
     * 渲染 2x2 尺寸 - 只显示可调休时间
     */
    render2x2() {
        const { availableHours, availableMinutes } = this.config;
        const timeDisplay = this.formatTimeDisplay(availableHours, availableMinutes);

        return `
            <div class="compleave-widget compleave-2x2">
                <div class="compleave-label">可调休时间</div>
                <div class="compleave-value">${timeDisplay}</div>
            </div>
        `;
    }

    /**
     * 渲染 2x3 尺寸 - 采用与2x4相同的左右布局
     */
    render2x3() {
        const { overtimeHours, overtimeMinutes, leaveHours, leaveMinutes, availableHours, availableMinutes } = this.config;

        const overtimeDisplay = this.formatTimeDisplay(overtimeHours, overtimeMinutes);
        const leaveDisplay = this.formatTimeDisplay(leaveHours, leaveMinutes);
        const availableDisplay = this.formatTimeDisplay(availableHours, availableMinutes);

        return `
            <div class="compleave-widget compleave-2x3">
                <div class="compleave-left">
                    <div class="compleave-item">
                        <div class="compleave-item-label">总加班时间</div>
                        <div class="compleave-item-value">${overtimeDisplay}</div>
                    </div>
                    <div class="compleave-divider"></div>
                    <div class="compleave-item">
                        <div class="compleave-item-label">已调休时间</div>
                        <div class="compleave-item-value">${leaveDisplay}</div>
                    </div>
                </div>
                <div class="compleave-right">
                    <div class="compleave-available">
                        <div class="compleave-available-label">可调休时间</div>
                        <div class="compleave-available-value">${availableDisplay}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染 2x4 尺寸 - 左侧显示总加班和已调休，右侧显示可调休
     */
    render2x4() {
        const { overtimeHours, overtimeMinutes, leaveHours, leaveMinutes, availableHours, availableMinutes } = this.config;

        const overtimeDisplay = this.formatTimeDisplay(overtimeHours, overtimeMinutes);
        const leaveDisplay = this.formatTimeDisplay(leaveHours, leaveMinutes);
        const availableDisplay = this.formatTimeDisplay(availableHours, availableMinutes);

        return `
            <div class="compleave-widget compleave-2x4">
                <div class="compleave-left">
                    <div class="compleave-item">
                        <div class="compleave-item-label">总加班时间</div>
                        <div class="compleave-item-value">${overtimeDisplay}</div>
                    </div>
                    <div class="compleave-divider"></div>
                    <div class="compleave-item">
                        <div class="compleave-item-label">已调休时间</div>
                        <div class="compleave-item-value">${leaveDisplay}</div>
                    </div>
                </div>
                <div class="compleave-right">
                    <div class="compleave-available">
                        <div class="compleave-available-label">可调休时间</div>
                        <div class="compleave-available-value">${availableDisplay}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 刷新组件数据
     */
    async refresh() {
        await this.loadConfig();
        this.render();
    }

    /**
     * 销毁组件
     */
    destroy() {
        super.destroy();
        this.config = null;
    }
}

export default CompleteLeaveWidget;
