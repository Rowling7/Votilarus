// ==================== 天气预报详情模态框组件 ====================

import toast from '../utils/ToastNotification.js';
import BaseModal from './BaseModal.js';

// 从全局对象获取 TimeUtils（UMD 模式导出）
const TimeUtils = window.TimeUtils;

class WeatherForecastModal extends BaseModal {
    constructor(options = {}) {
        // 调用父类构造函数，设置不允许点击遮罩层和 ESC 键关闭
        super({
            overlayClass: 'weather-forecast-overlay',
            modalClass: 'weather-forecast-modal',
            closeOnOverlayClick: false,
            closeOnEscape: false,
            enableMaximize: true  // 启用最大化功能
        });

        // 合并自定义选项，不要覆盖 this.options
        this.customOptions = {
            onCityChange: null,
            ...options
        };

        this.chart = null;
        this.currentCity = '';
        this.cityName = '';
        this.weatherData = null;
        this.themeColor = 'rgba(102, 126, 234, 0.3)';
        this.currentMetric = 'temperature'; // 当前显示的指标
        this.map = null; // Leaflet 地图实例
        this.currentTileLayer = null; // 当前瓦片图层
        this.currentMapLayer = 'temp_new'; // 当前地图图层类型
        this.userLocationMarker = null; // 用户位置标记

        this.init();
    }

