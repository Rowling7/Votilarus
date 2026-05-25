// ==================== 时间戳转换工具 ====================

/**
 * 时间戳转换工具 - 用于控制台模态框
 * 功能：Unix 时间戳与日期时间字符串相互转换
 */
class TimestampConverter {
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

        const now = new Date();
        const defaultDate = this._formatDateTime(now);
        const defaultTimestamp = Math.floor(now.getTime() / 1000);

        container.innerHTML = `
            <div class="timestamp-tool">
                <h2 class="timestamp-title">🕒 时间戳转换</h2>
                <p class="timestamp-desc">Unix 时间戳（秒）与日期时间双向转换</p>

                <!-- 当前时间戳 -->
                <div class="timestamp-now-bar">
                    <span class="timestamp-now-label">当前时间戳：</span>
                    <span class="timestamp-now-value" id="tsNowValue">${defaultTimestamp}</span>
                    <button class="timestamp-now-btn" id="tsRefreshNow">🔄 刷新</button>
                </div>

                <!-- 时间戳 → 日期 -->
                <div class="timestamp-section">
                    <h3 class="timestamp-section-title">📌 时间戳 → 日期</h3>
                    <div class="timestamp-field">
                        <label class="timestamp-label">Unix 时间戳（秒）</label>
                        <div class="timestamp-input-group">
                            <input type="number" class="timestamp-input" id="tsToDateInput" value="${defaultTimestamp}" placeholder="请输入秒级时间戳">
                            <button class="timestamp-btn" id="tsToDateBtn">转换为日期</button>
                        </div>
                    </div>
                    <div class="timestamp-result-box" id="tsToDateResult">
                        <div class="timestamp-result-row">
                            <span class="timestamp-result-key">本地日期：</span>
                            <span class="timestamp-result-val" id="tsLocalDate">${now.toLocaleString('zh-CN', { hour12: false })}</span>
                        </div>
                        <div class="timestamp-result-row">
                            <span class="timestamp-result-key">UTC 日期：</span>
                            <span class="timestamp-result-val" id="tsUtcDate">${now.toUTCString()}</span>
                        </div>
                        <div class="timestamp-result-row">
                            <span class="timestamp-result-key">ISO 8601：</span>
                            <span class="timestamp-result-val" id="tsIsoDate">${now.toISOString()}</span>
                        </div>
                    </div>
                </div>

                <!-- 日期 → 时间戳 -->
                <div class="timestamp-section">
                    <h3 class="timestamp-section-title">📌 日期 → 时间戳</h3>
                    <div class="timestamp-field">
                        <label class="timestamp-label">日期时间</label>
                        <div class="timestamp-input-group">
                            <input type="datetime-local" class="timestamp-input" id="tsToTsInput" value="${defaultDate}">
                            <button class="timestamp-btn" id="tsToTsBtn">转换为时间戳</button>
                        </div>
                    </div>
                    <div class="timestamp-result-box" id="tsToTsResult">
                        <div class="timestamp-result-row">
                            <span class="timestamp-result-key">秒级时间戳：</span>
                            <span class="timestamp-result-val" id="tsSeconds">${defaultTimestamp}</span>
                        </div>
                        <div class="timestamp-result-row">
                            <span class="timestamp-result-key">毫秒级时间戳：</span>
                            <span class="timestamp-result-val" id="tsMilliseconds">${now.getTime()}</span>
                        </div>
                    </div>
                </div>

                <!-- 快捷操作 -->
                <div class="timestamp-section">
                    <h3 class="timestamp-section-title">⚡ 快捷操作</h3>
                    <div class="timestamp-field">
                        <label class="timestamp-label">快速填入</label>
                        <div class="timestamp-quick-btns">
                            <button class="timestamp-quick-btn" data-quick="now">当前时间戳</button>
                            <button class="timestamp-quick-btn" data-quick="today-start">今日 00:00:00</button>
                            <button class="timestamp-quick-btn" data-quick="today-end">今日 23:59:59</button>
                            <button class="timestamp-quick-btn" data-quick="yesterday">昨日 00:00:00</button>
                            <button class="timestamp-quick-btn" data-quick="week-start">本周一 00:00:00</button>
                            <button class="timestamp-quick-btn" data-quick="month-start">本月1日 00:00:00</button>
                            <button class="timestamp-quick-btn" data-quick="year-start">本年1月1日 00:00:00</button>
                        </div>
                    </div>
                </div>

                <!-- 反馈消息 -->
                <div class="timestamp-feedback" id="tsFeedback">
                    <p class="timestamp-feedback-text" id="tsFeedbackText"></p>
                </div>
            </div>
        `;

        this._bindEvents();
        this._showResult('tsToDateResult');
        this._showResult('tsToTsResult');
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
     * 显示结果区域
     * @param {string} id - 元素 ID
     */
    _showResult(id) {
        const el = this._container?.querySelector(`#${id}`);
        if (el) el.classList.add('visible');
    }

