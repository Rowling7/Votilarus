// ==================== Tooltip 气泡提示管理器 ====================

class TooltipManager {
    constructor() {
        this.tooltip = null;
        this.showDelay = 300; // 默认延迟 300ms
        this.hideDelay = 100;
        this.showTimer = null;
        this.hideTimer = null;
    }

    /**
     * 初始化 Tooltip
     */
    init() {
        this.createTooltipElement();
        this.bindGlobalEvents();
    }

    /**
     * 创建 Tooltip DOM
     */
    createTooltipElement() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tooltip';
        document.body.appendChild(this.tooltip);
    }

    /**
     * 绑定全局事件
     */
    bindGlobalEvents() {
        // 监听所有带有 data-tooltip 属性的元素
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.scheduleShow(target.dataset.tooltip, target);
            }
        });

        document.addEventListener('mouseout', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.scheduleHide();
            }
        });
    }

    /**
     * 计划显示 Tooltip
     */
    scheduleShow(text, targetElement) {
        // 清除之前的定时器
        if (this.showTimer) {
            clearTimeout(this.showTimer);
        }
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
        }

        // 延迟显示
        this.showTimer = setTimeout(() => {
            this.show(text, targetElement);
        }, this.showDelay);
    }

    /**
     * 计划隐藏 Tooltip
     */
    scheduleHide() {
        if (this.showTimer) {
            clearTimeout(this.showTimer);
            this.showTimer = null;
        }

        this.hideTimer = setTimeout(() => {
            this.hide();
        }, this.hideDelay);
    }

    /**
     * 显示 Tooltip
     */
    show(text, targetElement) {
        if (!text || !targetElement) return;

        // 设置文本
        this.tooltip.textContent = text;

        // 计算位置
        const position = this.calculatePosition(targetElement);
        
        // 应用位置和箭头方向
        this.tooltip.style.left = `${position.x}px`;
        this.tooltip.style.top = `${position.y}px`;
        this.tooltip.className = `tooltip visible ${position.arrowClass}`;
    }

    /**
     * 隐藏 Tooltip
     */
    hide() {
        this.tooltip.classList.remove('visible');
    }

    /**
     * 计算 Tooltip 位置
     */
    calculatePosition(targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // 默认显示在下方
        let x = rect.left + (rect.width - tooltipRect.width) / 2;
        let y = rect.bottom + 10;
        let arrowClass = 'position-bottom';

        // 检查是否超出右边界
        if (x + tooltipRect.width > viewportWidth) {
            x = viewportWidth - tooltipRect.width - 10;
        }

        // 检查是否超出左边界
        if (x < 10) {
            x = 10;
        }

        // 检查是否超出下边界，如果是则显示在上方
        if (y + tooltipRect.height > viewportHeight) {
            y = rect.top - tooltipRect.height - 10;
            arrowClass = 'position-top';
        }

        return { x, y, arrowClass };
    }

    /**
     * 设置显示延迟
     */
    setDelay(delay) {
        this.showDelay = delay;
    }
}

export default new TooltipManager();
