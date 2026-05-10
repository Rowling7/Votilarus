// ==================== SearchBox Web Component ====================

class SearchBox extends HTMLElement {
    static get observedAttributes() {
        return ['engine', 'position', 'style'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentEngine = 'baidu';
        this.searchEngines = {};
        this.render();
        this.loadSearchEngines();
    }

    connectedCallback() {
        this.bindEvents();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.currentEngine = this.getAttribute('engine') || 'baidu';
            // 延迟渲染，确保在 connectedCallback 之后
            if (this.shadowRoot.innerHTML) {
                this.render();
                this.bindEvents();
            }
        }
    }

    async loadSearchEngines() {
        try {
            const response = await fetch('/api/search-engines');
            if (!response.ok) {
                throw new Error('Failed to fetch search engines');
            }

            const engines = await response.json();

            // 将数据库返回的数据转换为前端使用的格式
            this.searchEngines = {};
            engines.forEach(engine => {
                this.searchEngines[engine.title_en] = {
                    id: engine.id,
                    name: engine.title,
                    icon: engine.icon_path || this.getFallbackIcon(),
                    url: engine.url,
                    sort_order: engine.sort_order
                };
            });

            // 重新渲染以显示加载的搜索引擎
            this.render();
            this.bindEvents();
        } catch (error) {
            console.error('Error loading search engines:', error);
            // 如果加载失败，使用默认的硬编码数据作为后备
            this.searchEngines = {
                baidu: { name: '百度', icon: 'static/ico/svg-baidu.svg', url: 'https://www.baidu.com/s?wd=' },
                bing: { name: 'Bing', icon: 'static/ico/bing.png', url: 'https://www.bing.com/search?q=' },
                google: { name: '谷歌', icon: 'static/ico/google.png', url: 'https://www.google.com/search?q=' }
            };
            this.render();
            this.bindEvents();
        }
    }

    render() {
        const engine = this.getAttribute('engine') || 'baidu';
        const position = this.getAttribute('position') || 'center';
        const style = this.getAttribute('style') || 'rounded';

        this.currentEngine = engine;

        // 使用已加载的搜索引擎，如果没有则使用默认值
        const engines = Object.keys(this.searchEngines).length > 0 ? this.searchEngines : {
            baidu: { name: '百度', icon: 'static/ico/svg-baidu.svg', url: 'https://www.baidu.com/s?wd=' },
            bing: { name: 'Bing', icon: 'static/ico/bing.png', url: 'https://www.bing.com/search?q=' },
            google: { name: '谷歌', icon: 'static/ico/google.png', url: 'https://www.google.com/search?q=' }
        };

        const currentEngineInfo = engines[engine] || engines.baidu;

        // 位置样式
        let positionStyle = '';
        switch (position) {
            case 'left':
                positionStyle = 'justify-content: flex-start;';
                break;
            case 'right':
                positionStyle = 'justify-content: flex-end;';
                break;
            default: // center
                positionStyle = 'justify-content: center;';
        }

        // 圆角样式
        const borderRadius = style === 'square' ? '0.5rem' : '2rem';

        // 按 sort_order 排序引擎列表
        const sortedEngines = Object.entries(engines).sort((a, b) => {
            return (a[1].sort_order || 999) - (b[1].sort_order || 999);
        });

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                }

                .search-container {
                    ${positionStyle}
                    padding: 1rem;
                }

