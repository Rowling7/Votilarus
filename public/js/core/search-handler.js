// ==================== 搜索功能处理器 ====================

import settingsManager from '../managers/settings-manager.js';

class SearchHandler {
    constructor() {
        this.searchBox = document.getElementById('searchBox');
        this.searchEngineBtn = document.getElementById('searchEngineBtn');

        this.searchEngines = {
            baidu: 'https://www.baidu.com/s?wd=',
            bing: 'https://www.bing.com/search?q=',
            google: 'https://www.google.com/search?q=',
            yahoo: 'https://search.yahoo.com/search?p=',
            duckduckgo: 'https://duckduckgo.com/?q=',
            yandex: 'https://yandex.com/search/?text=',
            xiaoyi: 'https://xiaoyi.huawei.com/?q=',
            sougou: 'https://www.sogou.com/web?ie={inputEncoding}&query=',
            search360: 'https://www.so.com/s?ie={inputEncoding}&q=',
            zhihu: 'https://www.zhihu.com/search?type=content&q=',
            weibo: 'https://s.weibo.com/weibo?q=',
            xiaohongshu: 'https://www.xiaohongshu.com/search_result?keyword=',
            douban: 'https://www.douban.com/search?source=suggest&q=',
            douyin: 'https://www.douyin.com/root/search/',
            bilibili: 'https://search.bilibili.com/video?keyword='
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

        // 切换搜索引擎
        this.searchEngineBtn.addEventListener('click', () => {
            this.toggleSearchEngine();
        });

        // 更新搜索引擎图标
        this.updateSearchEngineIcon();
    }

    performSearch() {
        const query = this.searchBox.value.trim();
        if (!query) return;

        const engine = settingsManager.get('search_engine') || 'baidu';
        const url = this.searchEngines[engine] + encodeURIComponent(query);

        window.open(url, '_blank');
        this.searchBox.value = '';
    }

    toggleSearchEngine() {
        const engines = Object.keys(this.searchEngines);
        const currentEngine = settingsManager.get('search_engine') || 'baidu';
        const currentIndex = engines.indexOf(currentEngine);
        const nextIndex = (currentIndex + 1) % engines.length;
        const nextEngine = engines[nextIndex];

        settingsManager.set('search_engine', nextEngine);
        this.updateSearchEngineIcon();
    }

    updateSearchEngineIcon() {
        const engine = settingsManager.get('search_engine') || 'baidu';
        const icons = {
            baidu: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%233B82F6'%3E%3Cpath d='M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/%3E%3C/svg%3E",
            bing: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23008373'%3E%3Cpath d='M5 3v18l7-4.5V7.5L5 3zm2 3.5l5 3v7l-5 3v-13zm7-2.5v16l7-4V8L14 4z'/%3E%3C/svg%3E",
            google: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z'/%3E%3Cpath fill='%2334A853' d='M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.1C3.515 21.3 7.565 24 12.255 24z'/%3E%3Cpath fill='%23FBBC05' d='M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29v-3.1h-3.98a11.96 11.96 0 0 0 0 10.78l3.98-3.1z'/%3E%3Cpath fill='%23EA4335' d='M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0 7.565 0 3.515 2.7 1.545 7.41l3.98 3.1c.95-2.85 3.6-4.96 6.73-4.96z'/%3E%3C/svg%3E"
        };

        this.searchEngineBtn.querySelector('img').src = icons[engine];
    }
}

export default new SearchHandler();
