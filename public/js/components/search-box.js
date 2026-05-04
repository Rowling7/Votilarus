// ==================== SearchBox Web Component ====================

class SearchBox extends HTMLElement {
    static get observedAttributes() {
        return ['engine', 'position', 'style'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentEngine = 'baidu';
        this.render();
    }

    connectedCallback() {
        this.bindEvents();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const engine = this.getAttribute('engine') || 'baidu';
        const position = this.getAttribute('position') || 'center';
        const style = this.getAttribute('style') || 'rounded';

        this.currentEngine = engine;

        // 搜索引擎配置
        const engines = {
            baidu: { name: '百度', icon: '🔍', url: 'https://www.baidu.com/s?wd=' },
            bing: { name: '必应', icon: '🌐', url: 'https://www.bing.com/search?q=' },
            google: { name: '谷歌', icon: '🔎', url: 'https://www.google.com/search?q=' }
        };

        const currentEngineInfo = engines[engine] || engines.baidu;

        // 位置样式
        let positionStyle = '';
        switch(position) {
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
                    font-size: 1.5rem;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: ${borderRadius};
                    cursor: pointer;
                    transition: all 0.2s ease;
                    user-select: none;
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
                        ${currentEngineInfo.icon}
                    </div>
                    <div class="search-input-wrapper">
                        <input 
                            type="text" 
                            class="search-input" 
                            placeholder="搜索..."
                        >
                        <div class="engine-dropdown">
                            ${Object.entries(engines).map(([key, info]) => `
                                <div class="engine-option ${key === engine ? 'active' : ''}" data-engine="${key}">
                                    <span>${info.icon}</span>
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
        const engines = {
            baidu: 'https://www.baidu.com/s?wd=',
            bing: 'https://www.bing.com/search?q=',
            google: 'https://www.google.com/search?q='
        };

        const url = engines[this.currentEngine] + encodeURIComponent(query);
        
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
}

// 注册自定义元素
customElements.define('search-box', SearchBox);

export default SearchBox;
