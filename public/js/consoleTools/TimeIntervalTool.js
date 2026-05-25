// ==================== 时间间隔计算工具 ====================

/**
 * 时间间隔工具 - 用于控制台模态框
 * 功能：选择两个日期时间，计算时间间隔（天、时、分、秒）
 */
class TimeIntervalTool {
    constructor() {
        this._container = null;
        this._feedbackTimer = null;
    }

    /**
     * 渲染工具内容到容器
     * @param {HTMLElement} container - 右侧内容区容器
     */
    render(container) {
        this._container = container;

        // 初始化默认时间：开始时间为当前时间前1小时，结束时间为当前时间
        const now = new Date();
        const past = new Date(now.getTime() - 3600000);
        const defaultStart = this._formatDateTime(past);
        const defaultEnd = this._formatDateTime(now);

        container.innerHTML = `
            <div class="time-interval-tool">
                <h2 class="time-interval-title">⏱️ 时间间隔</h2>
                <p class="time-interval-desc">选择两个日期时间，计算它们之间的时间差</p>

                <div class="time-interval-form">
                    <!-- 快速选择 -->
                    <div class="time-interval-field">
                        <span class="time-interval-label">快速选择</span>
                        <div class="time-interval-quick-btns">
                            <button class="time-interval-quick-btn" data-quick="1h">1 小时前</button>
                            <button class="time-interval-quick-btn" data-quick="2h">2 小时前</button>
                            <button class="time-interval-quick-btn" data-quick="6h">6 小时前</button>
                            <button class="time-interval-quick-btn" data-quick="1d">1 天前</button>
                            <button class="time-interval-quick-btn" data-quick="3d">3 天前</button>
                            <button class="time-interval-quick-btn" data-quick="7d">7 天前</button>
                            <button class="time-interval-quick-btn" data-quick="30d">30 天前</button>
                        </div>
                    </div>

                    <!-- 开始时间 -->
                    <div class="time-interval-dates">
                        <div class="time-interval-date-group">
                            <label class="time-interval-label">开始时间</label>
                            <input type="datetime-local" class="time-interval-input" id="timeIntervalStart" value="${defaultStart}">
                        </div>
                        <button class="time-interval-swap-btn" id="timeIntervalSwap" title="交换起止时间">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <polyline points="19 12 12 19 5 12"></polyline>
                            </svg>
                        </button>
                        <div class="time-interval-date-group">
                            <label class="time-interval-label">结束时间</label>
                            <input type="datetime-local" class="time-interval-input" id="timeIntervalEnd" value="${defaultEnd}">
                        </div>
                    </div>

                    <!-- 计算按钮 -->
                    <button class="time-interval-btn" id="timeIntervalCalc">
                        <svg class="time-interval-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="3" y1="9" x2="21" y2="9"></line>
                            <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                        计算时间间隔
                    </button>
                </div>

                <!-- 结果区域 -->
                <div class="time-interval-result" id="timeIntervalResult">
                    <h3 class="time-interval-result-title">📊 计算结果</h3>
                    <div class="time-interval-result-display" id="timeIntervalDisplay">
                        <div class="time-interval-result-unit">
                            <span class="time-interval-result-value" id="tiDays">0</span>
                            <span class="time-interval-result-label">天</span>
                        </div>
                        <div class="time-interval-result-unit">
                            <span class="time-interval-result-value" id="tiHours">0</span>
                            <span class="time-interval-result-label">时</span>
                        </div>
                        <div class="time-interval-result-unit">
                            <span class="time-interval-result-value" id="tiMinutes">0</span>
                            <span class="time-interval-result-label">分</span>
                        </div>
                        <div class="time-interval-result-unit">
                            <span class="time-interval-result-value seconds-value" id="tiSeconds">0</span>
                            <span class="time-interval-result-label">秒</span>
                        </div>
                    </div>
                    <div class="time-interval-result-description">
                        <p class="time-interval-result-description-text" id="tiDescription"></p>
                    </div>
                </div>

                <!-- 反馈消息 -->
                <div class="time-interval-feedback" id="timeIntervalFeedback">
                    <p class="time-interval-feedback-text" id="timeIntervalFeedbackText"></p>
                </div>
            </div>
        `;

        this._bindEvents();
    }

    /**
     * 格式化 Date 对象为 datetime-local 输入框所需格式
     * @param {Date} date
     * @returns {string} YYYY-MM-DDTHH:mm
     */
    _formatDateTime(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const h = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        return `${y}-${m}-${d}T${h}:${min}`;
    }

