// ==================== 调休时长工具 ====================

import { DropdownMenu } from '../utils/DropdownMenu.js';

/**
 * 调休时长管理工具 - 用于控制台模态框
 * 功能：填写加班/调休记录，提交后自动刷新 compleave 小组件
 */
class CompLeaveTool {
    constructor() {
        this._busy = false;
    }

    /**
     * 渲染工具内容到容器
     * @param {HTMLElement} container - 右侧内容区容器
     */
    render(container) {
        this._busy = false;

        // 获取今天的日期作为默认值（YYYY-MM-DD HH:mm:ss 格式）
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const defaultDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        container.innerHTML = `
            <div class="compleave-tool">
                <h2 class="compleave-tool-title">⏱️ 调休时长</h2>
                <p class="compleave-tool-desc">记录加班或调休时长，提交后自动刷新调休小组件。</p>

                <form class="compleave-tool-form" id="compleaveForm">
                    <div class="compleave-tool-field">
                        <label class="compleave-tool-label">类型</label>
                        <button type="button" class="compleave-tool-select cl-type-trigger" id="clTypeTrigger">
                            <span class="cl-type-trigger-text">加班 +</span>
                            <svg class="cl-type-trigger-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
                                <polyline points="6,9 12,15 18,9"></polyline>
                            </svg>
                        </button>
                        <input type="hidden" id="clType" value="1" />
                    </div>

                    <div class="compleave-tool-field">
                        <label class="compleave-tool-label" for="clName">名称 / 备注</label>
                        <input class="compleave-tool-input" type="text" id="clName" placeholder="例如：周六加班、调休半天" required maxlength="50" />
                    </div>

                    <div class="compleave-tool-field">
                        <label class="compleave-tool-label">时长</label>
                        <div class="compleave-tool-duration">
                            <div class="compleave-tool-duration-item">
                                <input class="compleave-tool-input compleave-tool-duration-input" type="number" id="clHours" min="0" value="0" required />
                                <span class="compleave-tool-duration-unit">小时</span>
                            </div>
                            <div class="compleave-tool-duration-item">
                                <input class="compleave-tool-input compleave-tool-duration-input" type="number" id="clMinutes" min="0" max="59" value="0" required />
                                <span class="compleave-tool-duration-unit">分钟</span>
                            </div>
                        </div>
                    </div>

                    <div class="compleave-tool-field">
                        <label class="compleave-tool-label" for="clDate">日期</label>
                        <input class="compleave-tool-input" type="datetime-local" id="clDate" value="" required />
                    </div>

                    <button class="compleave-tool-btn" type="submit" id="compleaveSubmitBtn">
                        <svg class="compleave-tool-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                        提交记录
                    </button>
                </form>

                <div class="compleave-tool-feedback" id="compleaveFeedback">
                    <p class="compleave-tool-feedback-text" id="compleaveFeedbackText"></p>
                </div>
            </div>
        `;

        // 设置 datetime-local 默认值
        const dateInput = container.querySelector('#clDate');
        if (dateInput) {
            // datetime-local 需要格式：YYYY-MM-DDTHH:mm
            const localDefault = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
            dateInput.value = localDefault;
        }

        this._bindEvents(container);
    }

    /**
     * 绑定表单事件
     * @param {HTMLElement} container
     */
    _bindEvents(container) {
        const form = container.querySelector('#compleaveForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this._handleSubmit(container);
        });

