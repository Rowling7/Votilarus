// ==================== SSHD状态管理工具 ====================

/**
 * SSHD状态管理工具 - 用于控制台模态框
 * 功能：查看SSHD状态、启动SSHD、重启SSHD
 */
class SSHDTool {
    constructor() {
        this._status = null;       // 'running' | 'stopped' | null
        this._message = '';
        this._busy = false;
    }

    /**
     * 渲染工具内容到容器
     * @param {HTMLElement} container - 右侧内容区容器
     */
    render(container) {
        this._status = null;
        this._message = '';
        this._busy = false;

        container.innerHTML = `
            <div class="sshd-tool">
                <h2 class="sshd-tool-title">🔌 SSHD 状态管理</h2>
                <p class="sshd-tool-desc">管理 Termux 中的 SSHD 服务，查看运行状态、启动或重启服务。</p>

                <div class="sshd-tool-status-row">
                    <div class="sshd-tool-status-indicator" id="sshdStatusIndicator">
                        <span class="sshd-tool-status-dot"></span>
                        <span class="sshd-tool-status-text" id="sshdStatusText">查询中...</span>
                    </div>
                </div>

                <div class="sshd-tool-actions">
                    <button class="sshd-tool-btn sshd-tool-btn-status" id="sshdBtnStatus">
                        <svg class="sshd-tool-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 16v-4"></path>
                            <path d="M12 8h.01"></path>
                        </svg>
                        查看状态
                    </button>

                    <button class="sshd-tool-btn sshd-tool-btn-start" id="sshdBtnStart">
                        <svg class="sshd-tool-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="5,3 19,12 5,21"></polygon>
                        </svg>
                        启动 SSHD
                    </button>

                    <button class="sshd-tool-btn sshd-tool-btn-restart" id="sshdBtnRestart">
                        <svg class="sshd-tool-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="1,4 1,10 7,10"></polyline>
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                        </svg>
                        重启 SSHD
                    </button>
                </div>

                <div class="sshd-tool-feedback" id="sshdFeedback">
                    <p class="sshd-tool-feedback-text" id="sshdFeedbackText"></p>
                </div>
            </div>
        `;

        this._bindEvents(container);
        this._checkStatus();
    }

    /**
     * 绑定按钮事件
     */
    _bindEvents(container) {
        container.querySelector('#sshdBtnStatus').addEventListener('click', () => this._checkStatus());
        container.querySelector('#sshdBtnStart').addEventListener('click', () => this._startSSHD());
        container.querySelector('#sshdBtnRestart').addEventListener('click', () => this._restartSSHD());
    }

    /**
     * 通用 API 请求
     */
    async _apiRequest(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'ckms@9827',
            ...(options.headers || {})
        };

        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || `请求失败 (${response.status})`);
        }

        return response.json();
    }

    /**
     * 查询 SSHD 状态
     */
    async _checkStatus() {
        if (this._busy) return;
        this._busy = true;
        this._setButtonsDisabled(true);

        const statusIndicator = document.getElementById('sshdStatusIndicator');
        const statusText = document.getElementById('sshdStatusText');
        if (statusText) statusText.textContent = '查询中...';
        if (statusIndicator) statusIndicator.className = 'sshd-tool-status-indicator loading';

        try {
            const data = await this._apiRequest('/api/termux/sshd/status');
            this._status = data.status;
            this._message = data.message;
            this._updateStatusUI();
            this._showFeedback(data.message, true);
        } catch (err) {
            this._status = 'error';
            this._message = err.message;
            this._updateStatusUI();
            this._showFeedback(err.message, false);
        } finally {
            this._busy = false;
            this._setButtonsDisabled(false);
        }
    }

    /**
     * 启动 SSHD
     */
    async _startSSHD() {
        if (this._busy) return;
        this._busy = true;
        this._setButtonsDisabled(true);

        try {
            const data = await this._apiRequest('/api/termux/sshd/start', { method: 'POST' });
            this._showFeedback(data.message, data.success !== false);
            // 启动后刷新状态
            await this._checkStatus();
        } catch (err) {
            this._showFeedback(err.message, false);
            this._busy = false;
            this._setButtonsDisabled(false);
        }
    }

    /**
     * 重启 SSHD
     */
    async _restartSSHD() {
        if (this._busy) return;
        this._busy = true;
        this._setButtonsDisabled(true);

        try {
            const data = await this._apiRequest('/api/termux/sshd/restart', { method: 'POST' });
            this._showFeedback(data.message, data.success !== false);
            // 延迟 1 秒后刷新状态
            setTimeout(() => this._checkStatus(), 1200);
        } catch (err) {
            this._showFeedback(err.message, false);
            this._busy = false;
            this._setButtonsDisabled(false);
        }
    }

    /**
     * 更新状态指示灯和文字
     */
    _updateStatusUI() {
        const statusIndicator = document.getElementById('sshdStatusIndicator');
        const statusText = document.getElementById('sshdStatusText');

        if (statusIndicator) {
            statusIndicator.className = 'sshd-tool-status-indicator ' + (this._status || 'unknown');
        }

        if (statusText) {
            switch (this._status) {
                case 'running':
                    statusText.textContent = 'SSHD 正在运行';
                    break;
                case 'stopped':
                    statusText.textContent = 'SSHD 未运行';
                    break;
                case 'error':
                    statusText.textContent = '状态查询失败';
                    break;
                default:
                    statusText.textContent = '未知状态';
            }
        }
    }

    /**
     * 显示操作反馈文字
     */
    _showFeedback(message, success = true) {
        const feedback = document.getElementById('sshdFeedback');
        const feedbackText = document.getElementById('sshdFeedbackText');

        if (feedback && feedbackText) {
            feedbackText.textContent = message;
            feedback.className = 'sshd-tool-feedback visible ' + (success ? 'success' : 'error');

            // 5秒后自动隐藏
            clearTimeout(this._feedbackTimer);
            this._feedbackTimer = setTimeout(() => {
                if (feedback) feedback.className = 'sshd-tool-feedback';
            }, 5000);
        }
    }

    /**
     * 设置按钮禁用状态
     */
    _setButtonsDisabled(disabled) {
        const buttons = document.querySelectorAll('.sshd-tool-btn');
        buttons.forEach(btn => btn.disabled = disabled);
    }
}

export default SSHDTool;