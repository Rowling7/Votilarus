// ==================== 备忘录编辑模态框 ====================

import BaseModal from './BaseModal.js';
import ToastNotification from '../utils/ToastNotification.js';

// 从全局对象获取 TimeUtils（UMD 模式导出）
const TimeUtils = window.TimeUtils;

class NotebookEditModal extends BaseModal {
    constructor() {
        // 调用父类构造函数
        super({
            overlayClass: 'notebook-edit-modal-overlay',
            modalClass: 'notebook-edit-modal',
            closeOnOverlayClick: false,  // 禁止点击遮罩关闭
            closeOnEscape: false,         // 禁止 ESC 关闭
            enableMaximize: true          // 启用最大化
        });

        this.currentUuid = null;
        this.formData = {};

        this.init();
    }

    /**
     * 初始化模态框
     */
    init() {
        this.renderModal();
        // 调用父类的 bindEvents 方法绑定通用事件
        super.bindEvents();
        // 绑定自定义事件
        this._bindCustomEvents();
    }

    /**
     * 渲染模态框 HTML
     */
    renderModal() {
        // 创建遮罩层（初始状态为隐藏）
        this.overlay = document.createElement('div');
        this.overlay.className = 'notebook-edit-modal-overlay hidden';
        this.overlay.id = 'notebookEditModalOverlay';

        // 创建模态框
        this.modal = document.createElement('div');
        this.modal.className = 'notebook-edit-modal';
        this.modal.id = 'notebookEditModal';

        // 渲染内容
        this.modal.innerHTML = `
            <div class="notebook-edit-header">
                <h2>✏️ 编辑备忘录</h2>
            </div>
            <div class="notebook-edit-body">
                <form id="notebookEditForm" class="notebook-edit-form">
                    <!-- 标题 -->
                    <div class="form-group">
                        <label for="edit-note-title">标题 <span class="required">*</span></label>
                        <input type="text" id="edit-note-title" name="title" placeholder="请输入标题" required>
                    </div>

                    <!-- 类型选择 -->
                    <div class="form-group">
                        <label for="edit-note-type">类型</label>
                        <select id="edit-note-type" name="type">
                            <option value="work">💼 工作</option>
                            <option value="life">🏠 生活</option>
                            <option value="fun">🎮 娱乐</option>
                        </select>
                    </div>

                    <!-- 时间选择 -->
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-note-starttime">开始时间</label>
                            <input type="datetime-local" id="edit-note-starttime" name="starttime">
                        </div>
                        <div class="form-group">
                            <label for="edit-note-endtime">截止时间</label>
                            <input type="datetime-local" id="edit-note-endtime" name="endtime">
                        </div>
                    </div>

                    <!-- 内容 -->
                    <div class="form-group">
                        <label for="edit-note-content">内容 <span class="required">*</span></label>
                        <textarea id="edit-note-content" name="content" rows="6" placeholder="请输入内容" required></textarea>
                    </div>

                    <!-- 状态开关组 -->
                    <div class="form-group">
                        <label>状态标记</label>
                        <div class="switch-group">
                            <div class="switch-item">
                                <div class="switch" id="edit-note-top-switch"></div>
                                <span>置顶</span>
                            </div>
                            <div class="switch-item">
                                <div class="switch" id="edit-note-urgent-switch"></div>
                                <span>紧急</span>
                            </div>
                            <div class="switch-item">
                                <div class="switch" id="edit-note-important-switch"></div>
                                <span>重要</span>
                            </div>
                            <div class="switch-item">
                                <div class="switch" id="edit-note-done-switch"></div>
                                <span>已完成</span>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="notebook-edit-footer">
                <button class="btn btn-danger" id="delete-note-btn">删除</button>
                <div class="btn-group">
                    <button class="btn btn-secondary" id="cancel-edit-btn">取消</button>
                    <button class="btn btn-primary" id="save-note-btn">保存</button>
                </div>
            </div>
        `;

        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);

