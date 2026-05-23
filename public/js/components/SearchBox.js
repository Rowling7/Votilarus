// ==================== SearchBox Web Component ====================

class SearchBox extends HTMLElement {
    static get observedAttributes() {
        return ['engine', 'position', 'box-style'];
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

        // 立即尝试应用设置
        this.applySettingsFromManager();

        // 如果 SettingsManager 还未就绪，等待其初始化完成
        if (!window.settingsManager) {
            const checkInterval = setInterval(() => {
                if (window.settingsManager) {
                    clearInterval(checkInterval);
                    this.applySettingsFromManager();
                }
            }, 50);

            // 最多等待 2 秒
            setTimeout(() => clearInterval(checkInterval), 2000);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.currentEngine = this.getAttribute('engine') || 'baidu';
            // 延迟渲染，确保在 connectedCallback 之后
            if (this.shadowRoot && this.shadowRoot.innerHTML) {
                this.render();
                this.bindEvents();
            }
        }
    }

    // 从 SettingsManager 应用配置
    applySettingsFromManager() {
        const settingsManager = window.settingsManager;
        if (!settingsManager) {
            return;
        }

        // 应用搜索引擎设置
        const engine = settingsManager.get('search_engine');
        if (engine && this.searchEngines[engine]) {
            this.setAttribute('engine', engine);
        }

        // 应用位置设置
        const position = settingsManager.get('search_box_position') || 'center';
        this.setAttribute('position', position);

        // 应用样式设置
        const style = settingsManager.get('search_box_style') || 'rounded';
        this.setAttribute('box-style', style);
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
                let iconPath = engine.icon_path || this.getFallbackIcon();

                // 如果提供了图片路径且不是完整URL，则添加 static/ico/ 前缀
                if (iconPath && !iconPath.startsWith('http://') && !iconPath.startsWith('https://') && !iconPath.startsWith('data:')) {
                    // 将 Windows 路径分隔符 \ 转换为 /
                    iconPath = iconPath.replace(/\\/g, '/');
                    // 如果路径不以 static/ 开头，则添加 static/ico/ 前缀
                    if (!iconPath.startsWith('static/')) {
                        iconPath = 'static/ico/' + iconPath;
                    }
                }

                this.searchEngines[engine.title_en] = {
                    id: engine.id,
                    name: engine.title,
                    icon: iconPath,
                    url: engine.url,
                    sort_order: engine.sort_order
                };
            });

            // 重新渲染以显示加载的搜索引擎
            this.render();
            this.bindEvents();

            // 搜索引擎加载完成后，再次应用设置以确保使用正确的默认引擎
            this.applySettingsFromManager();
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

            // 即使加载失败，也要应用设置
            this.applySettingsFromManager();
        }
    }

    render() {
        const engine = this.getAttribute('engine') || 'baidu';
        const position = this.getAttribute('position') || 'center';
        const style = this.getAttribute('box-style') || 'rounded';

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
        const borderRadius = style === 'square' ? '0.5rem' : '1.5rem';

        // 按 sort_order 排序引擎列表
        const sortedEngines = Object.entries(engines).sort((a, b) => {
            return (a[1].sort_order || 999) - (b[1].sort_order || 999);
        });

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: fixed;
                    top: 6rem;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 100;
                    width: 90%;
                    max-width: 700px;
                }

                :host([position="left"]) {
                    left: 2rem;
                    transform: none;
                }

                :host([position="right"]) {
                    left: auto;
                    right: 2rem;
                    transform: none;
                }

                .search-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    width: 100%;
                }

                .search-input-wrapper {
                    width: 100%;
                    position: relative;
                }

                .search-box {
                    width: 88%;
                    padding: 1rem 1.5rem 1rem 3.5rem;
                    border: 2px solid var(--border-color, rgba(255, 255, 255, 0.1));
                    border-radius: ${borderRadius};
                    background: var(--glass-bg, rgba(255, 255, 255, 0.1));
                    backdrop-filter: blur(var(--glass-blur, 10px));
                    -webkit-backdrop-filter: blur(var(--glass-blur, 10px));
                    color: var(--text-primary, white);
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.2s ease;
                }

                .search-box:focus {
                    border-color: var(--theme-color, #3b82f6);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .search-box::placeholder {
                    color: var(--text-tertiary, rgba(255, 255, 255, 0.5));
                }

                .search-engine-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 1.5rem;
                    height: 1.5rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    z-index: 10;
                    pointer-events: auto;
                }

                .search-engine-icon:hover {
                    transform: translateY(-50%) scale(1.1);
                }

                .search-engine-icon img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .search-engine-bar {
                    display: grid;
                    grid-template-columns: repeat(9, 1fr);
                    gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    background: var(--glass-bg, rgba(255, 255, 255, 0.1));
                    backdrop-filter: blur(var(--glass-blur, 10px));
                    -webkit-backdrop-filter: blur(var(--glass-blur, 10px));
                    border-radius: ${borderRadius};
                    box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
                    max-height: 0;
                    overflow: hidden;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-10px);
                    transition: all 0.2s ease;
                    margin-top: 0;
                }

                .search-engine-bar.visible {
                    max-height: 500px;
                    padding: 0.75rem 1.5rem;
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);

                }

                .search-engine-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.25rem;
                    padding: 0.5rem 0.25rem;
                    border-radius: ${borderRadius};
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: transparent;
                    border: none;
                    color: var(--text-primary, white);
                    min-width: unset;
                    flex-shrink: 0;
                }

                .search-engine-item:hover {
                    background: var(--bg-tertiary, rgba(255, 255, 255, 0.1));
                    transform: translateY(-2px);
                }

                .search-engine-item.active {
                    background: var(--theme-color, #3b82f6);
                    color: white;
                }

                .search-engine-item img {
                    width: 1.75rem;
                    height: 1.75rem;
                    object-fit: contain;
                }

                .search-engine-item span {
                    font-size: 0.75rem;
                    white-space: nowrap;
                }

                .search-engine-item .add-icon {
                    width: 1.75rem;
                    height: 1.75rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
                }

                .search-engine-item:hover .add-icon {
                    color: var(--theme-color, #3b82f6);
                }
            </style>
            <div class="search-container">
                <div class="search-input-wrapper">
                    <div class="search-engine-icon" id="searchEngineIcon" title="点击选择搜索引擎">
                        <img src="${currentEngineInfo.icon}" alt="${currentEngineInfo.name}" onerror="this.src='${this.getFallbackIcon()}'">
                    </div>
                    <input type="text" class="search-box" id="searchInput" placeholder="输入搜索内容">
                </div>
                <div class="search-engine-bar" id="searchEngineBar">
                    ${sortedEngines.map(([key, info]) => `
                        <button class="search-engine-item ${key === engine ? 'active' : ''}" data-engine="${key}">
                            <img src="${info.icon}" alt="${info.name}" onerror="this.src='${this.getFallbackIcon()}'">
                            <span>${info.name}</span>
                        </button>
                    `).join('')}
                    <button class="search-engine-item" id="addEngineBtn">
                        <div class="add-icon">+</div>
                        <span>添加</span>
                    </button>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const searchInput = this.shadowRoot.querySelector('#searchInput');
        const searchEngineIcon = this.shadowRoot.querySelector('#searchEngineIcon');
        const searchEngineBar = this.shadowRoot.querySelector('#searchEngineBar');

        if (!searchInput || !searchEngineIcon || !searchEngineBar) {
            console.error('SearchBox elements not found in shadow DOM');
            return;
        }

        // 搜索输入（回车）
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    this.performSearch(query);
                }
            }
        });

        // 显示/隐藏引擎列表
        searchEngineIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            searchEngineBar.classList.toggle('visible');
        });

        // 绑定搜索引擎选择事件
        searchEngineBar.querySelectorAll('.search-engine-item[data-engine]').forEach(item => {
            item.addEventListener('click', () => {
                const engine = item.dataset.engine;
                this.setSearchEngine(engine);
            });
        });

        // 绑定添加按钮事件
        const addBtn = searchEngineBar.querySelector('#addEngineBtn');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showAddEngineDialog();
            });
        }

        // 点击外部关闭引擎列表
        document.addEventListener('click', (e) => {
            if (!this.contains(e.target)) {
                searchEngineBar.classList.remove('visible');
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

        // 清空输入框
        const searchInput = this.shadowRoot.querySelector('#searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
    }

    // 设置搜索引擎
    setSearchEngine(engine) {
        // 保存到 SettingsManager（如果可用）
        if (window.settingsManager) {
            window.settingsManager.set('search_engine', engine).catch(err => {
                console.error('[SearchBox] Failed to save search engine:', err);
            });
        }

        this.setAttribute('engine', engine);

        // 更新引擎列表的激活状态
        const searchEngineBar = this.shadowRoot.querySelector('#searchEngineBar');
        if (searchEngineBar) {
            searchEngineBar.querySelectorAll('.search-engine-item').forEach(item => {
                const itemEngine = item.dataset.engine;
                if (itemEngine) {
                    item.classList.toggle('active', itemEngine === engine);
                }
            });
        }

        // 更新搜索框左侧图标
        this.updateSearchEngineIcon();

        // 关闭引擎列表
        const bar = this.shadowRoot.querySelector('#searchEngineBar');
        if (bar) {
            bar.classList.remove('visible');
        }
    }

    // 更新搜索框左侧的搜索引擎图标
    updateSearchEngineIcon() {
        const engine = this.getAttribute('engine') || 'baidu';

        // 使用已加载的搜索引擎，如果没有则使用默认值
        const engines = Object.keys(this.searchEngines).length > 0 ? this.searchEngines : {
            baidu: { name: '百度', icon: 'static/ico/svg-baidu.svg', url: 'https://www.baidu.com/s?wd=' },
            bing: { name: 'Bing', icon: 'static/ico/bing.png', url: 'https://www.bing.com/search?q=' },
            google: { name: '谷歌', icon: 'static/ico/google.png', url: 'https://www.google.com/search?q=' }
        };

        const config = engines[engine] || engines.baidu;
        if (!config) return;

        const searchEngineIcon = this.shadowRoot.querySelector('#searchEngineIcon');
        if (searchEngineIcon) {
            searchEngineIcon.innerHTML = `<img src="${config.icon}" alt="${config.name}" onerror="this.src='${this.getFallbackIcon()}'">`;
        }
    }

    // 显示添加搜索引擎对话框
    showAddEngineDialog() {
        // 动态导入 AddEngineDialog
        import('../dialogs/AddEngineDialog.js').then(module => {
            const AddEngineDialog = module.default;

            AddEngineDialog.show(async () => {
                // 成功回调：重新加载搜索引擎列表
                await this.loadSearchEngines();
                // 更新搜索框图标
                this.updateSearchEngineIcon();
            });
        }).catch(error => {
            console.error('Failed to load AddEngineDialog:', error);
        });
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
