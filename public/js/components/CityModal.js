// ==================== 城市选择模态框组件 ====================

import toast from '../utils/ToastNotification.js';

class CityModal {
    constructor(options = {}) {
        this.options = {
            defaultCity: 'Weihai',
            onCityChange: null,
            ...options
        };

        this.currentCity = this.options.defaultCity;
        this.citiesData = null;
        this.filteredData = null;
        this.modal = null;
        this.searchInput = null;
        this.cityListContainer = null;

        this.init();
    }

    /**
     * 初始化
     */
    async init() {
        this.renderModal();
        this.bindEvents();
        await this.loadCities();
    }

    /**
     * 渲染模态框 HTML
     */
    renderModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'city-modal-overlay hidden';
        this.modal.innerHTML = `
            <div class="city-modal">
                <div class="city-modal-header">
                    <h2 class="city-modal-title">选择城市</h2>
                    <button class="city-modal-close" aria-label="关闭">×</button>
                </div>
                
                <div class="city-modal-search">
                    <input type="text" placeholder="搜索城市（支持中文和拼音）..." class="city-search-input">
                    <span class="city-search-icon">🔍</span>
                </div>
                
                <div class="city-modal-body">
                    <div class="city-list-loading">加载中...</div>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);

        // 获取元素引用
        this.closeBtn = this.modal.querySelector('.city-modal-close');
        this.searchInput = this.modal.querySelector('.city-search-input');
        this.cityListContainer = this.modal.querySelector('.city-modal-body');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 关闭按钮
        this.closeBtn.addEventListener('click', () => {
            this.close();
        });

        // 点击遮罩层关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // ESC 键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.close();
            }
        });

        // 搜索输入
        let searchTimeout;
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 300);
        });
    }

    /**
     * 加载城市数据
     */
    async loadCities() {
        try {
            const response = await fetch('/api/cities');
            const result = await response.json();

            if (result.success) {
                this.citiesData = result.data;
                this.filteredData = result.data;
                this.renderCityList();
            } else {
                this.showError('加载城市列表失败');
            }
        } catch (error) {
            console.error('加载城市列表异常:', error);
            this.showError('网络错误');
        }
    }

    /**
     * 渲染城市列表
     */
    renderCityList() {
        if (!this.filteredData) return;

        let html = '';

        // 渲染热门城市
        if (this.filteredData.featured && this.filteredData.featured.length > 0) {
            html += '<div class="city-section">';
            html += '<div class="section-header">⭐ 热门城市</div>';
            html += '<div class="city-grid">';
            this.filteredData.featured.forEach(city => {
                html += this.createCityCard(city);
            });
            html += '</div>';
            html += '</div>';
        }

        // 渲染字母分组
        if (this.filteredData.alphabetical) {
            Object.keys(this.filteredData.alphabetical).sort().forEach(initial => {
                const cities = this.filteredData.alphabetical[initial];
                if (cities && cities.length > 0) {
                    html += '<div class="city-section">';
                    html += `<div class="section-header">${initial}</div>`;
                    html += '<div class="city-grid">';
                    cities.forEach(city => {
                        html += this.createCityCard(city);
                    });
                    html += '</div>';
                    html += '</div>';
                }
            });
        }

        if (!html) {
            html = '<div class="empty-state">未找到匹配的城市</div>';
        }

        this.cityListContainer.innerHTML = html;

        // 绑定城市卡片点击事件
        this.modal.querySelectorAll('.city-card').forEach(card => {
            card.addEventListener('click', () => {
                const city = card.dataset.city;
                const name = card.dataset.name;
                this.selectCity(city, name);
            });
        });
    }

    /**
     * 创建城市卡片 HTML
     */
    createCityCard(city) {
        const isSelected = city.pinyin === this.currentCity;
        return `
            <div class="city-card ${isSelected ? 'selected' : ''}" 
                 data-city="${city.pinyin}" 
                 data-name="${city.name}">
                <div class="city-card-name">${city.name}</div>
                <div class="city-card-pinyin">${city.pinyin}</div>
            </div>
        `;
    }

    /**
     * 处理搜索
     */
    async handleSearch(query) {
        if (!query || query.trim() === '') {
            this.filteredData = this.citiesData;
            this.renderCityList();
            return;
        }

        try {
            const response = await fetch(`/api/cities/search?q=${encodeURIComponent(query)}`);
            const result = await response.json();

            if (result.success) {
                this.filteredData = {
                    featured: [],
                    alphabetical: result.data
                };
                this.renderCityList();
            }
        } catch (error) {
            console.error('搜索城市异常:', error);
        }
    }

    /**
     * 选择城市
     */
    selectCity(cityPinyin, cityName) {
        // 更新当前城市
        this.currentCity = cityPinyin;

        // 保存到 localStorage
        localStorage.setItem('weather_city', cityPinyin);

        // 关闭模态框
        this.close();

        // 触发回调
        if (this.options.onCityChange) {
            this.options.onCityChange(cityPinyin, cityName);
        }

        // 显示 Toast 提示
        toast.success(`已切换到 ${cityName}`);

        console.log(`城市已切换: ${cityName} (${cityPinyin})`);
    }

    /**
     * 打开模态框
     */
    open() {
        this.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // 聚焦搜索框
        setTimeout(() => {
            this.searchInput.focus();
        }, 100);
    }

    /**
     * 关闭模态框
     */
    close() {
        this.modal.classList.add('hidden');
        document.body.style.overflow = '';
        this.searchInput.value = '';
        this.filteredData = this.citiesData;
        this.renderCityList();
    }

    /**
     * 获取当前城市
     */
    getCurrentCity() {
        return this.currentCity;
    }

    /**
     * 设置当前城市
     */
    setCurrentCity(cityPinyin) {
        this.currentCity = cityPinyin;
    }

    /**
     * 显示错误
     */
    showError(message) {
        this.cityListContainer.innerHTML = `<div class="empty-state">${message}</div>`;
    }

    /**
     * 销毁
     */
    destroy() {
        if (this.modal && this.modal.parentNode) {
            this.modal.parentNode.removeChild(this.modal);
        }
    }
}

export default CityModal;