        // 缓存 DOM 元素
        this.formEl = document.getElementById('notebookEditForm');
        this.titleInput = document.getElementById('edit-note-title');
        this.typeSelect = document.getElementById('edit-note-type');
        this.starttimeInput = document.getElementById('edit-note-starttime');
        this.endtimeInput = document.getElementById('edit-note-endtime');
        this.contentInput = document.getElementById('edit-note-content');
        this.topSwitch = document.getElementById('edit-note-top-switch');
        this.urgentSwitch = document.getElementById('edit-note-urgent-switch');
        this.importantSwitch = document.getElementById('edit-note-important-switch');
        this.doneSwitch = document.getElementById('edit-note-done-switch');
    }

    /**
     * 绑定自定义事件
     * @private
     */
    _bindCustomEvents() {
        // 取消按钮
        document.getElementById('cancel-edit-btn').addEventListener('click', () => {
            this.close();
        });

        // 保存按钮
        document.getElementById('save-note-btn').addEventListener('click', () => {
            this.saveNote();
        });

        // 删除按钮
        document.getElementById('delete-note-btn').addEventListener('click', () => {
            this.deleteNote();
        });

        // 绑定开关切换事件
        this._bindSwitches();
    }

    /**
     * 绑定开关切换事件
     * @private
     */
    _bindSwitches() {
        const switches = [
            this.topSwitch,
            this.urgentSwitch,
            this.importantSwitch,
            this.doneSwitch
        ];

        switches.forEach(switchEl => {
            switchEl.addEventListener('click', () => {
                switchEl.classList.toggle('active');
            });
        });
    }

    /**
     * 打开模态框并加载数据
     * @param {string} uuid - 备忘录 UUID
     */
    async open(uuid) {
        if (this._isOpen) return;

        this.currentUuid = uuid;

        // 加载备忘录数据
        await this.loadNoteData(uuid);

        // 调用父类的 open 方法
        await super.open();
    }

    /**
     * 关闭模态框
     */
    close() {
        // 重置表单
        this.resetForm();
        this.currentUuid = null;

        // 调用父类的 close 方法
        super.close();
    }

    /**
     * 加载备忘录数据
     * @param {string} uuid - 备忘录 UUID
     */
    async loadNoteData(uuid) {
        try {
            const response = await fetch(`/api/notebook/detail/${uuid}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                this.fillFormData(result.data);
            } else {
                ToastNotification.error('获取备忘录详情失败: ' + result.error);
                this.close();
            }
        } catch (error) {
            console.error('NotebookEditModal: 加载数据失败:', error);
            ToastNotification.error('加载数据失败: ' + error.message);
            this.close();
        }
    }

    /**
     * 填充表单数据
     * @param {Object} data - 备忘录数据
     */
    fillFormData(data) {
        // 填充基本字段
        this.titleInput.value = data.title || '';
        this.typeSelect.value = data.type || 'work';
        this.contentInput.value = data.content || '';

        // 填充时间字段（转换为 datetime-local 格式）
        if (data.starttime) {
            this.starttimeInput.value = this.formatDateTimeLocal(data.starttime);
        }
        if (data.endtime) {
            this.endtimeInput.value = this.formatDateTimeLocal(data.endtime);
        }

        // 设置开关状态
        this.setSwitchState(this.topSwitch, data.top_flag === 1 || data.top_flag === '1');
        this.setSwitchState(this.urgentSwitch, data.urgent_flag === 1 || data.urgent_flag === '1');
        this.setSwitchState(this.importantSwitch, data.important_flag === 1 || data.important_flag === '1');
        this.setSwitchState(this.doneSwitch, data.done_flag === 1 || data.done_flag === '1');
    }

    /**
     * 设置开关状态
     * @param {HTMLElement} switchEl - 开关元素
     * @param {boolean} isActive - 是否激活
     */
    setSwitchState(switchEl, isActive) {
        if (isActive) {
            switchEl.classList.add('active');
        } else {
            switchEl.classList.remove('active');
        }
    }

    /**
     * 格式化时间为 datetime-local 格式
     * @param {string} dateTimeStr - 日期时间字符串
     * @returns {string} datetime-local 格式
     */
    formatDateTimeLocal(dateTimeStr) {
        if (!dateTimeStr) return '';

        // 将 "YYYY-MM-DD HH:mm:ss" 转换为 "YYYY-MM-DDTHH:mm"
        return dateTimeStr.replace(' ', 'T').substring(0, 16);
    }

    /**
     * 保存备忘录
     */
    async saveNote() {
        // 验证必填字段
        if (!this.validateForm()) {
            return;
        }

        // 收集表单数据
        const formData = this.collectFormData();

        try {
            const response = await fetch(`/api/notebook/${this.currentUuid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                ToastNotification.success('保存成功');

                // 刷新备忘录列表
                this.refreshNotebookList();

                // 关闭模态框
                this.close();
            } else {
                ToastNotification.error('保存失败: ' + result.error);
            }
        } catch (error) {
            console.error('NotebookEditModal: 保存失败:', error);
            ToastNotification.error('保存失败: ' + error.message);
        }
    }

    /**
     * 验证表单
     * @returns {boolean} 是否通过验证
     */
    validateForm() {
        const title = this.titleInput.value.trim();
        const content = this.contentInput.value.trim();

        if (!title) {
            ToastNotification.warning('请输入标题');
            this.titleInput.focus();
            return false;
        }

        if (!content) {
            ToastNotification.warning('请输入内容');
            this.contentInput.focus();
            return false;
        }

        return true;
    }

    /**
     * 收集表单数据
     * @returns {Object} 表单数据
     */
    collectFormData() {
        return {
            title: this.titleInput.value.trim(),
            content: this.contentInput.value.trim(),
            type: this.typeSelect.value,
            starttime: this.starttimeInput.value ? this.starttimeInput.value.replace('T', ' ') : null,
            endtime: this.endtimeInput.value ? this.endtimeInput.value.replace('T', ' ') : null,
            top_flag: this.topSwitch.classList.contains('active') ? 1 : 0,
            urgent_flag: this.urgentSwitch.classList.contains('active') ? 1 : 0,
            important_flag: this.importantSwitch.classList.contains('active') ? 1 : 0,
            done_flag: this.doneSwitch.classList.contains('active') ? 1 : 0
        };
    }

    /**
     * 删除备忘录
     */
    async deleteNote() {
        // 确认删除
        const confirmed = await this.showConfirmDialog('确定要删除这条备忘录吗？');

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/api/notebook/${this.currentUuid}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                ToastNotification.success('删除成功');

                // 刷新备忘录列表
                this.refreshNotebookList();

                // 关闭模态框
                this.close();
            } else {
                ToastNotification.error('删除失败: ' + result.error);
            }
        } catch (error) {
            console.error('NotebookEditModal: 删除失败:', error);
            ToastNotification.error('删除失败: ' + error.message);
        }
    }

    /**
     * 显示确认对话框
     * @param {string} message - 确认消息
     * @returns {Promise<boolean>} 用户是否确认
     */
    showConfirmDialog(message) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'confirm-dialog-overlay';

            const dialog = document.createElement('div');
            dialog.className = 'confirm-dialog';
            dialog.innerHTML = `
                <div class="confirm-dialog-message">${message}</div>
                <div class="confirm-dialog-buttons">
                    <button class="btn btn-secondary" id="confirm-cancel">取消</button>
                    <button class="btn btn-danger" id="confirm-ok">确定</button>
                </div>
            `;

            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            const handleCancel = () => {
                cleanup();
                resolve(false);
            };

            const handleOk = () => {
                cleanup();
                resolve(true);
            };

            const cleanup = () => {
                document.getElementById('confirm-cancel').removeEventListener('click', handleCancel);
                document.getElementById('confirm-ok').removeEventListener('click', handleOk);
                document.body.removeChild(overlay);
            };

            document.getElementById('confirm-cancel').addEventListener('click', handleCancel);
            document.getElementById('confirm-ok').addEventListener('click', handleOk);
        });
    }

    /**
     * 刷新备忘录列表
     */
    refreshNotebookList() {
        // 触发 NotebookWidget 刷新
        if (window.widgetManager) {
            const notebookWidgets = document.querySelectorAll('[data-widget-type="notebook"]');
            notebookWidgets.forEach(widget => {
                const widgetId = parseInt(widget.dataset.widgetId);
                if (widgetId && window.widgetManager.activeWidgets.has(widgetId)) {
                    window.widgetManager.refresh(widgetId);
                }
            });
        }
    }

    /**
     * 重置表单
     */
    resetForm() {
        this.formEl.reset();
        this.setSwitchState(this.topSwitch, false);
        this.setSwitchState(this.urgentSwitch, false);
        this.setSwitchState(this.importantSwitch, false);
        this.setSwitchState(this.doneSwitch, false);
    }
}

export default new NotebookEditModal();
