// ==================== EasyMod 简洁模式渲染器 ====================

/**
 * EasyMod 渲染器 - 管理简洁模式的进入/退出
 * 
 * 交互逻辑：
 * 1. 点击按钮 → sidebar + contentArea + dock 隐藏
 * 2. searchBox 以贝塞尔曲线动画移动到视口正中心，初始完全可见
 * 3. 时间元素出现在搜索框上方，显示 HH:mm:ss (82px) 和日期 (48px)
 * 4. 搜索框和时间容器到达后 10 秒内渐隐到 10% 透明度（90% 透明）
 * 5. 鼠标 hover 搜索框或时间容器时 2 秒内恢复到完全可见
 * 6. 再次点击 / ESC → 各元素以动画平滑退出回原位
 * 7. 移动端自适应宽度，允许输入
 */
class EasyModRenderer {
    constructor() {
        this._active = false;
        this._arrived = false;
        this._timeContainer = null;
        this._timeUpdateTimer = null;
        this._arrivedTimer = null;
        this._exitTimer = null;
        this._button = null;
        
        // 缓存DOM引用
        this._sidebar = null;
        this._contentArea = null;
        this._searchBox = null;
        this._dock = null;
    }

    /**
     * 初始化简洁模式
     */
    init() {
        this._cacheSelectors();
        this._bindEvents();
        this._createTimeContainer();
    }

    /**
     * 缓存DOM选择器
     * @private
     */
    _cacheSelectors() {
        this._sidebar = document.getElementById('sidebar');
        this._contentArea = document.getElementById('contentArea');
        this._searchBox = document.getElementById('searchBox');
        this._dock = document.getElementById('dock');
        this._button = document.getElementById('easymod-button');
    }

