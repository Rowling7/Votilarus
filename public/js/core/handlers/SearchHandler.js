// ==================== 搜索功能处理器 ====================

import SettingsManager from '../../managers/SettingsManager.js';

class SearchHandler {
    constructor() {
        this.searchBox = document.getElementById('searchBox');
        this.searchEngineIcon = document.getElementById('searchEngineIcon');
        this.searchEngineBar = document.getElementById('searchEngineBar');

        // 所有可用的搜索引擎（不删减）
        this.searchEngines = {
            baidu: { name: '百度', icon: 'static/ico/svg-baidu.svg', url: 'https://www.baidu.com/s?wd=' },
            bing: { name: 'Bing', icon: 'static/ico/bing.png', url: 'https://www.bing.com/search?q=' },
            google: { name: '谷歌', icon: 'static/ico/google.png', url: 'https://www.google.com/search?q=' },
            yahoo: { name: 'Yahoo', icon: 'static/ico/yahoo.png', url: 'https://search.yahoo.com/search?p=' },
            duckduckgo: { name: 'DuckDuckGo', icon: 'static/ico/duckduckgo.png', url: 'https://duckduckgo.com/?q=' },
            yandex: { name: 'Yandex', icon: 'static/ico/yandex.png', url: 'https://yandex.com/search/?text=' },
            xiaoyi: { name: '小艺', icon: 'static/ico/xiaoyi.png', url: 'https://xiaoyi.huawei.com/?q=' },
            sougou: { name: '搜狗', icon: 'static/ico/sougou.png', url: 'https://www.sogou.com/web?ie={inputEncoding}&query=' },
            search360: { name: '360搜索', icon: 'static/ico/360search.png', url: 'https://www.so.com/s?ie={inputEncoding}&q=' },
            zhihu: { name: '知乎', icon: 'static/ico/zhihu.png', url: 'https://www.zhihu.com/search?type=content&q=' },
            weibo: { name: '微博', icon: 'static/ico/weibo.png', url: 'https://s.weibo.com/weibo?q=' },
            xiaohongshu: { name: '小红书', icon: 'static/ico/xiaohongshu.png', url: 'https://www.xiaohongshu.com/search_result?keyword=' },
            douban: { name: '豆瓣', icon: 'static/ico/douban.png', url: 'https://www.douban.com/search?source=suggest&q=' },
            douyin: { name: '抖音', icon: 'static/ico/douyin.png', url: 'https://www.douyin.com/root/search/' },
            bilibili: { name: '哔哩哔哩', icon: 'static/ico/bilibili.png', url: 'https://search.bilibili.com/video?keyword=' }
        };
        this.init();
    }

    init() {
        // 搜索框回车事件
        this.searchBox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // 搜索引擎图标点击事件（切换快捷栏显示）
        if (this.searchEngineIcon) {
            this.searchEngineIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleQuickBar();
            });
        } else {
            console.error('searchEngineIcon element not found');
        }

        // 点击外部关闭快捷栏
        document.addEventListener('click', (e) => {
            if (this.searchEngineBar && !this.searchEngineBar.contains(e.target) &&
                this.searchEngineIcon && !this.searchEngineIcon.contains(e.target)) {
                this.closeQuickBar();
            }
        });

        // 初始化快捷栏
        this.renderQuickBar();
        this.updateSearchEngineIcon();
    }

    performSearch() {
        const query = this.searchBox.value.trim();
        if (!query) return;

        const engine = SettingsManager.get('search_engine') || 'baidu';
        const engineConfig = this.searchEngines[engine];
        const url = engineConfig.url + encodeURIComponent(query);

        window.open(url, '_blank');
        this.searchBox.value = '';
    }

    // 切换快捷栏显示/隐藏
    toggleQuickBar() {
        this.searchEngineBar.classList.toggle('visible');
    }

    // 关闭快捷栏
    closeQuickBar() {
        this.searchEngineBar.classList.remove('visible');
    }

    // 渲染快捷栏
    renderQuickBar() {
        const currentEngine = SettingsManager.get('search_engine') || 'baidu';
        const fallbackIcon = this.getFallbackIcon();

        let html = Object.entries(this.searchEngines).map(([key, config]) => {
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

        // 绑定点击事件
        this.searchEngineBar.querySelectorAll('.search-engine-item[data-engine]').forEach(item => {
            item.addEventListener('click', () => {
                const engine = item.dataset.engine;
                this.setSearchEngine(engine);
            });
        });

        // 添加按钮点击事件
        const addBtn = document.getElementById('addEngineBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.showAddEngineDialog();
            });
        }
    }

    // 设置搜索引擎
    setSearchEngine(engine) {
        SettingsManager.set('search_engine', engine);

        // 更新快捷栏的激活状态
        this.searchEngineBar.querySelectorAll('.search-engine-item[data-engine]').forEach(item => {
            item.classList.toggle('active', item.dataset.engine === engine);
        });

        // 更新搜索框左侧图标
        this.updateSearchEngineIcon();

        // 关闭快捷栏
        this.closeQuickBar();
    }

    // 更新搜索框左侧的搜索引擎图标
    updateSearchEngineIcon() {
        const engine = SettingsManager.get('search_engine') || 'baidu';
        const config = this.searchEngines[engine];
        if (!config) return;

        this.searchEngineIcon.innerHTML = `<img src="${config.icon}" alt="${config.name}" onerror="this.src='${this.getFallbackIcon()}'">`;
    }

    // 获取备用图标
    getFallbackIcon() {
        return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%233B82F6%22%3E%3Cpath d=%22M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z%22/%3E%3C/svg%3E';
    }

    // 显示添加搜索引擎对话框（占位功能）
    showAddEngineDialog() {
        // TODO: 实现添加搜索引擎的对话框
        alert('添加搜索引擎功能开发中...');
    }
}

export default new SearchHandler();