    /**
     * 初始化
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
        this.overlay = document.createElement('div');
        this.overlay.className = 'weather-forecast-overlay hidden';
        this.overlay.innerHTML = `
            <div class="weather-forecast-modal">
                <div class="weather-forecast-header">
                    <div class="header-left">
                        <h2 class="weather-forecast-title">
                            <span class="city-name">--</span>
                            <span class="weather-date-range">--</span>
                        </h2>
                        <button class="city-switch-btn" title="切换城市">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            切换城市
                        </button>
                    </div>
                </div>
                
                <div class="weather-forecast-body">
                    <!-- 天气卡片横向滚动区域 -->
                    <div class="weather-cards-container">
                        <div class="weather-cards-scroll">
                            <!-- 天气卡片将通过 JS 动态生成 -->
                        </div>
                    </div>

                    <!-- 图表控制栏 -->
                    <div class="chart-controls">
                        <button class="chart-metric-btn active" data-metric="temperature">温度</button>
                        <button class="chart-metric-btn" data-metric="feels_like">体感温度</button>
                        <button class="chart-metric-btn" data-metric="humidity">湿度</button>
                        <button class="chart-metric-btn" data-metric="wind_speed">风速</button>
                        <button class="chart-metric-btn" data-metric="clouds">云量</button>
                        <button class="chart-metric-btn map-tab-btn" data-metric="map">️ 地图</button>
                    </div>

                    <!-- 图表区域 -->
                    <div class="chart-container">
                        <canvas id="weatherChart"></canvas>
                    </div>

                    <!-- 地图区域 -->
                    <div class="map-container hidden">
                        <div class="map-layer-selector">
                            <button class="map-layer-btn active" data-layer="temp_new">温度</button>
                            <button class="map-layer-btn" data-layer="wind_new">风速</button>
                            <button class="map-layer-btn" data-layer="precipitation_new">降水</button>
                            <button class="map-layer-btn" data-layer="clouds_new">云量</button>
                            <button class="map-layer-btn" data-layer="pressure_new">气压</button>
                            <button class="map-layer-btn" data-layer="snow_new">降雪</button>
                        </div>
                        <div id="weatherMap"></div>
                        <button class="locate-btn" title="定位到我的位置">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M12 2v4M12 18v4M2 12h4M18 12h4"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);

        // 获取元素引用
        this.modal = this.overlay.querySelector('.weather-forecast-modal');
        // 注意：closeBtn 现在由 BaseModal 统一管理，不需要在这里获取
        this.citySwitchBtn = this.overlay.querySelector('.city-switch-btn');
        this.cardsContainer = this.overlay.querySelector('.weather-cards-container');
        this.cardsScroll = this.overlay.querySelector('.weather-cards-scroll');
        this.cityNameEl = this.overlay.querySelector('.city-name');
        this.dateRangeEl = this.overlay.querySelector('.weather-date-range');
        this.metricBtns = this.overlay.querySelectorAll('.chart-metric-btn');
        this.chartContainer = this.overlay.querySelector('.chart-container');
        this.mapContainer = this.overlay.querySelector('.map-container');
        this.mapLayerBtns = this.overlay.querySelectorAll('.map-layer-btn');
        this.locateBtn = this.overlay.querySelector('.locate-btn');
    }

    /**
     * 绑定自定义事件（子类实现）
     * @private
     */
    _bindCustomEvents() {
        // 注意：关闭按钮事件已由 BaseModal 统一管理，不需要在这里绑定

        // 切换城市按钮
        this.citySwitchBtn.addEventListener('click', () => {
            if (this.customOptions.onCityChange) {
                this.customOptions.onCityChange();
            }
        });

        // 图表指标切换
        this.metricBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const metric = btn.dataset.metric;
                if (metric === 'map') {
                    // 根据当前状态切换地图/预报
                    if (this.mapContainer.classList.contains('hidden')) {
                        this.switchToMap();
                    } else {
                        this.switchToForecast();
                    }
                } else {
                    this.showForecastView(metric);
                }
            });
        });

        // 地图图层切换
        this.mapLayerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const layer = btn.dataset.layer;
                this.switchMapLayer(layer);
            });
        });

        // 定位按钮
        this.locateBtn.addEventListener('click', () => {
            this.locateUserPosition();
        });
    }

    /**
     * 打开模态框
     */
    async open(cityPinyin, cityName, themeColor) {
        this.currentCity = cityPinyin;
        this.cityName = cityName;
        this.themeColor = themeColor;

        // 更新城市名称
        this.cityNameEl.textContent = cityName;

        // 显示加载状态
        this.showLoading();

        // 调用父类的 open 方法
        await super.open();

        // 获取天气数据
        await this.fetchWeatherData();
    }

    /**
     * 切换到地图视图
     */
    switchToMap() {
        // 更新按钮状态
        this.metricBtns.forEach(btn => {
            if (btn.dataset.metric === 'map') {
                btn.classList.add('active');
                btn.textContent = ' 预报'; // 切换按钮文本
            } else {
                btn.classList.remove('active');
            }
        });

        // 隐藏天气卡片
        this.cardsContainer.classList.add('hidden');

        // 显示地图容器，隐藏图表容器
        this.chartContainer.classList.add('hidden');
        this.mapContainer.classList.remove('hidden');

        // 初始化地图（如果尚未初始化）
        if (!this.map) {
            setTimeout(() => {
                this.initMap();
            }, 100);
        }
    }

    /**
     * 切换到预报视图（点击"预报"按钮）
     */
    switchToForecast() {
        // 显示天气卡片
        this.cardsContainer.classList.remove('hidden');

        // 更新按钮状态
        this.metricBtns.forEach(btn => {
            if (btn.dataset.metric === 'map') {
                btn.classList.remove('active');
                btn.textContent = '️ 地图'; // 切换按钮文本
            }
        });

        // 隐藏地图，显示图表
        this.mapContainer.classList.add('hidden');
        this.chartContainer.classList.remove('hidden');

        // 切换到温度标签
        this.showForecastView('temperature');
    }

    /**
     * 显示预报视图（显示卡片 + 指定指标的图表）
     */
    showForecastView(metric) {
        // 确保卡片显示
        this.cardsContainer.classList.remove('hidden');

        // 隐藏地图，显示图表
        this.mapContainer.classList.add('hidden');
        this.chartContainer.classList.remove('hidden');

        // 切换指标
        this.switchMetric(metric);
    }

    /**
     * 初始化 Leaflet 地图
     */
    initMap() {
        const mapElement = document.getElementById('weatherMap');
        if (!mapElement) return;

        // 创建地图实例，默认中心为中国，缩放级别 6
        this.map = L.map('weatherMap', {
            center: [35.8617, 104.1954], // 中国中心坐标
            zoom: 6,
            minZoom: 3,
            maxZoom: 10,
            zoomControl: true,
            attributionControl: false
        });

        // 添加基础图层（使用高德地图，国内访问稳定）
        L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {
            maxZoom: 18,
            attribution: '© 高德地图',
            subdomains: '1234'
        }).addTo(this.map);

        // 添加天气图层
        this.addWeatherTileLayer(this.currentMapLayer);

        // 等待地图渲染后刷新视图
        setTimeout(() => {
            this.map.invalidateSize();
        }, 100);
    }

    /**
     * 添加天气瓦片图层
     */
    addWeatherTileLayer(layerType) {
        // 移除旧图层
        if (this.currentTileLayer) {
            this.map.removeLayer(this.currentTileLayer);
        }

        // 创建新的瓦片图层，使用后端 API
        const tileUrl = `/api/weather/tile/${layerType}/{z}/{x}/{y}`;

        this.currentTileLayer = L.tileLayer(tileUrl, {
            opacity: 0.7,
            maxZoom: 10
        }).addTo(this.map);
    }

    /**
     * 切换地图图层
     */
    switchMapLayer(layerType) {
        this.currentMapLayer = layerType;

        // 更新按钮状态
        this.mapLayerBtns.forEach(btn => {
            if (btn.dataset.layer === layerType) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // 切换图层
        if (this.map) {
            this.addWeatherTileLayer(layerType);
        }
    }

    /**
     * 定位用户位置（带降级重试 + IP 兜底）
     */
    locateUserPosition() {
        if (!navigator.geolocation) {
            // 浏览器不支持定位，直接使用 IP 定位
            this._attemptIpLocation();
            return;
        }

        toast.info('正在获取您的位置...');
        this._attemptLocatePosition(true);
    }

    /**
     * 执行定位请求（支持降级重试）
     * @param {boolean} highAccuracy - 是否使用高精度模式
     * @private
     */
    _attemptLocatePosition(highAccuracy) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                this._onLocationReceived(latitude, longitude, 'GPS');
            },
            (error) => {
                console.error('[WeatherMap] 定位失败 (高精度:' + highAccuracy + '):', error);

                // 降级策略：高精度失败时用低精度重试一次
                if (highAccuracy) {
                    console.log('[WeatherMap] 高精度定位失败，降级使用低精度模式重试...');
                    toast.info('正在尝试使用低精度定位...');
                    this._attemptLocatePosition(false);
                    return;
                }

                // 低精度也失败 -> 使用 IP 定位兜底
                console.log('[WeatherMap] 浏览器定位全部失败，使用 IP 定位兜底...');
                this._attemptIpLocation();
            },
            {
                enableHighAccuracy: highAccuracy,
                timeout: highAccuracy ? 15000 : 10000,
                maximumAge: highAccuracy ? 0 : 300000
            }
        );
    }

    /**
     * 通过 IP 获取近似位置（兜底方案）
     * @private
     */
    async _attemptIpLocation() {
        toast.info('正在通过 IP 估算位置...');

        try {
            const response = await fetch('/api/weather/geoip');
            const result = await response.json();

            if (result.success && result.data) {
                const { lat, lon } = result.data;
                console.log('[WeatherMap] IP 定位成功:', result.data.city || result.data.country, lat, lon);
                this._onLocationReceived(lat, lon, 'IP');
                toast.success('已定位到您的大致位置（IP 定位）');
            } else {
                toast.error('IP 定位失败：' + (result.error || '未知错误'));
            }
        } catch (error) {
            console.error('[WeatherMap] IP 定位请求失败:', error);
            toast.error('定位失败，所有定位方式均不可用');
        }
    }

    /**
     * 统一处理获取到的位置
     * @param {number} latitude
     * @param {number} longitude
     * @param {string} source - 位置来源: 'GPS' | 'IP'
     * @private
     */
    _onLocationReceived(latitude, longitude, source) {
        console.log('[WeatherMap] 用户位置 (' + source + '):', latitude, longitude);

        // 移除旧标记
        if (this.userLocationMarker) {
            this.map.removeLayer(this.userLocationMarker);
        }

        // 添加新标记（IP 定位使用不同颜色标记）
        const markerOptions = source === 'IP' ? {
            icon: L.divIcon({
                className: 'ip-location-marker',
                html: `<div style="
                    width: 24px; height: 24px;
                    background: rgba(255, 165, 0, 0.8);
                    border: 3px solid #fff;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                "></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            })
        } : undefined;

        this.userLocationMarker = L.marker([latitude, longitude], markerOptions).addTo(this.map);
        const popupText = source === 'IP' ? '您的大致位置（IP 定位）' : '您的位置';
        this.userLocationMarker.bindPopup(popupText).openPopup();

        // 移动地图到用户位置
        this.map.setView([latitude, longitude], 10);
    }

    /**
     * 关闭模态框
     */
    close() {
        // 调用父类的 close 方法
        super.close();

        // 销毁图表
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }

        // 销毁地图
        if (this.map) {
            this.map.remove();
            this.map = null;
            this.currentTileLayer = null;
            this.userLocationMarker = null;
        }
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        this.cardsScroll.innerHTML = '<div class="loading-state">加载中...</div>';
        this.dateRangeEl.textContent = '';
    }

    /**
     * 获取天气数据
     */
    async fetchWeatherData() {
        try {
            const response = await fetch(`/api/weather/forecast/${encodeURIComponent(this.currentCity)}`);
            const result = await response.json();

            if (result.success) {
                this.weatherData = result.data;
                console.log('[WeatherForecastModal] 数据来源:', {
                    当前天气: result.fromCache ? '数据库缓存' : 'API',
                    城市: this.cityName
                });
                console.log('[WeatherForecastModal] 数据详情:', {
                    历史天数: this.weatherData.history?.length || 0,
                    当前日期: this.weatherData.current?.date,
                    预报天数: this.weatherData.forecast?.length || 0,
                    总卡片数: (this.weatherData.history?.length || 0) + 1 + (this.weatherData.forecast?.length || 0)
                });

                // 重新渲染时添加动画效果
                this.renderWeatherCards();
                this.updateDateRange();

                // 延迟初始化图表，等待卡片动画完成
                setTimeout(() => {
                    this.initChart();
                }, 300);
            } else {
                toast.error('获取天气数据失败');
                this.close();
            }
        } catch (error) {
            toast.error('网络错误');
            this.close();
        }
    }

    /**
     * 更新日期范围显示
     */
    updateDateRange() {
        if (!this.weatherData) return;

        const allDates = [
            ...this.weatherData.history.map(d => d.date),
            this.weatherData.current.date,
            ...this.weatherData.forecast.map(d => d.date)
        ];

        if (allDates.length >= 2) {
            const startDate = this.formatDate(allDates[0]);
            const endDate = this.formatDate(allDates[allDates.length - 1]);
            this.dateRangeEl.textContent = `${startDate} ~ ${endDate}`;
        }
    }

    /**
     * 渲染天气卡片
     */
    renderWeatherCards() {
        if (!this.weatherData) return;

        // 添加淡出效果
        this.cardsScroll.style.opacity = '0';

        setTimeout(() => {
            let html = '';

            // 历史数据
            this.weatherData.history.forEach(day => {
                html += this.createWeatherCard(day, 'history');
            });

            // 当前数据
            html += this.createWeatherCard(this.weatherData.current, 'current');

            // 预报数据
            this.weatherData.forecast.forEach(day => {
                html += this.createWeatherCard(day, 'forecast');
            });

            this.cardsScroll.innerHTML = html;

            // 恢复透明度，触发动画
            setTimeout(() => {
                this.cardsScroll.style.opacity = '1';
            }, 50);
        }, 200);
    }

    /**
     * 创建单个天气卡片
     */
    createWeatherCard(day, type) {
        const dateObj = new Date(day.date);
        const isToday = day.date === this.weatherData.current.date;

        let dateLabel = '';
        if (type === 'history') {
            dateLabel = this.getRelativeDayLabel(dateObj, -1);
        } else if (isToday) {
            dateLabel = '今天';
        } else {
            dateLabel = this.getRelativeDayLabel(dateObj, 1);
        }

        const weatherIconUrl = `/static/ico/weather_icon/${day.weather_icon}.png`;
        const windDeg = day.wind_deg !== undefined ? day.wind_deg : (day.wind_deg_avg !== undefined ? day.wind_deg_avg : null);
        const windInfo = this.getWindDirection(windDeg);

        return `
            <div class="weather-card ${type} ${isToday ? 'today' : ''}">
                <div class="card-date">${dateLabel}</div>
                <div class="card-full-date">${this.formatDate(day.date)}</div>
                <img class="card-icon" src="${weatherIconUrl}" alt="${day.weather_description}">
                <div class="card-description">${day.weather_description}</div>
                <div class="card-temp">
                    <span class="temp-max">${Math.round(day.temp_max)}°</span>
                    <span class="temp-min">${Math.round(day.temp_min)}°</span>
                </div>
                <div class="card-details">
                    <div class="detail-row">
                        <span class="detail-label">湿度</span>
                        <span class="detail-value">${day.humidity !== undefined ? day.humidity : (day.humidity_avg !== undefined ? day.humidity_avg : '-')}%</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">风速</span>
                        <span class="detail-value">${windInfo.arrow} ${day.wind_speed !== undefined ? day.wind_speed : (day.wind_speed_avg !== undefined ? day.wind_speed_avg : '-')} m/s</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">云量</span>
                        <span class="detail-value">${day.clouds !== undefined ? day.clouds : (day.clouds_avg !== undefined ? day.clouds_avg : '-')}%</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">能见度</span>
                        <span class="detail-value">${day.visibility !== undefined && day.visibility !== null ? day.visibility + ' km' : (day.visibility_avg !== undefined && day.visibility_avg !== null ? day.visibility_avg + ' km' : '-')}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 获取相对日期标签
     */
    getRelativeDayLabel(dateObj, direction) {
        const today = TimeUtils.getBeijingTime();
        today.setHours(0, 0, 0, 0);

        const targetDate = new Date(dateObj);
        targetDate.setHours(0, 0, 0, 0);

        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return '今天';
        if (diffDays === -1) return '昨天';
        if (diffDays === 1) return '明天';

        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return weekdays[targetDate.getDay()];
    }

    /**
     * 根据风向角度获取风向名称和箭头
     */
    getWindDirection(deg) {
        if (deg === undefined || deg === null || isNaN(deg)) {
            return { name: '未知', arrow: '-' };
        }

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
     * 格式化日期
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}月${day}日`;
    }

    /**
     * 初始化图表
     */
    initChart() {
        const canvas = document.getElementById('weatherChart');
        if (!canvas) return;

        // 如果已有图表实例，先销毁
        if (this.chart) {
            this.chart.destroy();
        }

        // 准备图表数据
        const chartData = this.prepareChartData();

        // 检测是否为暗黑模式
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

        // Chart.js 配置
        const ctx = canvas.getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: this.getDatasets(chartData, isDarkMode)
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: isDarkMode ? '#b0b0b0' : '#666666',
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                        titleColor: isDarkMode ? '#ffffff' : '#1a1a1a',
                        bodyColor: isDarkMode ? '#ffffff' : '#1a1a1a',
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: (context) => {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y;
                                    if (this.currentMetric === 'temperature' || this.currentMetric === 'feels_like') {
                                        label += '°C';
                                    } else if (this.currentMetric === 'humidity') {
                                        label += '%';
                                    } else if (this.currentMetric === 'wind_speed') {
                                        label += ' m/s';
                                    } else if (this.currentMetric === 'clouds') {
                                        label += '%';
                                    }
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: isDarkMode ? '#808080' : '#999999',
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: isDarkMode ? '#808080' : '#999999',
                            font: {
                                size: 11
                            },
                            callback: (value) => {
                                if (this.currentMetric === 'temperature' || this.currentMetric === 'feels_like') {
                                    return value + '°C';
                                } else if (this.currentMetric === 'humidity') {
                                    return value + '%';
                                } else if (this.currentMetric === 'wind_speed') {
                                    return value + ' m/s';
                                } else if (this.currentMetric === 'clouds') {
                                    return value + '%';
                                }
                                return value;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * 准备图表数据
     */
    prepareChartData() {
        if (!this.weatherData) return { labels: [], datasets: [] };

        const allDays = [
            ...this.weatherData.history,
            this.weatherData.current,
            ...this.weatherData.forecast
        ];

        const labels = allDays.map(day => {
            const dateObj = new Date(day.date);
            const isToday = day.date === this.weatherData.current.date;

            if (isToday) return '今天';

            const month = dateObj.getMonth() + 1;
            const dayNum = dateObj.getDate();
            return `${month}/${dayNum}`;
        });

        return {
            labels,
            temps: allDays.map(day => Math.round(day.temp_max)),
            tempMins: allDays.map(day => Math.round(day.temp_min)),
            feelsLikes: allDays.map(day => Math.round(day.feels_like_avg || day.feels_like || 0)),
            humidities: allDays.map(day => day.humidity !== undefined ? day.humidity : (day.humidity_avg !== undefined ? day.humidity_avg : 0)),
            windSpeeds: allDays.map(day => parseFloat(day.wind_speed !== undefined ? day.wind_speed : (day.wind_speed_avg !== undefined ? day.wind_speed_avg : 0))),
            clouds: allDays.map(day => day.clouds !== undefined ? day.clouds : (day.clouds_avg !== undefined ? day.clouds_avg : 0))
        };
    }

    /**
     * 获取数据集配置
     */
    getDatasets(chartData, isDarkMode) {
        const globalThemeColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim();

        switch (this.currentMetric) {
            case 'temperature':
                return [
                    {
                        label: '最高温度',
                        data: chartData.temps,
                        borderColor: globalThemeColor,
                        backgroundColor: globalThemeColor + '20',
                        tension: 0.4,
                        fill: false,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: globalThemeColor,
                        pointBorderColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                        pointBorderWidth: 2
                    },
                    {
                        label: '最低温度',
                        data: chartData.tempMins,
                        borderColor: '#60A5FA',
                        backgroundColor: '#60A5FA20',
                        tension: 0.4,
                        fill: false,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#60A5FA',
                        pointBorderColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                        pointBorderWidth: 2
                    }
                ];

            case 'feels_like':
                return [
                    {
                        label: '体感温度',
                        data: chartData.feelsLikes,
                        borderColor: globalThemeColor,
                        backgroundColor: globalThemeColor + '20',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: globalThemeColor,
                        pointBorderColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                        pointBorderWidth: 2
                    }
                ];

            case 'humidity':
                return [
                    {
                        label: '湿度',
                        data: chartData.humidities,
                        borderColor: globalThemeColor,
                        backgroundColor: globalThemeColor + '20',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: globalThemeColor,
                        pointBorderColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                        pointBorderWidth: 2
                    }
                ];

            case 'wind_speed':
                return [
                    {
                        label: '风速',
                        data: chartData.windSpeeds,
                        borderColor: globalThemeColor,
                        backgroundColor: globalThemeColor + '20',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: globalThemeColor,
                        pointBorderColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                        pointBorderWidth: 2
                    }
                ];

            case 'clouds':
                return [
                    {
                        label: '云量',
                        data: chartData.clouds,
                        borderColor: globalThemeColor,
                        backgroundColor: globalThemeColor + '20',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: globalThemeColor,
                        pointBorderColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                        pointBorderWidth: 2
                    }
                ];

            default:
                return [];
        }
    }

    /**
     * 切换图表指标
     */
    switchMetric(metric) {
        this.currentMetric = metric;

        // 更新按钮状态（但不修改地图按钮的文本）
        this.metricBtns.forEach(btn => {
            if (btn.dataset.metric === metric) {
                btn.classList.add('active');
            } else if (btn.dataset.metric !== 'map') {
                // 只移除其他按钮的 active 状态，不修改地图按钮文本
                btn.classList.remove('active');
            }
        });

        // 显示图表容器，隐藏地图容器
        this.chartContainer.classList.remove('hidden');
        this.mapContainer.classList.add('hidden');

        // 重新渲染图表
        if (this.chart && this.weatherData) {
            const chartData = this.prepareChartData();
            const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

            // 添加淡出效果
            const chartContainer = document.querySelector('.chart-container');
            if (chartContainer) {
                chartContainer.style.opacity = '0.5';
                chartContainer.style.transform = 'scale(0.98)';
            }

            setTimeout(() => {
                this.chart.data.datasets = this.getDatasets(chartData, isDarkMode);
                this.chart.update('active'); // 使用 'active' 模式实现平滑过渡

                // 恢复透明度
                if (chartContainer) {
                    chartContainer.style.opacity = '1';
                    chartContainer.style.transform = 'scale(1)';
                }
            }, 150);
        }
    }

    /**
     * 销毁
     */
    destroy() {
        if (this.chart) {
            this.chart.destroy();
        }

        // 销毁地图
        if (this.map) {
            this.map.remove();
            this.map = null;
            this.currentTileLayer = null;
            this.userLocationMarker = null;
        }

        // 调用父类的 destroy 方法
        super.destroy();
    }
}

export default WeatherForecastModal;