    /**
     * 绑定事件
     */
    _bindEvents() {
        const container = this._container;
        if (!container) return;

        // 快速选择
        container.querySelectorAll('[data-quick]').forEach(btn => {
            btn.addEventListener('click', () => {
                const quick = btn.dataset.quick;
                const match = quick.match(/^(\d+)([hd])$/);
                if (!match) return;

                const amount = parseInt(match[1], 10);
                const unit = match[2];
                const now = new Date();
                let start;

                if (unit === 'h') {
                    start = new Date(now.getTime() - amount * 3600000);
                } else {
                    start = new Date(now.getTime() - amount * 86400000);
                }

                const startInput = container.querySelector('#timeIntervalStart');
                const endInput = container.querySelector('#timeIntervalEnd');
                if (startInput) startInput.value = this._formatDateTime(start);
                if (endInput) endInput.value = this._formatDateTime(now);

                // 自动计算
                this._doCalc();
            });
        });

        // 交换按钮
        const swapBtn = container.querySelector('#timeIntervalSwap');
        if (swapBtn) {
            swapBtn.addEventListener('click', () => {
                const startInput = container.querySelector('#timeIntervalStart');
                const endInput = container.querySelector('#timeIntervalEnd');
                if (!startInput || !endInput) return;

                const tmp = startInput.value;
                startInput.value = endInput.value;
                endInput.value = tmp;

                // 自动计算
                this._doCalc();
            });
        }

        // 计算按钮
        const calcBtn = container.querySelector('#timeIntervalCalc');
        if (calcBtn) {
            calcBtn.addEventListener('click', () => {
                this._doCalc();
            });
        }

        // Enter 键触发计算
        container.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const target = e.target;
                if (target.matches('.time-interval-input')) {
                    this._doCalc();
                }
            }
        });
    }

    /**
     * 执行计算
     */
    _doCalc() {
        const container = this._container;
        if (!container) return;

        const startInput = container.querySelector('#timeIntervalStart');
        const endInput = container.querySelector('#timeIntervalEnd');
        const resultEl = container.querySelector('#timeIntervalResult');

        if (!startInput || !endInput || !resultEl) return;

        const startVal = startInput.value;
        const endVal = endInput.value;

        // 校验输入
        if (!startVal) {
            this._showFeedback('请选择开始时间', false);
            return;
        }
        if (!endVal) {
            this._showFeedback('请选择结束时间', false);
            return;
        }

        const startDate = new Date(startVal);
        const endDate = new Date(endVal);

        if (isNaN(startDate.getTime())) {
            this._showFeedback('开始时间格式无效', false);
            return;
        }
        if (isNaN(endDate.getTime())) {
            this._showFeedback('结束时间格式无效', false);
            return;
        }

        // 计算差值（毫秒）
        let diffMs = endDate.getTime() - startDate.getTime();
        const isNegative = diffMs < 0;
        if (isNegative) {
            diffMs = Math.abs(diffMs);
        }

        // 计算各单位
        const totalSeconds = Math.floor(diffMs / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const totalDays = Math.floor(totalHours / 24);

        const days = totalDays;
        const hours = totalHours % 24;
        const minutes = totalMinutes % 60;
        const seconds = totalSeconds % 60;

        // 更新显示
        container.querySelector('#tiDays').textContent = days;
        container.querySelector('#tiHours').textContent = hours;
        container.querySelector('#tiMinutes').textContent = minutes;
        container.querySelector('#tiSeconds').textContent = seconds;

        // 构建详细描述
        const startStr = startDate.toLocaleString('zh-CN', { hour12: false });
        const endStr = endDate.toLocaleString('zh-CN', { hour12: false });
        const prefix = isNegative ? '（开始时间晚于结束时间，取绝对值）' : '';
        const desc = container.querySelector('#tiDescription');
        if (desc) {
            desc.textContent = `从 ${startStr} 到 ${endStr}${prefix}，共 ${totalDays} 天 ${totalHours % 24} 小时 ${totalMinutes % 60} 分钟 ${totalSeconds % 60} 秒`;
        }

        // 显示结果
        resultEl.classList.add('visible');

        // 成功反馈
        this._showFeedback('✅ 计算完成', true);

        // 滚动到结果
        resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * 显示操作反馈
     * @param {string} message
     * @param {boolean} success
     */
    _showFeedback(message, success = true) {
        const feedback = this._container?.querySelector('#timeIntervalFeedback');
        const feedbackText = this._container?.querySelector('#timeIntervalFeedbackText');

        if (feedback && feedbackText) {
            feedbackText.textContent = message;
            feedback.className = 'time-interval-feedback visible ' + (success ? 'success' : 'error');

            clearTimeout(this._feedbackTimer);
            this._feedbackTimer = setTimeout(() => {
                if (feedback) feedback.className = 'time-interval-feedback';
            }, 3000);
        }
    }
}

export default TimeIntervalTool;