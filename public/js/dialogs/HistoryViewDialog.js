// ==================== 历史记录入口处理器 ====================

import HistoryViewModal from '../modal/HistoryViewModal.js';

class HistoryViewHandler {
    constructor() {
        this.btn = null;
    }

    /**
     * 初始化入口按钮
     */
    init() {
        this.btn = document.getElementById('historyEntryBtn');

        if (this.btn) {
            this.btn.addEventListener('click', () => {
                this.open();
            });
        }
    }

    /**
     * 打开历史记录模态框
     */
    async open() {
        await HistoryViewModal.open();
    }

    /**
     * 关闭历史记录模态框
     */
    close() {
        HistoryViewModal.close();
    }
}

export default new HistoryViewHandler();