                .search-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    max-width: 600px;
                    width: 100%;
                }

                .engine-selector {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 3rem;
                    height: 3rem;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: ${borderRadius};
                    cursor: pointer;
                    transition: all 0.2s ease;
                    user-select: none;
                    overflow: hidden;
                }

                .engine-selector img {
                    width: 1.5rem;
                    height: 1.5rem;
                    object-fit: contain;
                }

                .engine-selector:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: scale(1.05);
                }

                .search-input-wrapper {
                    flex: 1;
                    position: relative;
                }

                .search-input {
                    width: 100%;
                    height: 3rem;
                    padding: 0 1.5rem;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border: 2px solid transparent;
                    border-radius: ${borderRadius};
                    color: white;
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.2s ease;
                }

                .search-input::placeholder {
                    color: rgba(255, 255, 255, 0.5);
                }

                .search-input:focus {
                    background: rgba(255, 255, 255, 0.15);
                    border-color: var(--theme-color, #667eea);
                }

                .engine-dropdown {
                    position: absolute;
                    top: calc(100% + 0.5rem);
                    left: 0;
                    background: rgba(0, 0, 0, 0.9);
                    backdrop-filter: blur(10px);
                    border-radius: 0.5rem;
                    padding: 0.5rem;
                    min-width: 150px;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-10px);
                    transition: all 0.2s ease;
                    z-index: 1000;
                }

                .engine-dropdown.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }

                .engine-option {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border-radius: 0.25rem;
                    cursor: pointer;
                    transition: background 0.2s ease;
                    color: white;
                }

                .engine-option img {
                    width: 1.2rem;
                    height: 1.2rem;
                    object-fit: contain;
                }

                .engine-option:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .engine-option.active {
                    background: var(--theme-color, #667eea);
                }
            </style>
            <div class="search-container">
                <div class="search-wrapper">
                    <div class="engine-selector" title="切换搜索引擎">
                        <img src="${currentEngineInfo.icon}" alt="${currentEngineInfo.name}" onerror="this.src='${this.getFallbackIcon()}'">
                    </div>
                    <div class="search-input-wrapper">
                        <input 
                            type="text" 
                            class="search-input" 
                            placeholder="搜索..."
                        >
                        <div class="engine-dropdown">
                            ${sortedEngines.map(([key, info]) => `
                                <div class="engine-option ${key === engine ? 'active' : ''}" data-engine="${key}">
                                    <img src="${info.icon}" alt="${info.name}" onerror="this.src='${this.getFallbackIcon()}'">
                                    <span>${info.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const input = this.shadowRoot.querySelector('.search-input');
        const engineSelector = this.shadowRoot.querySelector('.engine-selector');
        const dropdown = this.shadowRoot.querySelector('.engine-dropdown');
        const engineOptions = this.shadowRoot.querySelectorAll('.engine-option');

        // 搜索输入（回车）
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = input.value.trim();
                if (query) {
                    this.performSearch(query);
                }
            }
        });

        // 显示/隐藏引擎选择器
        engineSelector.addEventListener('click', () => {
            dropdown.classList.toggle('visible');
        });

        // 选择搜索引擎
        engineOptions.forEach(option => {
            option.addEventListener('click', () => {
                const engine = option.dataset.engine;
                this.setAttribute('engine', engine);
                dropdown.classList.remove('visible');

                // 派发事件通知父组件
                this.dispatchEvent(new CustomEvent('engine-change', {
                    bubbles: true,
                    detail: { engine }
                }));
            });
        });

        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!this.contains(e.target)) {
                dropdown.classList.remove('visible');
            }
        });
    }

    performSearch(query) {
        // 使用已加载的搜索引擎，如果没有则使用默认值
        const engines = Object.keys(this.searchEngines).length > 0 ? this.searchEngines : {
            baidu: { name: '百度', icon: 'static/ico/svg-baidu.svg', url: 'https://www.baidu.com/s?wd=' },
            bing: { name: 'Bing', icon: 'static/ico/bing.png', url: 'https://www.bing.com/search?q=' },
            google: { name: '谷歌', icon: 'static/ico/google.png', url: 'https://www.google.com/search?q=' }
        };

        const engineConfig = engines[this.currentEngine] || engines.baidu;
        const url = engineConfig.url + encodeURIComponent(query);

        // 派发搜索事件
        this.dispatchEvent(new CustomEvent('search', {
            bubbles: true,
            detail: { query, engine: this.currentEngine, url }
        }));

        // 在新标签页打开
        window.open(url, '_blank');
    }

    // 公共方法：获取当前搜索引擎
    getCurrentEngine() {
        return this.currentEngine;
    }

    // 公共方法：设置搜索引擎
    setEngine(engine) {
        this.setAttribute('engine', engine);
    }

    // 获取备用图标
    getFallbackIcon() {
        return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%233B82F6%22%3E%3Cpath d=%22M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z%22/%3E%3C/svg%3E';
    }
}

// 注册自定义元素
customElements.define('search-box', SearchBox);

export default SearchBox;
