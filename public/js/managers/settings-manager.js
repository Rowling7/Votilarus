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
            cell_gap: '2',
            grid_rows: '5',
            grid_cols: '13',
            search_engine: 'baidu',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        };
    }

    async init() {
        try {
            console.log('📥 [SettingsManager] 开始加载设置...');
            this.settings = await fetchSettings();
            console.log('✅ [SettingsManager] 设置加载成功:', this.settings);
            console.log('   - grid_rows:', this.settings.grid_rows);
            console.log('   - grid_cols:', this.settings.grid_cols);
            console.log('   - cell_gap:', this.settings.cell_gap);
            this.applySettings();
        } catch (error) {
            console.error('❌ [SettingsManager] 加载设置失败:', error);
            // 使用默认设置
            this.settings = { ...this.defaultSettings };
            this.applySettings();
        }
    }

    applySettings() {
        // 应用主题模式
        const themeMode = this.settings.theme_mode || 'dark';
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
        const cellGap = this.settings.cell_gap || '2';
        document.documentElement.style.setProperty('--cell-base-size', `${cellBaseSize}rem`);
        document.documentElement.style.setProperty('--cell-gap', `${cellGap}rem`);

        // 应用网格行列数
        const gridCols = parseInt(this.settings.grid_cols) || 13;
        const gridRows = parseInt(this.settings.grid_rows) || 5;
        this.applyGridDimensions(gridCols, gridRows);

        // 应用背景图片（默认为空）
        const bgImageUrl = this.settings.bg_image_url || '';
        if (bgImageUrl) {
            document.body.style.backgroundImage = `url(${bgImageUrl})`;
        } else {
            document.body.style.backgroundImage = 'none';
        }

        // 应用图标圆角
        const iconRadius = this.settings.icon_radius || '0.5';
        document.documentElement.style.setProperty('--icon-radius', `${iconRadius}rem`);

        // 应用头像
        const avatarUrl = this.settings.avatar_url || this.defaultSettings.avatar_url;
        const avatarImg = document.getElementById('avatar');
        if (avatarImg) {
            avatarImg.querySelector('img').src = avatarUrl;
        }
    }

    /**
     * 应用网格行列数
     */
    applyGridDimensions(cols, rows) {
        console.log(`🔧 [SettingsManager] 准备应用网格尺寸: ${cols}列 x ${rows}行`);
        
        // 等待 DOM 加载完成后应用
        setTimeout(() => {
            const gridContainers = document.querySelectorAll('.grid-container');
            console.log(`   - 找到 ${gridContainers.length} 个网格容器`);
            
            gridContainers.forEach((container, index) => {
                // 设置固定的列数
                container.style.gridTemplateColumns = `repeat(${cols}, var(--cell-base-size))`;
                console.log(`   - 容器 ${index + 1} (${container.id}): gridTemplateColumns = repeat(${cols}, var(--cell-base-size))`);
                // 如果需要，也可以设置行数
                // container.style.gridTemplateRows = `repeat(${rows}, var(--cell-base-size))`;
            });
            console.log(`✅ [SettingsManager] 网格尺寸已应用: ${cols}列 x ${rows}行`);
        }, 100);
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

    /**
     * 获取所有设置（用于 Modal）
     */
    getAllSettings() {
        return {
            // 基础设置
            gridRows: parseInt(this.settings.grid_rows) || 5,
            gridCols: parseInt(this.settings.grid_cols) || 13,
            gridGap: parseFloat(this.settings.cell_gap) || 2,
            sidebarWidth: parseInt(this.settings.sidebar_width) || 6,
            
            // 外观主题
            themeMode: this.settings.theme_mode || 'dark',
            themeColor: this.settings.theme_color || '#3B82F6',
            bgImageUrl: this.settings.bg_image_url || '',
            bgBlur: parseInt(this.settings.bg_blur) || 5,
            bgOpacity: parseFloat(this.settings.bg_opacity) || 0.8,
            overlayColor: this.settings.overlay_color || '#000000',
            overlayOpacity: parseFloat(this.settings.overlay_opacity) || 0.3,
            
            // 图标样式
            iconRadius: parseFloat(this.settings.icon_radius) || 0.5,
            iconShadow: this.settings.icon_shadow !== '0',
            iconHoverEffect: this.settings.icon_hover_effect || 'scale',
            showTitle: this.settings.show_title !== '0',
            titlePosition: this.settings.title_position || 'bottom',
            titleFontSize: parseInt(this.settings.title_font_size) || 12,
            titleFontColor: this.settings.title_font_color || '#ffffff',
            titleMaxLength: parseInt(this.settings.title_max_length) || 8,
            tooltipDelay: parseInt(this.settings.tooltip_delay) || 300,
            
            // Dock 设置
            dockPosition: this.settings.dock_position || 'bottom',
            dockMaxIcons: parseInt(this.settings.dock_max_icons) || 10,
            dockBlur: parseInt(this.settings.dock_blur) || 10,
            dockOpacity: parseFloat(this.settings.dock_opacity) || 0.3,
            fisheyeScale: parseFloat(this.settings.fisheye_scale) || 1.5,
            fisheyeRange: parseInt(this.settings.fisheye_range) || 2,
            
            // 搜索设置
            defaultSearchEngine: this.settings.search_engine || 'baidu',
            searchBoxPosition: this.settings.search_box_position || 'center',
            searchBoxStyle: this.settings.search_box_style || 'rounded',
            
            // 交互行为
            scrollAnimationSpeed: parseInt(this.settings.scroll_animation_speed) || 300,
            dragSensitivity: parseInt(this.settings.drag_sensitivity) || 5,
            enableContextMenu: this.settings.enable_context_menu !== '0',
            
            // 个人信息
            avatarUrl: this.settings.avatar_url || '',
            username: this.settings.username || '',
            bio: this.settings.bio || ''
        };
    }

    /**
     * 保存所有设置
     */
    async saveAllSettings(newSettings) {
        const settingsMap = {
            // 基础设置
            grid_rows: newSettings.gridRows,
            grid_cols: newSettings.gridCols,
            cell_gap: newSettings.gridGap,
            sidebar_width: newSettings.sidebarWidth,
            
            // 外观主题
            theme_mode: newSettings.themeMode,
            theme_color: newSettings.themeColor,
            bg_image_url: newSettings.bgImageUrl,
            bg_blur: newSettings.bgBlur,
            bg_opacity: newSettings.bgOpacity,
            overlay_color: newSettings.overlayColor,
            overlay_opacity: newSettings.overlayOpacity,
            
            // 图标样式
            icon_radius: newSettings.iconRadius,
            icon_shadow: newSettings.iconShadow ? '1' : '0',
            icon_hover_effect: newSettings.iconHoverEffect,
            show_title: newSettings.showTitle ? '1' : '0',
            title_position: newSettings.titlePosition,
            title_font_size: newSettings.titleFontSize,
            title_font_color: newSettings.titleFontColor,
            title_max_length: newSettings.titleMaxLength,
            tooltip_delay: newSettings.tooltipDelay,
            
            // Dock 设置
            dock_position: newSettings.dockPosition,
            dock_max_icons: newSettings.dockMaxIcons,
            dock_blur: newSettings.dockBlur,
            dock_opacity: newSettings.dockOpacity,
            fisheye_scale: newSettings.fisheyeScale,
            fisheye_range: newSettings.fisheyeRange,
            
            // 搜索设置
            search_engine: newSettings.defaultSearchEngine,
            search_box_position: newSettings.searchBoxPosition,
            search_box_style: newSettings.searchBoxStyle,
            
            // 交互行为
            scroll_animation_speed: newSettings.scrollAnimationSpeed,
            drag_sensitivity: newSettings.dragSensitivity,
            enable_context_menu: newSettings.enableContextMenu ? '1' : '0',
            
            // 个人信息
            avatar_url: newSettings.avatarUrl,
            username: newSettings.username,
            bio: newSettings.bio
        };

        // 批量更新设置
        for (const [key, value] of Object.entries(settingsMap)) {
            if (value !== undefined && value !== null) {
                await updateSettings({ [key]: value });
                this.settings[key] = value;
            }
        }

        // 应用新设置
        this.applySettings();
    }

    /**
     * 恢复默认设置
     */
    async resetToDefault() {
        // 重置为默认值
        this.settings = { ...this.defaultSettings };
        
        // 保存到数据库
        await updateSettings(this.defaultSettings);
        
        // 应用默认设置
        this.applySettings();
    }
}

export default new SettingsManager();
