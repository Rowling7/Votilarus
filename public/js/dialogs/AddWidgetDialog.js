// ==================== 添加小组件对话框处理器 ====================

import ToastNotification from '../utils/ToastNotification.js';

class AddWidgetDialogHandler {
    constructor() {
        this.dialog = null;
        this.overlay = null;
        this.currentCategoryId = null;

        // 可用的小组件列表
        this.availableWidgets = [
            { id: 'clock', name: 'ClockWidget', icon: '⏰', description: '显示当前时间' },
            { id: 'calendar', name: 'CalendarWidget', icon: '📅', description: '显示日期、周数、农历信息' },
            { id: 'weather', name: 'WeatherWidget', icon: '☀️', description: '显示天气信息' },
            { id: 'notebook', name: 'NotebookWidget', icon: '📒', description: '备忘录，支持重要/紧急/完成状态筛选' },
            { id: 'worktime', name: 'WorkTimeWidget', icon: '⌛', description: '工作时间' },
            { id: 'completeleave', name: 'CompleteLeaveWidget', icon: '🏖️', description: '调休时间' },
            { id: 'yiyan', name: 'YiyanWidget', icon: '💬', description: '一言' },
            { id: 'search', name: 'SearchWidget', icon: '🔍', description: '搜索快捷方式' },
            { id: 'hotpoint', name: 'HotPointWidget', icon: '🔥', description: '热搜' },
            { id: 'folder', name: 'FolderWidget', icon: '📁', description: '收纳常用图标，快速访问' }
        ];
    }

    /**
     * 初始化对话框
     */
    init() {
        this.createDialog();
    }

    /**
     * 创建对话框 DOM
     */
    createDialog() {
        // 遮罩层
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';

        // 对话框
        this.dialog = document.createElement('div');
        this.dialog.className = 'icon-editor-dialog';
        this.dialog.style.maxWidth = '600px';

        this.dialog.innerHTML = `
            <div class="dialog-header">
                <h3>🧩 添加小组件</h3>
                <button class="dialog-close-btn" aria-label="关闭">×</button>
            </div>
            <div class="dialog-body">
                <div class="widget-list" id="widget-list">
                    ${this.generateWidgetList()}
                </div>
            </div>
            <div class="dialog-footer">
                <button class="btn btn-secondary" id="cancel-add-widget-btn">取消</button>
            </div>
        `;

        document.body.appendChild(this.overlay);
        document.body.appendChild(this.dialog);

        this.bindEvents();
    }

    /**
     * 生成小组件列表 HTML
     */
    generateWidgetList() {
        return this.availableWidgets.map(widget => `
            <div class="widget-item" data-widget-id="${widget.id}">
                <div class="widget-icon">${widget.icon}</div>
                <div class="widget-info">
                    <div class="widget-name">${widget.name}</div>
                    <div class="widget-description">${widget.description}</div>
                </div>
                <button class="btn btn-primary widget-add-btn">添加</button>
            </div>
        `).join('');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 关闭按钮
        const closeBtn = this.dialog.querySelector('.dialog-close-btn');
        closeBtn.addEventListener('click', () => this.close());

        // 点击遮罩层
        this.overlay.addEventListener('click', () => this.close());

        // ESC 键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.dialog.classList.contains('active')) {
                this.close();
            }
        });

        // 取消按钮
        const cancelBtn = document.getElementById('cancel-add-widget-btn');
        cancelBtn.addEventListener('click', () => this.close());

        // 添加按钮点击
        this.dialog.addEventListener('click', (e) => {
            const addBtn = e.target.closest('.widget-add-btn');
            if (addBtn) {
                const widgetItem = addBtn.closest('.widget-item');
                const widgetId = widgetItem.dataset.widgetId;
                this.addWidget(widgetId);
            }
        });
    }

    /**
     * 打开对话框
     */
    open(categoryId) {
        this.currentCategoryId = categoryId;

        // 显示对话框
        this.overlay.classList.add('active');
        this.dialog.classList.add('active');
    }

    /**
     * 关闭对话框
     */
    close() {
        this.overlay.classList.remove('active');
        this.dialog.classList.remove('active');
        this.currentCategoryId = null;
    }

    /**
     * 添加小组件
     */
    async addWidget(widgetId) {
        try {
            const { createWidget } = await import('../core/api-client.js');

            // 小组件名称和默认大小映射
            const widgetConfigs = {
                'clock': { title: 'ClockWidget', width: 2, height: 2 },
                'calendar': { title: 'CalendarWidget', width: 2, height: 2 },
                'weather': { title: 'WeatherWidget', width: 2, height: 4 },
                'notebook': { title: 'NotebookWidget', width: 2, height: 3 },
                'worktime': { title: 'WorkTimeWidget', width: 2, height: 2 },
                'completeleave': { title: 'CompleteLeaveWidget', width: 2, height: 2 },
                'yiyan': { title: 'YiyanWidget', width: 2, height: 4 },
                'search': { title: 'SearchWidget', width: 2, height: 3 },
                'hotpoint': { title: 'HotPointWidget', width: 2, height: 3 },
                'folder': { title: 'FolderWidget', width: 2, height: 2 }
        }; 

        const config = widgetConfigs[widgetId] || { title: widgetId, width: 2, height: 2 };

        const result = await createWidget({
            title: config.title,
            category_id: this.currentCategoryId,
            width: config.width,
            height: config.height,
            active_flag: 1
        });

        ToastNotification.success(`小组件 "${config.title}" 添加成功！请刷新页面查看`);
        this.close();
    } catch(error) {
        ToastNotification.error('添加失败: ' + error.message);
    }
}
}

export default new AddWidgetDialogHandler();