    /**
     * 绑定事件
     */
    _bindEvents() {
        const container = this._container;
        if (!container) return;

        // 刷新当前时间戳
        const refreshBtn = container.querySelector('#tsRefreshNow');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                const now = Math.floor(Date.now() / 1000);
                const nowEl = container.querySelector('#tsNowValue');
                if (nowEl) nowEl.textContent = now;
                this._showFeedback('✅ 已刷新', true);
            });
        }

        // 时间戳 → 日期
        const toDateBtn = container.querySelector('#tsToDateBtn');
        if (toDateBtn) {
            toDateBtn.addEventListener('click', () => this._convertToDate());
        }

        // 日期 → 时间戳
        const toTsBtn = container.querySelector('#tsToTsBtn');
        if (toTsBtn) {
            toTsBtn.addEventListener('click', () => this._convertToTimestamp());
        }

        // 快捷按钮
        container.querySelectorAll('[data-quick]').forEach(btn => {
            btn.addEventListener('click', () => {
                const quick = btn.dataset.quick;
                let ts;
                const now = new Date();

                switch (quick) {
                    case 'now':
                        ts = Math.floor(Date.now() / 1000);
                        break;
                    case 'today-start': {
                        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        ts = Math.floor(d.getTime() / 1000);
                        break;
                    }
                    case 'today-end': {
                        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                        ts = Math.floor(d.getTime() / 1000);
                        break;
                    }
                    case 'yesterday': {
                        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                        ts = Math.floor(d.getTime() / 1000);
                        break;
                    }
                    case 'week-start': {
                        const day = now.getDay();
                        const diff = day === 0 ? 6 : day - 1; // 周一为0
                        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
                        ts = Math.floor(d.getTime() / 1000);
                        break;
                    }
                    case 'month-start': {
                        const d = new Date(now.getFullYear(), now.getMonth(), 1);
                        ts = Math.floor(d.getTime() / 1000);
                        break;
                    }
                    case 'year-start': {
                        const d = new Date(now.getFullYear(), 0, 1);
                        ts = Math.floor(d.getTime() / 1000);
                        break;
                    }
                    default:
                        return;
                }

                // 填入时间戳输入框并自动转换
                const input = container.querySelector('#tsToDateInput');
                if (input) {
                    input.value = ts;
                    this._convertToDate();
                    this._showFeedback(`✅ 已填入时间戳: ${ts}`, true);
                }
            });
        });

        // Enter 键触发
        container.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const target = e.target;
                if (target.id === 'tsToDateInput') {
                    this._convertToDate();
                } else if (target.id === 'tsToTsInput') {
                    this._convertToTimestamp();
                }
            }
        });
    }

    /**
     * 时间戳 → 日期转换
     */
    _convertToDate() {
        const container = this._container;
        if (!container) return;

        const input = container.querySelector('#tsToDateInput');
        const resultEl = container.querySelector('#tsToDateResult');
        if (!input || !resultEl) return;

        const val = input.value.trim();
        if (!val) {
            this._showFeedback('请输入时间戳', false);
            return;
        }

        const ts = parseInt(val, 10);
        if (isNaN(ts) || ts < 0) {
            this._showFeedback('请输入有效的时间戳（正整数）', false);
            return;
        }

        // 判断是秒还是毫秒（如果数值 > 1e12 视为毫秒）
        let date;
        if (ts > 1e12) {
            date = new Date(ts);
        } else {
            date = new Date(ts * 1000);
        }

        if (isNaN(date.getTime())) {
            this._showFeedback('时间戳超出有效范围', false);
            return;
        }

        const localEl = container.querySelector('#tsLocalDate');
        const utcEl = container.querySelector('#tsUtcDate');
        const isoEl = container.querySelector('#tsIsoDate');

        if (localEl) localEl.textContent = date.toLocaleString('zh-CN', { hour12: false });
        if (utcEl) utcEl.textContent = date.toUTCString();
        if (isoEl) isoEl.textContent = date.toISOString();

        resultEl.classList.add('visible');
        this._showFeedback('✅ 转换成功', true);
    }

    /**
     * 日期 → 时间戳转换
     */
    _convertToTimestamp() {
        const container = this._container;
        if (!container) return;

        const input = container.querySelector('#tsToTsInput');
        const resultEl = container.querySelector('#tsToTsResult');
        if (!input || !resultEl) return;

        const val = input.value;
        if (!val) {
            this._showFeedback('请选择日期时间', false);
            return;
        }

        const date = new Date(val);
        if (isNaN(date.getTime())) {
            this._showFeedback('日期时间格式无效', false);
            return;
        }

        const seconds = Math.floor(date.getTime() / 1000);
        const milliseconds = date.getTime();

        const secEl = container.querySelector('#tsSeconds');
        const msEl = container.querySelector('#tsMilliseconds');

        if (secEl) secEl.textContent = seconds;
        if (msEl) msEl.textContent = milliseconds;

        resultEl.classList.add('visible');
        this._showFeedback('✅ 转换成功', true);

        // 同时更新当前时间戳显示
        const nowEl = container.querySelector('#tsNowValue');
        if (nowEl) nowEl.textContent = Math.floor(Date.now() / 1000);
    }

    /**
     * 显示操作反馈
     * @param {string} message
     * @param {boolean} success
     */
    _showFeedback(message, success = true) {
        const feedback = this._container?.querySelector('#tsFeedback');
        const feedbackText = this._container?.querySelector('#tsFeedbackText');

        if (feedback && feedbackText) {
            feedbackText.textContent = message;
            feedback.className = 'timestamp-feedback visible ' + (success ? 'success' : 'error');

            clearTimeout(this._feedbackTimer);
            this._feedbackTimer = setTimeout(() => {
                if (feedback) feedback.className = 'timestamp-feedback';
            }, 3000);
        }
    }
}

export default TimestampConverter;