// ==================== 天气小组件 ====================

import BaseWidget from './BaseWidget.js';

class WeatherWidget extends BaseWidget {
    /**
     * 构造函数
     * @param {HTMLElement} container - widget 容器元素
     * @param {number|null} widgetId - icon_widgets.id(数字ID)
     * @param {Object} options - 配置选项
     */
    constructor(container, widgetId = null, options = {}) {
        super(container, widgetId, 'WeatherWidget');

        // 从 container 的 dataset 中读取配置
        const city = container.dataset.city || 'Weihai';
        const apiKey = container.dataset.apiKey || '269d058c99d1f3cdcd9232f62910df1d';

        this.options = {
            apiKey: apiKey,
            city: city,
            ...options
        };
        this.weatherData = null;

        // 天气组件支持 2x2 和 2x4 尺寸
        this.supportedSizes = ['2x2', '2x3', '2x4'];
    }

    /**
     * 根据尺寸获取当前 widget 的大小
     * @returns {string} 尺寸字符串，如 '2x2'、'2x3' 或 '2x4'
     */
    getSize() {
        // 从 container 的 class 或 style 中推断尺寸
        // 2x2 约 200px 高, 2x3 约 300px 高, 2x4 约 400px 高
        const height = this.container.offsetHeight;
        if (height <= 250) return '2x2';
        if (height <= 350) return '2x3';
        return '2x4';
    }

    /**
     * 渲染天气小组件
     */
    render() {
        this.updateLayout();

        // 添加翻转交互（2x2 尺寸）
        const flipCard = this.container.querySelector('.weather-details-compact .flip-card');
        if (flipCard) {
            flipCard.addEventListener('mouseenter', () => {
                flipCard.classList.add('flipped');
            });

            flipCard.addEventListener('mouseleave', () => {
                flipCard.classList.remove('flipped');
            });
        }

        // 获取天气数据
        this.fetchWeatherData();

        // 设置定时器,每10分钟更新一次天气数据
        this.setInterval(() => {
            this.fetchWeatherData();
        }, 10 * 60 * 1000);

        return {
            destroy: () => this.destroy()
        };
    }

