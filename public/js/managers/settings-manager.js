// ==================== 设置管理器 ====================

import { fetchSettings, updateSettings } from '../core/api.js';

class SettingsManager {
    constructor() {
        this.settings = {};
        this.defaultSettings = {
            theme_mode: 'light',
            theme_color: '#3B82F6',
            sidebar_width: '6',
            cell_base_size: '4',
            cell_gap: '1',
            search_engine: 'baidu',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        };
    }

    async init() {
        try {
            this.settings = await fetchSettings();
            this.applySettings();
        } catch (error) {
            // 使用默认设置
            this.settings = { ...this.defaultSettings };
            this.applySettings();
        }
    }

    applySettings() {
        // 应用主题模式
        const themeMode = this.settings.theme_mode || 'light';
        if (themeMode === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', themeMode);
        }

        // 应用主题色
        const themeColor = this.settings.theme_color || '#3B82F6';
        document.documentElement.style.setProperty('--theme-color', themeColor);

        // 应用侧栏宽度
        const sidebarWidth = this.settings.sidebar_width || '6';
        document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}%`);

        // 应用单元格尺寸
        const cellBaseSize = this.settings.cell_base_size || '4';
        const cellGap = this.settings.cell_gap || '1';
        document.documentElement.style.setProperty('--cell-base-size', `${cellBaseSize}rem`);
        document.documentElement.style.setProperty('--cell-gap', `${cellGap}rem`);

        // 应用头像
        const avatarUrl = this.settings.avatar_url || this.defaultSettings.avatar_url;
        const avatarImg = document.getElementById('avatar');
        if (avatarImg) {
            avatarImg.querySelector('img').src = avatarUrl;
        }
    }

    get(key) {
        return this.settings[key];
    }

    async set(key, value) {
        this.settings[key] = value;
        try {
            await updateSettings({ [key]: value });
            this.applySettings();
        } catch (error) {
            // 回滚
            delete this.settings[key];
        }
    }

    getAll() {
        return { ...this.settings };
    }
}

export default new SettingsManager();
