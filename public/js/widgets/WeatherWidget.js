// ==================== 天气小组件 ====================

import BaseWidget from './BaseWidget.js';
import weatherCache from '../utils/WeatherCache.js';
import CityModal from '../components/CityModal.js';

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
        this.cityModal = null;
        this.forecastModal = null;
        this.extractedColor = 'rgba(102, 126, 234, 0.3)'; // 存储提取的颜色

        // 天气组件支持 2x2 和 2x4 尺寸
        this.supportedSizes = ['2x2', '2x3', '2x4'];
    }

    /**
     * 根据尺寸获取当前 widget 的大小
     * @returns {string} 尺寸字符串，如 '2x2'、'2x3' 或 '2x4'
     */
    getSize() {
        // 从父元素（grid-item）的 data-size 属性中读取尺寸
        const gridItem = this.container.closest('.grid-item');
        if (gridItem) {
            const sizeAttr = gridItem.getAttribute('data-size');
            if (sizeAttr && ['2x2', '2x3', '2x4'].includes(sizeAttr)) {
                return sizeAttr;
            }
        }

        // 如果没有找到，则从高度推断
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

        // 仅在非2x2尺寸时添加翻转交互
        const size = this.getSize();
        if (size === '2x3' || size === '2x4') {
            const flipCard = this.container.querySelector('.weather-details-compact .flip-card');
            if (flipCard) {
                flipCard.addEventListener('mouseenter', () => {
                    flipCard.classList.add('flipped');
                });

                flipCard.addEventListener('mouseleave', () => {
                    flipCard.classList.remove('flipped');
                });
            }
        }

        // 清理过期缓存数据（在组件初始化时执行）
        weatherCache.clearExpiredData().catch(err => {
            console.error('清理过期缓存失败:', err);
        });

        // 初始化城市选择模态框
        this.initCityModal();

        // 初始化天气预报详情模态框
        this.initForecastModal();

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
            // 2x2 简化布局 - 只显示主要信息，不显示 weather-details-compact
            this.container.innerHTML = `
                <div class="weather-location">
                    <span class="location-name">--</span>
                    <button class="city-select-btn" title="选择城市"></button>
                </div>
                <div class="weather-content">
                    <div class="weather-main">
                        <div class="weather-temp-large">--°</div>
                        <div class="weather-icon-desc">
                            <img class="weather-icon" src="" alt="天气">
                            <div class="weather-desc">--</div>
                        </div>
                    </div>
                </div>
            `;
        } else if (size === '2x3' || size === '2x4') {
            // 2x3 和 2x4 布局 - 横向排列三个卡片
            this.container.innerHTML = `
                <div class="weather-location">
                    <span class="location-name">--</span>
                    <button class="city-select-btn" title="选择城市"></button>
                </div>
                <div class="weather-content">
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
                                        <span class="detail-label">体感温度 °C</span>
                                        <span class="detail-value">--</span>
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
            // 保存提取的颜色供模态框使用
            this.extractedColor = color;
        }
    }

    /**
     * 获取天气数据（带缓存）
     */
    async fetchWeatherData() {
        try {
            // 先尝试从缓存获取
            const cachedData = await weatherCache.getWeatherData(this.options.city);

            if (cachedData) {
                // 使用缓存数据
                this.weatherData = cachedData;
                this.updateWeatherDisplay(cachedData);

                // 提取并应用图标颜色
                const iconUrl = `/static/ico/weather_icon/${cachedData.weather[0].icon}.png`;
                const color = await this.extractIconColor(iconUrl);
                this.applyBackgroundColor(color);

                return;
            }


            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(this.options.city)}&appid=${this.options.apiKey}&units=metric&lang=zh_cn`
            );
            const data = await response.json();

            if (data.cod === 200) {
                this.weatherData = data;
                this.updateWeatherDisplay(data);

                // 保存到缓存
                await weatherCache.saveWeatherData(this.options.city, data);

                // 提取并应用图标颜色
                const iconUrl = `/static/ico/weather_icon/${data.weather[0].icon}.png`;
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
        // 不更新位置名称，保持用户选择的中文名
        // const locationNameEl = this.container.querySelector('.location-name');
        // if (locationNameEl) {
        //     locationNameEl.textContent = weatherData.name;
        // }

        // 更新天气图标
        const iconEl = this.container.querySelector('.weather-icon');
        if (iconEl) {
            const iconUrl = `/static/ico/weather_icon/${weatherData.weather[0].icon}.png`;
            iconEl.src = iconUrl;
        }

        // 更新大温度
        const tempLargeEl = this.container.querySelector('.weather-temp-large');
        if (tempLargeEl) {
            tempLargeEl.innerHTML = `${Math.round(weatherData.main.temp)}<sup class="temp-unit">°C</sup>`;
        }

        // 更新天气描述
        const descEl = this.container.querySelector('.weather-desc');
        if (descEl) {
            descEl.textContent = weatherData.weather[0].description;
        }

        // 仅在非2x2尺寸时更新详情区域
        const size = this.getSize();
        if (size !== '2x2') {
            // 更新正面数据 - 体感温度
            const feelsLikeEl = this.container.querySelector('.weather-details-compact .detail-item:nth-child(1) .detail-value');
            if (feelsLikeEl) {
                feelsLikeEl.textContent = `${Math.round(weatherData.main.feels_like)}`;
            }

            // 更新正面数据 - 风速（添加风力等级）
            const windSpeedEl = this.container.querySelector('.weather-details-compact .detail-item:nth-child(2) .detail-value');
            if (windSpeedEl) {
                const windSpeed = weatherData.wind.speed;
                const windLevel = this.getWindLevel(windSpeed);
                windSpeedEl.textContent = `${windLevel} | ${windSpeed.toFixed(2)}`;
            }

            // 更新正面数据 - 风向
            const windDegEl = this.container.querySelector('.weather-details-compact .detail-item:nth-child(3) .detail-value');
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

    /**
     * 初始化城市选择模态框
     */
    async initCityModal() {
        // 优先从 localStorage 读取，如果没有则从 settings API 读取，最后使用默认值
        let savedCity = localStorage.getItem('weather_city');

        if (!savedCity) {
            // 从 settings API 读取
            try {
                const response = await fetch('/api/settings/weather_city');
                const result = await response.json();

                if (result.success && result.data && result.data.value) {
                    savedCity = result.data.value;
                } else {

                    await this.initializeDefaultCity();
                    savedCity = 'Weihai';
                }
            } catch (error) {
                console.error('从 settings 读取城市配置失败:', error);
                // 出错时也使用默认值
                savedCity = 'Weihai';
            }
        }

        // 如果都没有，使用默认值
        savedCity = savedCity || this.options.city || 'Weihai';

        // 创建城市模态框实例
        this.cityModal = new CityModal({
            defaultCity: savedCity,
            onCityChange: (cityPinyin, cityName) => {
                this.handleCityChange(cityPinyin, cityName);
            }
        });

        // 绑定城市选择按钮点击事件
        setTimeout(async () => {
            const cityBtn = this.container.querySelector('.city-select-btn');
            if (cityBtn) {
                cityBtn.addEventListener('click', () => {
                    this.cityModal.open();
                });
            }

            // 更新当前显示的城市名
            const locationNameEl = this.container.querySelector('.location-name');
            if (locationNameEl && this.cityModal) {
                // 从模态框获取城市中文名
                await this.updateCityDisplayName(savedCity);
            }
        }, 100);
    }

    /**
     * 初始化天气预报详情模态框
     */
    initForecastModal() {
        // 使用 ModalManager 获取天气预报模态框实例
        if (window.modalManager) {
            this.forecastModal = window.modalManager.getWeatherForecastModal();

            // 设置城市切换回调
            this.forecastModal.customOptions.onCityChange = () => {
                // 打开城市选择模态框
                if (this.cityModal) {
                    this.cityModal.open();
                }
            };
        }

        // 绑定 weather-content 点击事件
        setTimeout(() => {
            const weatherContent = this.container.querySelector('.weather-content');
            if (weatherContent) {
                weatherContent.addEventListener('click', (e) => {
                    // 如果点击的是城市选择按钮，不打开预报模态框
                    if (e.target.closest('.city-select-btn')) {
                        return;
                    }

                    // 获取当前城市中文名
                    const locationNameEl = this.container.querySelector('.location-name');
                    const cityName = locationNameEl ? locationNameEl.textContent : this.options.city;

                    // 打开预报模态框
                    if (window.modalManager) {
                        window.modalManager.showWeatherForecastModal(this.options.city, cityName, this.extractedColor);
                    }
                });
            }
        }, 100);
    }

    /**
     * 初始化默认城市配置
     */
    async initializeDefaultCity() {
        try {
            const response = await fetch('/api/weather/city', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    city: 'Weihai'
                })
            });

            const result = await response.json();
            if (result.success) {

            } else {
                console.error('创建默认城市配置失败:', result.error);
            }
        } catch (error) {
            console.error('初始化默认城市配置异常:', error);
        }
    }

    /**
     * 处理城市切换
     */
    async handleCityChange(cityPinyin, cityName) {


        // 更新 options.city
        this.options.city = cityPinyin;

        // 立即更新显示的城市名（使用传入的 cityName）
        const locationNameEl = this.container.querySelector('.location-name');
        if (locationNameEl) {
            locationNameEl.textContent = cityName;
        }

        // 同步更新到数据库 settings 表
        await this.updateCityInDatabase(cityPinyin);

        // 异步刷新天气数据并存入 weather_cache 表（不等待完成，让它在后台执行）
        this.refreshWeatherDataAsync(cityPinyin).catch(err => {
            console.error('异步刷新天气失败:', err);
        });

        // 同时更新前端显示（使用缓存或重新获取）
        this.weatherData = null; // 清空旧数据
        await this.fetchWeatherData();

        // 如果天气弹窗是打开状态，刷新弹窗数据
        if (this.forecastModal && !this.forecastModal.modal.classList.contains('hidden')) {
            console.log('[WeatherWidget] 检测到天气弹窗已打开，准备刷新弹窗数据');
            console.log('[WeatherWidget] 新城市:', cityName, '(', cityPinyin, ')');

            // 更新弹窗的城市信息
            this.forecastModal.currentCity = cityPinyin;
            this.forecastModal.cityName = cityName;

            // 更新弹窗标题中的城市名
            if (this.forecastModal.cityNameEl) {
                this.forecastModal.cityNameEl.textContent = cityName;
            }

            // 重新提取颜色（因为新城市的天气图标可能不同）
            const iconUrl = this.weatherData ?
                `/static/ico/weather_icon/${this.weatherData.weather[0].icon}.png` :
                '';

            if (iconUrl) {
                const color = await this.extractIconColor(iconUrl);
                this.applyBackgroundColor(color);
                this.forecastModal.themeColor = color;
                console.log('[WeatherWidget] 已更新主题色:', color);
            }

            // 重新获取并渲染天气预报数据
            console.log('[WeatherWidget] 开始刷新弹窗天气数据...');
            await this.forecastModal.fetchWeatherData();
            console.log('[WeatherWidget] 弹窗数据刷新完成');
        }
    }

    /**
     * 异步刷新天气数据并存入数据库
     * @param {string} cityPinyin - 城市拼音
     */
    async refreshWeatherDataAsync(cityPinyin) {
        try {
            // 调用后端 refresh API，强制从 OpenWeatherMap 获取最新数据并存入数据库
            const response = await fetch(`/api/weather/refresh/${encodeURIComponent(cityPinyin)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
        } catch (error) {
            // 静默失败
        }
    }

    /**
     * 更新数据库中的城市信息
     */
    async updateCityInDatabase(cityPinyin) {
        try {
            const response = await fetch('/api/weather/city', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    city: cityPinyin
                })
            });

            const result = await response.json();
            if (result.success) {

            } else {
                console.error('保存城市配置失败:', result.error);
            }
        } catch (error) {
            console.error('更新数据库异常:', error);
        }
    }

    /**
     * 更新城市显示名称
     */
    async updateCityDisplayName(cityPinyin) {
        try {

            const response = await fetch('/api/cities');
            const result = await response.json();

            if (result.success) {
                const allCities = [
                    ...result.data.featured,
                    ...Object.values(result.data.alphabetical).flat()
                ];

                const city = allCities.find(c => c.pinyin === cityPinyin);
                if (city) {

                    const locationNameEl = this.container.querySelector('.location-name');
                    if (locationNameEl) {
                        locationNameEl.textContent = city.name;

                    }
                } else {
                    console.warn(`未找到城市: ${cityPinyin}`);
                }
            }
        } catch (error) {
            console.error('获取城市名称失败:', error);
        }
    }
}

export default WeatherWidget;