    /**
     * 根据尺寸更新布局
     */
    updateLayout() {
        const size = this.getSize();

        if (size === '2x2') {
            // 2x2 简化布局 - 体感温度、风速、风向
            this.container.innerHTML = `
                <div class="weather-widget size-2x2">
                    <div class="weather-location">
                        <span class="location-name">--</span>
                        <span class="location-icon location-pin"></span>
                    </div>
                    <div class="weather-main">
                        <div class="weather-temp-large">--°</div>
                        <div class="weather-icon-desc">
                            <img class="weather-icon" src="" alt="天气">
                            <div class="weather-desc">--</div>
                        </div>
                    </div>
                    <div class="weather-details-compact">
                        <div class="flip-card">
                            <div class="flip-card-inner">
                                <div class="flip-card-front">
                                    <div class="detail-item">
                                        <span class="detail-label">体感温度</span>
                                        <span class="detail-value">--°C</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">风速 m/s</span>
                                        <span class="detail-value">--</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">风向</span>
                                        <span class="detail-value">--</span>
                                    </div>
                                </div>
                                <div class="flip-card-back">
                                    <div class="detail-item">
                                        <span class="detail-label">湿度</span>
                                        <span class="detail-value">--%</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">大气压</span>
                                        <span class="detail-value">-- hPa</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">云量</span>
                                        <span class="detail-value">--%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (size === '2x3' || size === '2x4') {
            // 2x3 和 2x4 布局 - 右侧竖向排列体感温度、风速、风向
            this.container.innerHTML = `
                <div class="weather-widget size-${size}">
                    <div class="weather-location">
                        <span class="location-name">--</span>
                        <span class="location-icon location-pin"></span>
                    </div>
                    <div class="weather-content">
                        <div class="weather-main">
                            <div class="weather-temp-large">--°</div>
                            <div class="weather-icon-desc">
                                <img class="weather-icon" src="" alt="天气">
                                <div class="weather-desc">--</div>
                            </div>
                        </div>
                        <div class="weather-details-vertical">
                            <div class="detail-item">
                                <span class="detail-label">体感温度</span>
                                <span class="detail-value">--°C</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">风速 m/s</span>
                                <span class="detail-value">--</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">风向</span>
                                <span class="detail-value">--</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    /**
     * 从天气图标提取主色调
     * @param {string} iconUrl - 图标 URL
     * @returns {Promise<string>} RGB 颜色字符串
     */
    async extractIconColor(iconUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';

            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;

                    ctx.drawImage(img, 0, 0);

                    // 获取所有像素数据
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    let r = 0, g = 0, b = 0, count = 0;

                    // 计算平均颜色,忽略透明像素
                    for (let i = 0; i < data.length; i += 4) {
                        const alpha = data[i + 3];
                        if (alpha > 128) { // 只计算不透明的像素
                            r += data[i];
                            g += data[i + 1];
                            b += data[i + 2];
                            count++;
                        }
                    }

                    if (count > 0) {
                        r = Math.round(r / count);
                        g = Math.round(g / count);
                        b = Math.round(b / count);
                        resolve(`rgb(${r}, ${g}, ${b})`);
                    } else {
                        resolve('rgba(102, 126, 234, 0.3)'); // 默认颜色
                    }
                } catch (error) {
                    console.error('提取图标颜色失败:', error);
                    resolve('rgba(102, 126, 234, 0.3)'); // 默认颜色
                }
            };

            img.onerror = () => {
                resolve('rgba(102, 126, 234, 0.3)'); // 默认颜色
            };

            img.src = iconUrl;
        });
    }

    /**
     * 应用背景色到组件
     * @param {string} color - RGB 颜色字符串
     */
    applyBackgroundColor(color) {
        const widget = this.container.querySelector('.weather-widget');
        if (widget) {
            // 将颜色转换为低透明度的背景
            widget.style.background = color.replace('rgb', 'rgba').replace(')', ', 0.15)');
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

                // 提取并应用图标颜色
                const iconUrl = `https://openweathermap.org/themes/openweathermap/assets/vendor/owm/img/widgets/${data.weather[0].icon}.png`;
                const color = await this.extractIconColor(iconUrl);
                this.applyBackgroundColor(color);
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
        // 更新位置名称
        const locationNameEl = this.container.querySelector('.location-name');
        if (locationNameEl) {
            locationNameEl.textContent = weatherData.name;
        }

        // 更新天气图标
        const iconEl = this.container.querySelector('.weather-icon');
        if (iconEl) {
            const iconUrl = `https://openweathermap.org/themes/openweathermap/assets/vendor/owm/img/widgets/${weatherData.weather[0].icon}.png`;
            iconEl.src = iconUrl;
        }

        // 更新大温度
        const tempLargeEl = this.container.querySelector('.weather-temp-large');
        if (tempLargeEl) {
            tempLargeEl.textContent = `${Math.round(weatherData.main.temp)}°`;
        }

        // 更新天气描述
        const descEl = this.container.querySelector('.weather-desc');
        if (descEl) {
            descEl.textContent = weatherData.weather[0].description;
        }

        // 更新正面数据 - 体感温度
        const feelsLikeEl = this.container.querySelector('.weather-details-compact .detail-item:nth-child(1) .detail-value, .weather-details-vertical .detail-item:nth-child(1) .detail-value');
        if (feelsLikeEl) {
            feelsLikeEl.textContent = `${Math.round(weatherData.main.feels_like)}°C`;
        }

        // 更新正面数据 - 风速（添加风力等级）
        const windSpeedEl = this.container.querySelector('.weather-details-compact .flip-card-front .detail-item:nth-child(2) .detail-value, .weather-details-vertical .detail-item:nth-child(2) .detail-value');
        if (windSpeedEl) {
            const windSpeed = weatherData.wind.speed;
            const windLevel = this.getWindLevel(windSpeed);
            windSpeedEl.textContent = `${windLevel} | ${windSpeed.toFixed(2)}`;
        }

        // 更新正面数据 - 风向
        const windDegEl = this.container.querySelector('.weather-details-compact .flip-card-front .detail-item:nth-child(3) .detail-value, .weather-details-vertical .detail-item:nth-child(3) .detail-value');
        if (windDegEl) {
            const windInfo = this.getWindDirection(weatherData.wind.deg);
            windDegEl.innerHTML = `<span class="wind-arrow">${windInfo.arrow}</span> ${windInfo.name}`;
        }

        // 更新背面数据 - 湿度
        const humidityEl = this.container.querySelector('.weather-details-compact .flip-card-back .detail-item:nth-child(1) .detail-value');
        if (humidityEl) {
            humidityEl.textContent = `${weatherData.main.humidity}%`;
        }

        // 更新背面数据 - 大气压
        const pressureEl = this.container.querySelector('.weather-details-compact .flip-card-back .detail-item:nth-child(2) .detail-value');
        if (pressureEl) {
            pressureEl.textContent = `${weatherData.main.pressure} hPa`;
        }

        // 更新背面数据 - 云量
        const cloudsEl = this.container.querySelector('.weather-details-compact .flip-card-back .detail-item:nth-child(3) .detail-value');
        if (cloudsEl) {
            cloudsEl.textContent = `${weatherData.clouds.all}%`;
        }
    }

    /**
     * 根据风速（m/s）计算风力等级
     * @param {number} speed - 风速 m/s
     * @returns {number} 风力等级
     */
    getWindLevel(speed) {
        if (speed < 0.3) return 0;
        if (speed < 1.6) return 1;
        if (speed < 3.4) return 2;
        if (speed < 5.5) return 3;
        if (speed < 8.0) return 4;
        if (speed < 10.8) return 5;
        if (speed < 13.9) return 6;
        if (speed < 17.2) return 7;
        if (speed < 20.8) return 8;
        if (speed < 24.5) return 9;
        if (speed < 28.5) return 10;
        if (speed < 32.7) return 11;
        return 12;
    }

    /**
     * 根据风向角度获取风向名称和箭头
     * @param {number} deg - 风向角度
     * @returns {Object} 包含名称和箭头的对象
     */
    getWindDirection(deg) {
        const directions = [
            { name: '北', arrow: '↑' },
            { name: '东北', arrow: '↗' },
            { name: '东', arrow: '→' },
            { name: '东南', arrow: '↘' },
            { name: '南', arrow: '↓' },
            { name: '西南', arrow: '↙' },
            { name: '西', arrow: '←' },
            { name: '西北', arrow: '↖' }
        ];
        const index = Math.round(deg / 45) % 8;
        return {
            name: directions[index].name,
            arrow: directions[index].arrow
        };
    }

    /**
     * 刷新天气显示
     */
    refresh() {
        // 重新获取天气数据并更新显示
        this.fetchWeatherData();
    }
}

export default WeatherWidget;
