// ==================== 时钟小组件 ====================

class ClockWidget {
    constructor() {
        this.container = null;
        this.updateInterval = null;
    }

    /**
     * 渲染时钟小组件
     */
    render() {
        this.container = document.createElement('div');
        this.container.className = 'widget clock-widget';
        
        this.container.innerHTML = `
            <div class="widget-time" id="widget-time">00:00:00</div>
            <div class="widget-date" id="widget-date">YYYY-MM-DD</div>
            <div class="widget-weekday" id="widget-weekday">星期X</div>
        `;
        
        // 开始更新
        this.startUpdate();
        
        return this.container;
    }

    /**
     * 开始更新时间
     */
    startUpdate() {
        this.updateTime();
        this.updateInterval = setInterval(() => {
            this.updateTime();
        }, 1000);
    }

    /**
     * 更新时间显示
     */
    updateTime() {
        const now = new Date();
        
        // 时间
        const timeEl = document.getElementById('widget-time');
        if (timeEl) {
            timeEl.textContent = now.toLocaleTimeString('zh-CN', { hour12: false });
        }
        
        // 日期
        const dateEl = document.getElementById('widget-date');
        if (dateEl) {
            dateEl.textContent = now.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        }
        
        // 星期
        const weekdayEl = document.getElementById('widget-weekday');
        if (weekdayEl) {
            const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            weekdayEl.textContent = weekdays[now.getDay()];
        }
    }

    /**
     * 销毁小组件
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

export default new ClockWidget();