        this._bindDropdownMenu(container);
    }

    /**
     * 绑定类型下拉菜单（使用 DropdownMenu 组件）
     * @param {HTMLElement} container
     */
    _bindDropdownMenu(container) {
        const trigger = container.querySelector('#clTypeTrigger');
        const hidden = container.querySelector('#clType');
        const textEl = container.querySelector('.cl-type-trigger-text');

        if (!trigger || !hidden) return;

        // 类型选项定义
        const typeOptions = [
            { label: '加班 +', value: '1', icon: '➕' },
            { label: '调休 -', value: '-1', icon: '➖' }
        ];

        // 根据当前选中值获取显示文本
        const getLabel = (val) => {
            const opt = typeOptions.find(o => o.value === val);
            return opt ? `${opt.icon} ${opt.label}` : '请选择';
        };

        // 持有当前菜单实例，用于 toggle 与清理
        let activeMenu = null;

        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // 二次点击触发器：关闭已打开的下拉菜单
            if (activeMenu && activeMenu.isVisible) {
                activeMenu.destroyAll();
                activeMenu = null;
                return;
            }

            // 确保任何残留菜单已关闭
            if (activeMenu) {
                activeMenu.destroyAll();
                activeMenu = null;
            }

            const rect = trigger.getBoundingClientRect();
            const currentValue = hidden.value;

            // onSelect: 选中后更新按钮文本与隐藏域值
            const onSelect = (item) => {
                hidden.value = item.value;
                textEl.textContent = `${item.icon} ${item.label}`;
                // 触发 change 事件以兼容其他监听
                hidden.dispatchEvent(new Event('change', { bubbles: true }));
            };

            // 构建菜单项，注入 action 回调
            const items = typeOptions.map(opt => ({
                label: opt.label,
                icon: opt.icon,
                selected: opt.value === currentValue,
                action: () => onSelect(opt)
            }));

            // 创建下拉菜单并显示
            activeMenu = new DropdownMenu(items, {
                closeOnSelect: true,
                onHide: () => {
                    // 下拉关闭后恢复按钮原始焦点样式
                    trigger.blur();
                    activeMenu = null;
                }
            });

            // 显示在触发器正下方
            const x = rect.left;
            const y = rect.bottom + 4;
            activeMenu.show(x, y);
        });

        // 初始化显示文本
        textEl.textContent = getLabel(hidden.value);
    }

    /**
     * 处理表单提交
     * @param {HTMLElement} container
     */
    async _handleSubmit(container) {
        if (this._busy) return;

        const typeEl = container.querySelector('#clType');
        const nameEl = container.querySelector('#clName');
        const hoursEl = container.querySelector('#clHours');
        const minutesEl = container.querySelector('#clMinutes');
        const dateEl = container.querySelector('#clDate');

        const name = nameEl?.value?.trim();
        const type = typeEl?.value;
        const hours = hoursEl?.value;
        const minutes = minutesEl?.value;
        const dateRaw = dateEl?.value;

        // 前端校验
        if (!name) {
            this._showFeedback('请输入名称/备注', false);
            return;
        }
        if (!type) {
            this._showFeedback('请选择类型', false);
            return;
        }
        if (!hours && !minutes && hours !== '0' && minutes !== '0') {
            this._showFeedback('请输入时长', false);
            return;
        }

        const hoursNum = parseInt(hours, 10) || 0;
        const minutesNum = parseInt(minutes, 10) || 0;

        if (hoursNum < 0 || minutesNum < 0 || minutesNum > 59) {
            this._showFeedback('时长格式无效：小时≥0，分钟0-59', false);
            return;
        }
        if (hoursNum === 0 && minutesNum === 0) {
            this._showFeedback('时长不能为 0', false);
            return;
        }
        if (!dateRaw) {
            this._showFeedback('请选择日期', false);
            return;
        }

        // 将 datetime-local 值转换为 "YYYY-MM-DD HH:mm:ss" 格式
        const date = dateRaw.replace('T', ' ') + ':00';

        this._busy = true;
        const submitBtn = container.querySelector('#compleaveSubmitBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '提交中...';
        }

        try {
            const response = await fetch('/api/compleave/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'ckms@9827'
                },
                body: JSON.stringify({
                    name,
                    hours: hoursNum,
                    minutes: minutesNum,
                    type,
                    date
                })
            });

            const result = await response.json();

            if (result.success) {
                this._showFeedback(result.message || '记录添加成功', true);

                // 清空名称字段方便连续录入
                if (nameEl) nameEl.value = '';
                if (hoursEl) hoursEl.value = '0';
                if (minutesEl) minutesEl.value = '0';

                // 刷新页面上所有 compleave 小组件
                this._refreshCompleaveWidgets();
            } else {
                this._showFeedback(result.error || '添加失败', false);
            }
        } catch (err) {
            console.error('[CompLeaveTool] 提交失败:', err);
            this._showFeedback('网络错误，提交失败', false);
        } finally {
            this._busy = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `
                    <svg class="compleave-tool-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                    提交记录
                `;
            }
        }
    }

    /**
     * 刷新页面上所有 compleave 小组件
     * @private
     */
    _refreshCompleaveWidgets() {
        if (window.widgetManager) {
            // 遍历所有活跃的 widget，找到 compleave 类型的并刷新
            window.widgetManager.activeWidgets.forEach((widget, widgetId) => {
                // CompleteLeaveWidget 实例的 widgetName 为 'CompleteLeaveWidget'
                if (widget.widgetName === 'CompleteLeaveWidget' && typeof widget.refresh === 'function') {
                    widget.refresh();
                }
            });

            // 作为双保险，同时对所有 compleave 类型的 grid-item 尝试通过 widgetManager.refresh 刷新
            const compleaveElements = document.querySelectorAll('[data-widget-type="compleave"]');
            compleaveElements.forEach(el => {
                const widgetId = parseInt(el.dataset.widgetId);
                if (widgetId && window.widgetManager.activeWidgets.has(widgetId)) {
                    window.widgetManager.refresh(widgetId);
                }
            });
        }
    }

    /**
     * 显示操作反馈文字
     * @param {string} message
     * @param {boolean} success
     * @private
     */
    _showFeedback(message, success = true) {
        const feedback = document.getElementById('compleaveFeedback');
        const feedbackText = document.getElementById('compleaveFeedbackText');

        if (feedback && feedbackText) {
            feedbackText.textContent = message;
            feedback.className = 'compleave-tool-feedback visible ' + (success ? 'success' : 'error');

            // 5秒后自动隐藏
            clearTimeout(this._feedbackTimer);
            this._feedbackTimer = setTimeout(() => {
                if (feedback) feedback.className = 'compleave-tool-feedback';
            }, 5000);
        }
    }
}

export default CompLeaveTool;