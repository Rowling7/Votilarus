// ==================== 搜索功能处理器 ====================

import SettingsManager from '../../managers/SettingsManager.js';
import AddEngineDialog from '../dialogs/AddEngineDialog.js';

class SearchHandler {
    constructor() {
        this.searchBox = document.getElementById('searchBox');
        this.searchEngineIcon = document.getElementById('searchEngineIcon');
        this.searchEngineBar = document.getElementById('searchEngineBar');

        // 所有可用的搜索引擎（从数据库动态加载）
        this.searchEngines = {};

        // 延迟初始化，等待 DOM 和 SettingsManager 准备好
        this.initialized = false;
    }

    async init() {
        if (this.initialized) {
            return;
        }

        // 先加载搜索引擎列表
        await this.loadSearchEngines();

        // 从数据库应用搜索框设置
        this.applySearchSettings();

        // 搜索框回车事件
        this.searchBox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // 搜索引擎图标点击事件（切换引擎列表显示）
        if (this.searchEngineIcon) {
            this.searchEngineIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleQuickBar();
            });
        } else {
            console.error('searchEngineIcon element not found');
        }

        // 点击外部关闭引擎列表
        document.addEventListener('click', (e) => {
            if (this.searchEngineBar && !this.searchEngineBar.contains(e.target) &&
                this.searchEngineIcon && !this.searchEngineIcon.contains(e.target)) {
                this.closeQuickBar();
            }
        });

        // 初始化引擎列表
        this.renderQuickBar();
        this.updateSearchEngineIcon();

        this.initialized = true;
    }

    // 从 API 加载搜索引擎列表
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
        } catch (error) {
            console.error('Error loading search engines:', error);
            // 如果加载失败，使用默认的硬编码数据作为后备
            this.searchEngines = {
                baidu: { name: '百度', icon: 'static/ico/svg-baidu.svg', url: 'https://www.baidu.com/s?wd=' },
                bing: { name: 'Bing', icon: 'static/ico/bing.png', url: 'https://www.bing.com/search?q=' },
                google: { name: '谷歌', icon: 'static/ico/google.png', url: 'https://www.google.com/search?q=' }
            };
        }
    }

    // 获取备用图标
    getFallbackIcon() {
        return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%233B82F6%22%3E%3Cpath d=%22M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z%22/%3E%3C/svg%3E';
    }

    // 从数据库应用搜索框设置
    applySearchSettings() {
        // 1. 应用默认搜索引擎（已在 renderQuickBar 和 updateSearchEngineIcon 中使用 SettingsManager.get）
        const searchEngine = SettingsManager.get('search_engine');
        // 这个设置在 setSearchEngine 和 performSearch 中已经通过 SettingsManager.get('search_engine') 读取

        // 2. 应用搜索框位置
        const position = SettingsManager.get('search_box_position') || 'center';
        this.applySearchBoxPosition(position);

        // 3. 应用搜索框圆角样式
        const style = SettingsManager.get('search_box_style') || 'rounded';
        this.applySearchBoxStyle(style);
    }

    // 应用搜索框位置
    applySearchBoxPosition(position) {
        const searchContainer = document.querySelector('.search-container');
        if (!searchContainer) return;

        // 移除所有位置类
        searchContainer.classList.remove('position-left', 'position-center', 'position-right');

        // 根据设置应用位置
        switch (position) {
            case 'left':
                searchContainer.style.left = '2rem';
                searchContainer.style.transform = 'none';
                break;
            case 'right':
                searchContainer.style.left = 'auto';
                searchContainer.style.right = '2rem';
                searchContainer.style.transform = 'none';
                break;
            case 'center':
            default:
                searchContainer.style.left = '50%';
                searchContainer.style.right = 'auto';
                searchContainer.style.transform = 'translateX(-50%)';
                break;
        }
    }

    // 应用搜索框圆角样式
    applySearchBoxStyle(style) {
        const searchBox = document.getElementById('searchBox');
        const searchEngineBar = document.getElementById('searchEngineBar');

        if (!searchBox || !searchEngineBar) return;

        // 根据设置应用圆角
        if (style === 'square') {
            searchBox.style.borderRadius = '0.5rem';
            searchEngineBar.style.borderRadius = '0.5rem';
        } else {
            // rounded
            searchBox.style.borderRadius = '2rem';
            searchEngineBar.style.borderRadius = '2rem';
        }
    }

    performSearch() {
        const query = this.searchBox.value.trim();
        if (!query) return;

        const engine = SettingsManager.get('search_engine') || 'baidu';
        const engineConfig = this.searchEngines[engine];
        if (!engineConfig) {
            console.error('Search engine not found:', engine);
            return;
        }

        const url = engineConfig.url + encodeURIComponent(query);

        window.open(url, '_blank');
        this.searchBox.value = '';
    }

    // 切换引擎列表显示/隐藏
    toggleQuickBar() {
        this.searchEngineBar.classList.toggle('visible');
    }

    // 关闭引擎列表
    closeQuickBar() {
        this.searchEngineBar.classList.remove('visible');
    }

    // 渲染引擎列表
    renderQuickBar() {
        const currentEngine = SettingsManager.get('search_engine') || 'baidu';
        const fallbackIcon = this.getFallbackIcon();

        // 按 sort_order 排序引擎列表
        const sortedEngines = Object.entries(this.searchEngines).sort((a, b) => {
            return (a[1].sort_order || 999) - (b[1].sort_order || 999);
        });

        let html = sortedEngines.map(([key, config]) => {
            return `
                <button class="search-engine-item ${key === currentEngine ? 'active' : ''}" data-engine="${key}">
                    <img src="${config.icon}" alt="${config.name}" onerror="this.src='${fallbackIcon}'">
                    <span>${config.name}</span>
                </button>
            `;
        }).join('');

        // 添加按钮
        html += `
            <button class="search-engine-item" id="addEngineBtn">
                <div class="add-icon">+</div>
                <span>添加</span>
            </button>
        `;

        this.searchEngineBar.innerHTML = html;

        // 延迟绑定事件，确保 DOM 已更新
        setTimeout(() => {
            // 绑定搜索引擎选择事件
            this.searchEngineBar.querySelectorAll('.search-engine-item[data-engine]').forEach(item => {
                item.addEventListener('click', () => {
                    const engine = item.dataset.engine;
                    this.setSearchEngine(engine);
                });
            });

            // 绑定添加按钮事件
            const addBtn = document.getElementById('addEngineBtn');
            if (addBtn) {
                addBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log('Add button clicked!');
                    this.showAddEngineDialog();
                });
            }
        }, 0);
    }

    // 设置搜索引擎
    setSearchEngine(engine) {
        SettingsManager.set('search_engine', engine);

        // 更新引擎列表的激活状态
        this.searchEngineBar.querySelectorAll('.search-engine-item').forEach(item => {
            const itemEngine = item.dataset.engine;
            if (itemEngine) {
                item.classList.toggle('active', itemEngine === engine);
            }
        });

        // 更新搜索框左侧图标
        this.updateSearchEngineIcon();

        // 关闭引擎列表
        this.closeQuickBar();
    }

    // 更新搜索框左侧的搜索引擎图标
    updateSearchEngineIcon() {
        const engine = SettingsManager.get('search_engine') || 'baidu';
        const config = this.searchEngines[engine];
        if (!config) return;

        this.searchEngineIcon.innerHTML = `<img src="${config.icon}" alt="${config.name}" onerror="this.src='${this.getFallbackIcon()}'">`;
    }

    // 显示添加搜索引擎对话框
    showAddEngineDialog() {
        console.log('showAddEngineDialog called');

        // 使用新的对话框组件
        AddEngineDialog.show(async () => {
            // 成功回调：重新加载搜索引擎列表
            await this.loadSearchEngines();
            // 重新渲染引擎列表
            this.renderQuickBar();
            // 更新搜索框图标
            this.updateSearchEngineIcon();
        });
    }
}

export default new SearchHandler();
