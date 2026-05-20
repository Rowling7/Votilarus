// ==================== 备忘录小组件 ====================

import BaseWidget from './BaseWidget.js';

/**
 * 备忘录小组件
 * 显示笔记本列表，支持按状态筛选和查看详情
 */
class NotebookWidget extends BaseWidget {
    constructor(container, widgetId = null, widgetName = 'NotebookWidget') {
        super(container, widgetId, widgetName);
        // 备忘录组件支持 2x3 和 2x4 尺寸
        this.supportedSizes = ['2x3', '2x4'];
    }

    /**
     * 初始化组件
     */
    init() {
        if (!this.container) {
            console.error('NotebookWidget: 容器未找到');
            return;
        }

        // 渲染组件结构
        this.render();

        // 加载数据
        this.fetchNotes();
    }

    /**
     * 渲染组件HTML结构
     */
    render() {
        this.container.innerHTML = `
            <div class="notebook-container">
                <div class="notebook-header">
                    <div class="notebook-header-title">
                        <span>备忘录</span>
                    </div>
                </div>
                <div class="notebook-content">
                    <div class="notebook-loading">
                        <div class="spinner"></div>
                        <p>加载中...</p>
                    </div>
                </div>
            </div>
        `;

        // 绑定事件
        this.bindEvents();

        return {
            destroy: () => this.destroy()
        };
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 阻止滚动穿透
        this.addScrollPrevention();
    }

    /**
     * 阻止滚动穿透
     */
    addScrollPrevention() {
        const content = this.container.querySelector('.notebook-content');
        if (!content) return;

        content.addEventListener('wheel', (event) => {
            const scrollTop = content.scrollTop;
            const scrollHeight = content.scrollHeight;
            const height = content.clientHeight;
            const delta = event.deltaY;

            // 只在真正到达边界时才阻止默认行为
            const isAtTop = scrollTop === 0 && delta < 0;
            const isAtBottom = Math.ceil(scrollTop + height) >= scrollHeight - 1 && delta > 0;

            if (isAtTop || isAtBottom) {
                event.preventDefault();
            }

            // 始终阻止事件冒泡，防止影响父容器
            event.stopPropagation();
        }, { passive: false });
    }

    /**
     * 获取笔记列表
     */
    async fetchNotes() {
        try {
            const url = '/api/notebook/list?isdel=0';
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                this.displayNotes(result.data);
            } else {
                this.showError('获取笔记列表失败');
            }
        } catch (error) {
            console.error('NotebookWidget: 获取笔记列表失败:', error);
            this.showError('获取笔记列表失败: ' + error.message);
        }
    }

    /**
     * 显示笔记列表
     */
    displayNotes(notes) {
        const contentEl = this.container.querySelector('.notebook-content');
        if (!contentEl) return;

        if (!notes || notes.length === 0) {
            contentEl.innerHTML = `
                <div class="notebook-empty">
                    <!-- 图标占位符 -->
                    <p>暂无备忘录</p>
                </div>
            `;
            return;
        }

        // 生成笔记列表HTML
        const notesHTML = notes.map(note => this.createNoteItemHTML(note)).join('');

        contentEl.innerHTML = `
            <div class="notebook-list">
                ${notesHTML}
                <div class="end-of-list">------ 已到底啦 ------</div>
            </div>
        `;

        // 绑定笔记项点击事件
        this.bindNoteItemEvents();

        // 重新绑定滚动阻止
        this.addScrollPrevention();
    }

    /**
     * 创建单个笔记项HTML
     */
    createNoteItemHTML(note) {
        const isDone = note.isdone === '1' || note.done_flag === '1';
        const isImportant = note.important === '1' || note.important_flag === '1';
        const isUrgent = note.urgent === '1' || note.urgent_flag === '1';
        const isTop = note.top_flag === '1';

        // 确定状态样式
        let statusClass = '';

        if (isDone) {
            statusClass = 'done';
        } else if (isImportant && isUrgent) {
            statusClass = 'important-urgent';
        } else if (isImportant && !isUrgent) {
            statusClass = 'important-not-urgent';
        } else if (!isImportant && isUrgent) {
            statusClass = 'not-important-urgent';
        } else {
            statusClass = 'not-important-not-urgent';
        }

        // 置顶标签
        let topTagHTML = '';
        if (isTop) {
            const tagClass = (isImportant && isUrgent) ? 'important-urgent' : 'normal';
            topTagHTML = `<div class="note-top-tag ${tagClass}"></div>`;
        }

        // 截止时间
        const deadline = note.endtime || note.end_date || '未知';
        const deadlineFormatted = this.formatDeadline(deadline);

        return `
            <div class="note-item ${isDone ? 'done-item' : ''}" data-uuid="${note.uuid}">

                <div class="note-info">
                    <div class="note-title">
                        <span class="note-title-text">${note.title || '无标题'}</span>
                    </div>
                    <div class="note-meta">
                        <div class="note-deadline">
                            <span>Deadline: ${deadlineFormatted}</span>
                        </div>
                    </div>
                </div>
                ${topTagHTML}
            </div>
        `;
    }

    /**
     * 格式化截止时间显示
     */
    formatDeadline(deadline) {
        if (!deadline || deadline === '未知') return '未知';

        // 如果是完整的日期时间格式，提取日期部分
        if (deadline.includes(' ')) {
            return deadline.split(' ')[0];
        }

        return deadline;
    }

    /**
     * 绑定笔记项点击事件
     */
    bindNoteItemEvents() {

        const noteItems = this.container.querySelectorAll('.note-item');
        noteItems.forEach(item => {
            item.addEventListener('click', () => {

                const uuid = item.dataset.uuid;
                if (uuid && window.modalManager) {
                    window.modalManager.showNotebookModal(uuid);
                }
            });
        });
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        const contentEl = this.container.querySelector('.notebook-content');
        if (contentEl) {
            contentEl.innerHTML = `
                <div class="notebook-error">
                    <!-- 图标占位符 -->
                    <p>${message}</p>
                </div>
            `;
        }
    }

    /**
     * 刷新组件（实现BaseWidget的refresh接口）
     */
    refresh() {
        this.fetchNotes();
    }

    /**
     * 销毁组件
     */
    destroy() {
        super.destroy();
        // 清理事件监听器等资源
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// 导出组件类
export default NotebookWidget;

// 确保全局可以访问（用于HTML中的onclick等内联事件）
if (typeof window !== 'undefined') {
    window.NotebookWidget = NotebookWidget;
}
