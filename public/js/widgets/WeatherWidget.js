// ==================== 天气小组件 ====================

import BaseWidget from './BaseWidget.js';

class WeatherWidget extends BaseWidget {
    /**
     * 构造函数
     * @param {HTMLElement} container - widget 容器元素
     * @param {Object} options - 配置选项
     */
    constructor(container, options = {}) {
        super(container);

        // 从 container 的 dataset 中读取配置
        const city = container.dataset.city || 'Beijing';
        const apiKey = container.dataset.apiKey || '269d058c99d1f3cdcd9232f62910df1d';

        this.options = {
            apiKey: apiKey,
            city: city,
            ...options
        };
        this.weatherData = null;
        this.isHovered = false;

        // 天气组件只支持 2x4 尺寸
        this.supportedSizes = ['2x4'];
    }

    /**
     * 渲染天气小组件
     */
    render() {
        // 创建天气 DOM 结构
        this.container.innerHTML = `
            <div class="weather-widget">
                <div class="weather-header">
                    <div class="weather-city-cn">--</div>
                    <div class="weather-city-en">--</div>
                </div>
                <div class="weather-main">
                    <div class="weather-icon-container">
                        <img class="weather-icon" src="" alt="天气图标">
                    </div>
                    <div class="weather-info">
                        <div class="weather-temp">--°C</div>
                        <div class="weather-desc">--</div>
                    </div>
                </div>
                <div class="weather-details-group group-1 active">
                    <div class="weather-detail-item">
                        <span class="detail-label">🌡️ 体感温度</span>
                        <span class="detail-value">--°C</span>
                    </div>
                    <div class="weather-detail-item">
                        <span class="detail-label">💨 风速</span>
                        <span class="detail-value">-- m/s</span>
                    </div>
                    <div class="weather-detail-item">
                        <span class="detail-label">🧭 风向</span>
                        <span class="detail-value">--</span>
                    </div>
                </div>
                <div class="weather-details-group group-2">
                    <div class="weather-detail-item">
                        <span class="detail-label">💧 湿度</span>
                        <span class="detail-value">--%</span>
                    </div>
                    <div class="weather-detail-item">
                        <span class="detail-label">☁️ 云量</span>
                        <span class="detail-value">--%</span>
                    </div>
                    <div class="weather-detail-item">
                        <span class="detail-label">📊 气压</span>
                        <span class="detail-value">-- hPa</span>
                    </div>
                </div>
            </div>
        `;

        // 添加鼠标悬停事件
        this.container.addEventListener('mouseenter', () => {
            this.isHovered = true;
            this.switchDetailsGroup();
        });

        this.container.addEventListener('mouseleave', () => {
            this.isHovered = false;
            this.switchDetailsGroup();
        });

        // 获取天气数据
        this.fetchWeatherData();

        // 设置定时器，每10分钟更新一次天气数据
        this.setInterval(() => {
            this.fetchWeatherData();
        }, 10 * 60 * 1000);

        return {
            destroy: () => this.destroy()
        };
    }

    /**
     * 切换详情组显示
     */
    switchDetailsGroup() {
        const group1 = this.container.querySelector('.group-1');
        const group2 = this.container.querySelector('.group-2');

        if (group1 && group2) {
            if (this.isHovered) {
                group1.classList.remove('active');
                group2.classList.add('active');
            } else {
                group1.classList.add('active');
                group2.classList.remove('active');
            }
        }
    }

    /**
     * 获取天气数据
     */
    async fetchWeatherData() {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(this.options.city)}&appid=${this.options.apiKey}&units=metric&lang=zh_cn`
            );
            const data = await response.json();

            if (data.cod === 200) {
                this.weatherData = data;
                this.updateWeatherDisplay(data);
            } else {
                console.error('获取天气数据失败:', data.message);
            }
        } catch (error) {
            console.error('获取天气数据异常:', error);
        }
    }

    /**
     * 更新天气显示
     * @param {Object} weatherData - 天气数据
     */
    updateWeatherDisplay(weatherData) {
        // 更新城市名（中文）
        const cityCnEl = this.container.querySelector('.weather-city-cn');
        if (cityCnEl) {
            cityCnEl.textContent = weatherData.name;
        }

        // 更新城市名（英文）
        const cityEnEl = this.container.querySelector('.weather-city-en');
        if (cityEnEl) {
            cityEnEl.textContent = weatherData.sys.country;
        }

        // 更新天气图标
        const iconEl = this.container.querySelector('.weather-icon');
        if (iconEl) {
            const iconUrl = `https://openweathermap.org/themes/openweathermap/assets/vendor/owm/img/widgets/${weatherData.weather[0].icon}.png`;
            iconEl.src = iconUrl;
        }

        // 更新温度
        const tempEl = this.container.querySelector('.weather-temp');
        if (tempEl) {
            tempEl.textContent = `${Math.round(weatherData.main.temp)}°C`;
        }

        // 更新天气描述
        const descEl = this.container.querySelector('.weather-desc');
        if (descEl) {
            descEl.textContent = weatherData.weather[0].description;
        }

        // 更新第一组详情
        const feelsLikeEl = this.container.querySelector('.group-1 .weather-detail-item:nth-child(1) .detail-value');
        if (feelsLikeEl) {
            feelsLikeEl.textContent = `${Math.round(weatherData.main.feels_like)}°C`;
        }

        const windSpeedEl = this.container.querySelector('.group-1 .weather-detail-item:nth-child(2) .detail-value');
        if (windSpeedEl) {
            windSpeedEl.textContent = `${weatherData.wind.speed} m/s`;
        }

        const windDegEl = this.container.querySelector('.group-1 .weather-detail-item:nth-child(3) .detail-value');
        if (windDegEl) {
            windDegEl.textContent = this.getWindDirection(weatherData.wind.deg);
        }

        // 更新第二组详情
        const humidityEl = this.container.querySelector('.group-2 .weather-detail-item:nth-child(1) .detail-value');
        if (humidityEl) {
            humidityEl.textContent = `${weatherData.main.humidity}%`;
        }

        const cloudsEl = this.container.querySelector('.group-2 .weather-detail-item:nth-child(2) .detail-value');
        if (cloudsEl) {
            cloudsEl.textContent = `${weatherData.clouds.all}%`;
        }

        const pressureEl = this.container.querySelector('.group-2 .weather-detail-item:nth-child(3) .detail-value');
        if (pressureEl) {
            pressureEl.textContent = `${weatherData.main.pressure} hPa`;
        }
    }

    /**
     * 根据风向角度获取风向名称
     * @param {number} deg - 风向角度
     * @returns {string} 风向名称
     */
    getWindDirection(deg) {
        const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
        const index = Math.round(deg / 45) % 8;
        return directions[index];
    }
}

export default WeatherWidget;
