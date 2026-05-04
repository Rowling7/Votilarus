// ==================== NavWidget Web Component ====================

class NavWidget extends HTMLElement {
    static get observedAttributes() {
        return ['type', 'size', 'uuid'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.widgetInstance = null;
        this.render();
    }

    connectedCallback() {
        this.initWidget();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && name === 'type') {
            this.destroyWidget();
            this.render();
            this.initWidget();
        }
    }

    disconnectedCallback() {
        this.destroyWidget();
    }

    render() {
        const type = this.getAttribute('type') || 'clock';
        const size = this.getAttribute('size') || '2x2';
        const uuid = this.getAttribute('uuid') || '';

        const [width, height] = size.split('x').map(Number);

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: absolute;
                }

                .widget-container {
                    width: calc(var(--cell-base-size, 4rem) * ${width} - var(--cell-gap, 1rem));
                    height: calc(var(--cell-base-size, 4rem) * ${height} - var(--cell-gap, 1rem));
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 1rem;
                    padding: 1rem;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                    overflow: hidden;
                }

                ::slotted(*) {
                    width: 100%;
                    height: 100%;
                }
            </style>
            <div class="widget-container" data-uuid="${uuid}" data-type="${type}">
                <slot></slot>
            </div>
        `;
    }

    initWidget() {
        const type = this.getAttribute('type');
        const container = this.shadowRoot.querySelector('.widget-container');

        // 根据类型创建不同的小组件
        switch(type) {
            case 'clock':
                this.widgetInstance = this.createClockWidget(container);
                break;
            case 'calendar':
                this.widgetInstance = this.createCalendarWidget(container);
                break;
            case 'weather':
                this.widgetInstance = this.createWeatherWidget(container);
                break;
            default:
                console.warn(`Unknown widget type: ${type}`);
        }
    }

    destroyWidget() {
        if (this.widgetInstance && this.widgetInstance.destroy) {
            this.widgetInstance.destroy();
        }
        this.widgetInstance = null;
    }

    createClockWidget(container) {
        const clockDiv = document.createElement('div');
        clockDiv.className = 'clock-widget';
        clockDiv.innerHTML = `
            <div class="widget-time">00:00:00</div>
            <div class="widget-date">YYYY-MM-DD</div>
            <div class="widget-weekday">星期X</div>
        `;

        container.appendChild(clockDiv);

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .clock-widget {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: white;
            }

            .widget-time {
                font-size: 2.5rem;
                font-weight: bold;
                color: var(--theme-color, #667eea);
            }

            .widget-date {
                font-size: 1rem;
                margin-top: 0.5rem;
                opacity: 0.8;
            }

            .widget-weekday {
                font-size: 0.9rem;
                margin-top: 0.25rem;
                opacity: 0.6;
            }
        `;
        this.shadowRoot.appendChild(style);

        // 启动时钟更新
        let intervalId = setInterval(() => {
            this.updateClock(clockDiv);
        }, 1000);
        this.updateClock(clockDiv);

        return {
            destroy: () => {
                clearInterval(intervalId);
            }
        };
    }

    updateClock(clockDiv) {
        const now = new Date();
        
        const timeEl = clockDiv.querySelector('.widget-time');
        if (timeEl) {
            timeEl.textContent = now.toLocaleTimeString('zh-CN', { hour12: false });
        }

        const dateEl = clockDiv.querySelector('.widget-date');
        if (dateEl) {
            dateEl.textContent = now.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        }

        const weekdayEl = clockDiv.querySelector('.widget-weekday');
        if (weekdayEl) {
            const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            weekdayEl.textContent = weekdays[now.getDay()];
        }
    }

    createCalendarWidget(container) {
        const calendarDiv = document.createElement('div');
        calendarDiv.className = 'calendar-widget';
        
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const today = now.getDate();

        // 生成日历
        const firstDay = new Date(year, month - 1, 1).getDay();
        const daysInMonth = new Date(year, month, 0).getDate();
        
        let calendarHTML = `
            <div class="calendar-header">${year}年${month}月</div>
            <div class="calendar-days-header">
                <div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div>
            </div>
            <div class="calendar-days">
        `;

        // 填充空白
        for (let i = 0; i < firstDay; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }

        // 填充日期
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === today ? 'today' : '';
            calendarHTML += `<div class="calendar-day ${isToday}">${day}</div>`;
        }

        calendarHTML += '</div>';
        calendarDiv.innerHTML = calendarHTML;
        container.appendChild(calendarDiv);

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .calendar-widget {
                display: flex;
                flex-direction: column;
                height: 100%;
                color: white;
            }

            .calendar-header {
                text-align: center;
                font-size: 1.2rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
                color: var(--theme-color, #667eea);
            }

            .calendar-days-header {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 0.25rem;
                margin-bottom: 0.5rem;
                font-size: 0.8rem;
                opacity: 0.6;
            }

            .calendar-days-header div {
                text-align: center;
            }

            .calendar-days {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 0.25rem;
                flex: 1;
            }

            .calendar-day {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.9rem;
                border-radius: 0.25rem;
            }

            .calendar-day.empty {
                visibility: hidden;
            }

            .calendar-day.today {
                background: var(--theme-color, #667eea);
                color: white;
                font-weight: bold;
            }
        `;
        this.shadowRoot.appendChild(style);

        return {
            destroy: () => {}
        };
    }

    createWeatherWidget(container) {
        const weatherDiv = document.createElement('div');
        weatherDiv.className = 'weather-widget';
        weatherDiv.innerHTML = `
            <div class="weather-icon">🌤️</div>
            <div class="weather-temp">25°C</div>
            <div class="weather-desc">晴朗</div>
            <div class="weather-location">北京</div>
        `;
        container.appendChild(weatherDiv);

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .weather-widget {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: white;
            }

            .weather-icon {
                font-size: 3rem;
                margin-bottom: 0.5rem;
            }

            .weather-temp {
                font-size: 2rem;
                font-weight: bold;
            }

            .weather-desc {
                font-size: 1rem;
                margin-top: 0.25rem;
                opacity: 0.8;
            }

            .weather-location {
                font-size: 0.9rem;
                margin-top: 0.5rem;
                opacity: 0.6;
            }
        `;
        this.shadowRoot.appendChild(style);

        // TODO: 接入真实天气 API
        return {
            destroy: () => {}
        };
    }

    // 公共方法：刷新小组件
    refresh() {
        this.destroyWidget();
        this.initWidget();
    }

    // 公共方法：获取小组件类型
    getType() {
        return this.getAttribute('type');
    }
}

// 注册自定义元素
customElements.define('nav-widget', NavWidget);

export default NavWidget;
