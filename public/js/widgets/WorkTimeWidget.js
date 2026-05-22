// ==================== 工作倒计时小组件 ====================

import BaseWidget from './BaseWidget.js';

class WorkTimeWidget extends BaseWidget {
    /**
     * 构造函数
     * @param {HTMLElement} container - widget 容器元素
     * @param {number|null} widgetId - icon_widgets.id（数字ID）
     */
    constructor(container, widgetId = null) {
        super(container, widgetId, 'WorkTimeWidget');
        // 工作倒计时组件支持 2x2, 2x4 尺寸
        this.supportedSizes = ['2x2', '2x4'];
        this.config = null;
        this.interval = null;
    }

    /**
     * 初始化组件，从后端加载配置
     */
    async init() {
        try {
            await this.loadConfig();
            this.startTimer();
        } catch (error) {
            console.error('WorkTimeWidget 初始化失败:', error);
        }
    }

    /**
     * 从后端加载配置
     */
    async loadConfig() {
        try {
            const response = await fetch('/api/worktime/config');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();

            if (result.success && result.data) {
                this.config = result.data;
            } else {
                throw new Error('获取配置失败');
            }
        } catch (error) {
            console.error('加载工作时间配置失败:', error);
            // 使用默认配置作为降级方案
            this.config = {
                startTime: '07:50',
                lunchTime: '11:20',
                endTime: this.getAutoDSTEndTime(),
                dailySalary: 250,
                type: 'DST'
            };
        }
    }

    /**
     * 根据当前日期自动判断DST或ST并返回下班时间
     */
    getAutoDSTEndTime() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();

        // DST: 5月1日至9月30日
        if ((month === 5 && day >= 1) ||
            (month > 5 && month < 9) ||
            (month === 9 && day <= 30)) {
            return '17:20';
        }
        // ST: 10月1日至次年4月30日
        else {
            return '16:50';
        }
    }

    /**
     * 渲染工作倒计时小组件
     */
    render() {
        // 获取当前尺寸
        const currentSize = this.container.closest('.grid-item')?.dataset.size || '2x2';

        // 根据不同尺寸调整布局
        if (currentSize === '2x2') {
            // 2x2 紧凑布局
            this.container.innerHTML = `
                <div class="worktime-widget">
                    <div class="worktime-countdown-row">
                        <div class="worktime-countdown-item">
                            <div class="worktime-label">🍚吃！吃！吃！</div>
                            <div class="worktime-value" id="lunchCountdown">--:--:--</div>
                        </div>
                        <div class="worktime-countdown-item">
                            <div class="worktime-label">🏃撤！撤！撤！</div>
                            <div class="worktime-value" id="endCountdown">--:--:--</div>
                        </div>
                    </div>
                    <div class="worktime-salary-row">
                        <div class="worktime-label">💵窝囊费¥</div>
                        <div class="worktime-salary-value" id="salaryEarned">0</div>
                    </div>
                </div>
            `;
        } else if (currentSize === '2x3' || currentSize === '2x4') {
            // 2x3 和 2x4 宽屏布局
            this.container.innerHTML = `
                <div class="worktime-widget">
                    <div class="worktime-header">
                        <span class="worktime-type-badge">${this.config?.type || '--'}</span>
                    </div>
                    <div class="worktime-countdown-row-wide">
                        <div class="worktime-countdown-item">
                            <div class="worktime-label">🍚吃！吃！吃！</div>
                            <div class="worktime-value" id="lunchCountdown">--:--:--</div>
                        </div>
                        <div class="worktime-countdown-item">
                            <div class="worktime-label">🏃撤！撤！撤！</div>
                            <div class="worktime-value" id="endCountdown">--:--:--</div>
                        </div>
                    </div>
                    <div class="worktime-salary-row-wide">
                        <div class="worktime-label">💵窝囊费¥</div>
                        <div class="worktime-salary-value" id="salaryEarned">0</div>
                    </div>
                </div>
            `;
        }

        // 立即更新一次显示
        this.updateDisplay();

        return {
            destroy: () => this.destroy()
        };
    }

    /**
     * 启动定时器
     */
    startTimer() {
        // 清除旧定时器
        if (this.interval) {
            clearInterval(this.interval);
        }

        // 每200ms更新一次
        this.interval = setInterval(() => {
            this.updateDisplay();
        }, 200);
    }

    /**
     * 更新显示
     */
    updateDisplay() {
        if (!this.config || this.isDestroyed) return;

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const startTime = new Date(`${today}T${this.config.startTime}:00`);
        const lunchTime = new Date(`${today}T${this.config.lunchTime}:00`);
        const endTime = new Date(`${today}T${this.config.endTime}:00`);

        // 计算时间差
        let lunchDiff = Math.max(lunchTime - now, 0);
        let endDiff = Math.max(endTime - now, 0);

        // 格式化时间
        const formatTime = (ms) => {
            const seconds = Math.floor((ms / 1000) % 60);
            const minutes = Math.floor((ms / (1000 * 60)) % 60);
            const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        // 安全更新DOM元素
        const safeUpdate = (id, content) => {
            const element = document.getElementById(id);
            if (element) element.textContent = content;
        };

        safeUpdate('lunchCountdown', formatTime(lunchDiff));
        safeUpdate('endCountdown', formatTime(endDiff));

        // 计算日薪
        let salaryEarned = 0;
        if (now >= startTime && now <= endTime) {
            const workDayDuration = endTime - startTime;
            const workedTime = now - startTime;
            salaryEarned = (workedTime / workDayDuration) * this.config.dailySalary;
        } else if (now > endTime) {
            salaryEarned = this.config.dailySalary;
        }

        safeUpdate('salaryEarned', `${salaryEarned.toFixed(3)}`);
    }

    /**
     * 刷新组件
     */
    refresh() {
        this.loadConfig().then(() => {
            this.render();
            this.startTimer();
        });
    }

    /**
     * 销毁组件
     */
    destroy() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        super.destroy();
    }
}

export default WorkTimeWidget;