    /**
     * 绑定事件
     * @private
     */
    _bindEvents() {
        if (!this._button) {
            console.warn('[EasyMod] 未找到按钮元素 #easymod-button');
            return;
        }

        this._button.addEventListener('click', () => {
            this.toggle();
        });

        // ESC键退出简洁模式
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this._active) {
                this.deactivate();
            }
        });
    }

    /**
     * 切换简洁模式状态
     */
    toggle() {
        if (this._active) {
            this.deactivate();
        } else {
            this.activate();
        }
    }

    /**
     * 激活简洁模式
     * 
     * 流程：
     * 1. body 添加 easymod-active → sidebar/contentArea/dock 渐隐
     * 2. searchBox 贝塞尔曲线动画移动到视口中心（opacity=1 完全可见）
     * 3. 时间容器渐显（opacity=1 完全可见）
     * 4. 650ms 动画到达后添加 easymod-arrived → 10 秒内渐隐到 0.1
     * 5. hover 恢复完全可见
     */
    activate() {
        if (this._active) return;
        this._active = true;

        const searchBox = this._searchBox;
        const timeContainer = this._timeContainer;

        // 清除可能残留的退出动画类
        document.body.classList.remove('easymod-exiting');

        // 给body添加激活类，触发CSS动画
        document.body.classList.add('easymod-active');

        // 按钮激活态
        if (this._button) {
            this._button.classList.add('active');
        }

        // 显示时间容器（初始完全可见 opacity=1）
        this._showTimeContainer();
        this._startTimeUpdate();

        // 清除旧计时器
        this._clearTimers();

        // 等CSS动画（0.6s贝塞尔曲线）完成后，添加 arrived class
        // arrived 会触发 10 秒渐隐到 0.1（90% 透明）
        this._arrived = false;
        this._arrivedTimer = setTimeout(() => {
            this._arrived = true;

            // 搜索框开始渐隐到 10%
            if (searchBox) {
                searchBox.classList.add('easymod-arrived');
            }

            // 时间容器同步开始渐隐到 10%
            if (timeContainer) {
                timeContainer.classList.add('easymod-arrived');
            }
        }, 650);
    }

    /**
     * 退出简洁模式
     * 
     * 流程：
     * 1. 移除 arrived class（中断渐隐动画）
     * 2. 添加 easymod-exiting 类启动退出动画
     * 3. 等待退出动画完成后移除所有类并隐藏时间容器
     */
    deactivate() {
        if (!this._active) return;
        this._active = false;
        this._arrived = false;

        // 清除计时器
        this._clearTimers();

        // 移除搜索框和时间容器的 arrived class（中断渐隐）
        const searchBox = this._searchBox;
        const timeContainer = this._timeContainer;
        if (searchBox) {
            searchBox.classList.remove('easymod-arrived');
        }
        if (timeContainer) {
            timeContainer.classList.remove('easymod-arrived');
        }

        // 移除激活类，添加退出动画类
        document.body.classList.remove('easymod-active');
        document.body.classList.add('easymod-exiting');

        // 按钮取消激活
        if (this._button) {
            this._button.classList.remove('active');
        }

        // 隐藏时间容器
        this._hideTimeContainer();
        this._stopTimeUpdate();

        // 等待退出动画完成（0.5s）后清理 exiting 类
        // 此时 CSS 中的 transition 已经让所有元素回到原位
        this._exitTimer = setTimeout(() => {
            document.body.classList.remove('easymod-exiting');
        }, 550);
    }

    /**
     * 清除所有计时器
     * @private
     */
    _clearTimers() {
        if (this._arrivedTimer) {
            clearTimeout(this._arrivedTimer);
            this._arrivedTimer = null;
        }
        if (this._exitTimer) {
            clearTimeout(this._exitTimer);
            this._exitTimer = null;
        }
    }

    /**
     * 创建时间显示容器
     * @private
     */
    _createTimeContainer() {
        if (this._timeContainer) return;

        this._timeContainer = document.createElement('div');
        this._timeContainer.className = 'easymod-time-container';
        this._timeContainer.innerHTML = `
            <div class="easymod-time-time" id="easymodTimeDisplay">00:00:00</div>
            <div class="easymod-time-date" id="easymodDateDisplay">2026年1月1日 星期四</div>
        `;
        document.body.appendChild(this._timeContainer);
    }

    /**
     * 显示时间容器
     * @private
     */
    _showTimeContainer() {
        if (!this._timeContainer) this._createTimeContainer();
        this._timeContainer.classList.remove('hidden');
        this._timeContainer.classList.add('visible');
        this._updateTimeDisplay();
    }

    /**
     * 隐藏时间容器
     * @private
     */
    _hideTimeContainer() {
        if (this._timeContainer) {
            this._timeContainer.classList.remove('visible');
            this._timeContainer.classList.add('hidden');
        }
    }

    /**
     * 启动时间更新
     * @private
     */
    _startTimeUpdate() {
        this._stopTimeUpdate();
        this._updateTimeDisplay();
        // 每秒更新一次
        this._timeUpdateTimer = setInterval(() => {
            this._updateTimeDisplay();
        }, 1000);
    }

    /**
     * 停止时间更新
     * @private
     */
    _stopTimeUpdate() {
        if (this._timeUpdateTimer) {
            clearInterval(this._timeUpdateTimer);
            this._timeUpdateTimer = null;
        }
    }

    /**
     * 更新时间显示
     * @private
     */
    _updateTimeDisplay() {
        const now = new Date();
        
        // 更新时间 HH:mm:ss
        const timeEl = document.getElementById('easymodTimeDisplay');
        if (timeEl) {
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            timeEl.textContent = `${hours}:${minutes}:${seconds}`;
        }

        // 更新日期
        const dateEl = document.getElementById('easymodDateDisplay');
        if (dateEl) {
            const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const day = now.getDate();
            const weekday = weekdays[now.getDay()];
            dateEl.textContent = `${year}年${month}月${day}日 ${weekday}`;
        }
    }

    /**
     * 获取当前激活状态
     * @returns {boolean}
     */
    isActive() {
        return this._active;
    }
}

// 单例模式
const easymodRenderer = new EasyModRenderer();

export default easymodRenderer;