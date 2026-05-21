// ==================== 设置管理器 ====================

import { fetchSettings, updateSettings } from '../core/api-client.js';

class SettingsManager {
    constructor() {
        this.settings = {};
        this.defaultSettings = {
            theme_mode: 'light',
            theme_color: '#3b82f6',
            global_font: 'NotoSansSC-Regular',
            sidebar_width: '50',
            cell_base_size: '4',
            cell_gap: '2',
            grid_rows: '5',
            grid_cols: '13',
            search_engine: 'baidu',
            avatar_url: 'static/ico/loading2.gif\n',
            username: 'Votilarus',
            bio: 'Everything will be OK!',
            bg_image_url: 'static/background/image061.png',
            // 背景样式开关（默认关闭）
            bg_image_enabled: '0',
            bg_blur_enabled: '0',
            bg_blur: '5',
            bg_opacity_enabled: '0',
            bg_opacity: '0.8',
            overlay_color_enabled: '0',
            overlay_color: '#000000',
            overlay_opacity_enabled: '0',
            overlay_opacity: '0.3',
            // 图标样式
            icon_radius: '1',
            icon_shadow: '1',
            icon_hover_effect: 'scale',
            show_title: '1',
            title_position: 'bottom',
            title_font_size: '12',
            title_font_color: '#ffffff',
            title_max_length: '8',
            tooltip_delay: '300',
            // Dock 设置
            dock_position: 'bottom',
            dock_max_icons: '10',
            dock_blur: '10',
            dock_opacity: '0.3',
            fisheye_scale: '1.5',
            fisheye_range: '1',
            // 搜索设置
            search_box_position: 'center',
            search_box_style: 'rounded',
            // 交互行为
            scroll_animation_speed: '300',
            drag_sensitivity: '5',
            enable_context_menu: '1',
            // 组件设置
            widget_border_radius: '1.4'
        };
    }

    async init() {
        try {
            this.settings = await fetchSettings();
            this.applySettings();
            // 设置主题变化监听器
            this.setupThemeChangeListener();
            // 设置窗口 resize 监听器，实现响应式网格调整
            this.setupResizeListener();
        } catch (error) {
            // 使用默认设置
            this.settings = { ...this.defaultSettings };
            this.applySettings();
            // 设置主题变化监听器
            this.setupThemeChangeListener();
            // 设置窗口 resize 监听器，实现响应式网格调整
            this.setupResizeListener();
        }
    }

    /**
     * 设置窗口 resize 监听器
     */
    setupResizeListener() {
        let resizeTimeout;

        const handleResize = () => {
            // 清除之前的定时器（防抖）
            clearTimeout(resizeTimeout);

            // 延迟执行，避免频繁计算
            resizeTimeout = setTimeout(() => {
                // 重新应用网格设置
                const gridCols = parseInt(this.settings.grid_cols) || 13;
                const gridRows = parseInt(this.settings.grid_rows) || 5;
                this.applyGridDimensions(gridCols, gridRows);
            }, 200); // 200ms 防抖
        };

        window.addEventListener('resize', handleResize);
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
        const themeColor = this.settings.theme_color || '#3b82f6';
        document.documentElement.style.setProperty('--theme-color', themeColor);

        // 应用全局字体
        const globalFont = this.settings.global_font || 'NotoSansSC-Regular';
        this.applyGlobalFont(globalFont);

        // 应用侧栏宽度
        const sidebarWidth = parseInt(this.settings.sidebar_width) || 50;
        document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`);

        // 判断是否需要自动隐藏（宽度 < 40px）
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            if (sidebarWidth < 40) {
                sidebar.classList.add('auto-hidden');
            } else {
                sidebar.classList.remove('auto-hidden');
            }

            // 判断是否显示文字（宽度 >= 60px）
            if (sidebarWidth >= 60) {
                sidebar.classList.add('wide');
                sidebar.classList.remove('narrow');
            } else {
                sidebar.classList.add('narrow');
                sidebar.classList.remove('wide');
            }
        }

        // 应用单元格尺寸
        const cellBaseSize = this.settings.cell_base_size || '4';
        const cellGap = this.settings.cell_gap || '2';
        document.documentElement.style.setProperty('--cell-base-size', `${cellBaseSize}rem`);
        document.documentElement.style.setProperty('--cell-gap', `${cellGap}rem`);

        // 应用网格行列数
        const gridCols = parseInt(this.settings.grid_cols) || 13;
        const gridRows = parseInt(this.settings.grid_rows) || 5;
        this.applyGridDimensions(gridCols, gridRows);

        // 应用图标圆角
        const iconRadius = this.settings.icon_radius || '0.5';
        document.documentElement.style.setProperty('--icon-radius', `${iconRadius}rem`);

        // 应用图标阴影
        const iconShadow = this.settings.icon_shadow === '1';
        if (iconShadow) {
            document.documentElement.style.setProperty('--icon-shadow', '0 2px 8px rgba(0, 0, 0, 0.2)');
        } else {
            document.documentElement.style.setProperty('--icon-shadow', 'none');
        }

        // 应用标题显示设置
        const showTitle = this.settings.show_title === '1';
        document.documentElement.style.setProperty('--show-title', showTitle ? 'block' : 'none');

        // 应用标题位置
        const titlePosition = this.settings.title_position || 'bottom';
        document.documentElement.style.setProperty('--title-position', titlePosition);

        // 应用标题字体大小
        const titleFontSize = this.settings.title_font_size || '12';
        document.documentElement.style.setProperty('--title-font-size', `${titleFontSize}px`);

        // 应用标题字体颜色
        const titleFontColor = this.settings.title_font_color || '#ffffff';
        const currentTheme = document.documentElement.getAttribute('data-theme');

        // 判断是否手动设置了颜色（不等于默认值 #ffffff）
        const isCustomColor = titleFontColor !== '#ffffff';

        if (isCustomColor) {
            // 如果用户手动设置了颜色，使用手动设置的颜色
            document.documentElement.style.setProperty('--title-color', titleFontColor);
        } else {
            // 否则根据主题自动适配
            if (currentTheme === 'dark') {
                // 暗黑模式使用专门的深色主题颜色
                document.documentElement.style.setProperty('--title-color', 'var(--title-color-dark)');
            } else {
                // 浅色模式使用深黑色
                document.documentElement.style.setProperty('--title-color', '#0a0a0a');
            }
        }

        // 应用标题最大长度
        const titleMaxLength = this.settings.title_max_length || '8';
        document.documentElement.style.setProperty('--title-max-length', titleMaxLength);

        // 应用头像
        const avatarUrl = this.settings.avatar_url || this.defaultSettings.avatar_url;
        const avatarImg = document.getElementById('avatar');
        if (avatarImg) {
            avatarImg.querySelector('img').src = avatarUrl;
        }

        // 应用组件圆角
        const widgetBorderRadius = this.settings.widget_border_radius || '1.4';
        document.documentElement.style.setProperty('--widget-border-radius', `${widgetBorderRadius}rem`);

        // 应用背景设置
        this.applyBackgroundSettings();
    } // 结束 applySettings 方法

    /**
     * 设置主题变化监听器
     */
    setupThemeChangeListener() {
        // 监听主题模式变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    // 主题发生变化，重新应用标题颜色
                    this.applyTitleColor();
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }

    /**
     * 应用标题字体颜色（单独提取出来供主题变化时调用）
     */
    applyTitleColor() {
        const titleFontColor = this.settings.title_font_color || '#ffffff';
        const currentTheme = document.documentElement.getAttribute('data-theme');

        // 判断是否手动设置了颜色（不等于默认值 #ffffff）
        const isCustomColor = titleFontColor !== '#ffffff';

        if (isCustomColor) {
            // 如果用户手动设置了颜色，使用手动设置的颜色
            document.documentElement.style.setProperty('--title-color', titleFontColor);
        } else {
            // 否则根据主题自动适配
            if (currentTheme === 'dark') {
                // 暗黑模式使用专门的深色主题颜色
                document.documentElement.style.setProperty('--title-color', 'var(--title-color-dark)');
            } else {
                // 浅色模式使用深黑色
                document.documentElement.style.setProperty('--title-color', '#0a0a0a');
            }
        }
    }

    /**
     * 应用全局字体
     */
    applyGlobalFont(fontName) {
        // 根据字体名称设置对应的 font-family
        let fontFamily;
        switch (fontName) {
            case 'NotoSansSC-Regular':
                fontFamily = "'Noto Sans SC', sans-serif";
                break;
            case 'NotoSansSC-Bold':
                fontFamily = "'Noto Sans SC Bold', sans-serif";
                break;
            case 'Segoe UI':
                fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
                break;
            default:
                fontFamily = "'Noto Sans SC', sans-serif";
        }

        // 应用到 body 元素
        document.body.style.fontFamily = fontFamily;
    }

    /**
     * 应用背景设置
     */
    applyBackgroundSettings() {
        // 应用背景图片(根据开关状态)
        const bgImageEnabled = this.settings.bg_image_enabled === '1' || this.settings.bg_image_enabled === true;
        const bgImageUrl = this.settings.bg_image_url || '';

        if (bgImageEnabled && bgImageUrl) {
            // 如果路径已经以 / 开头,直接使用;否则添加 / 前缀
            const imageUrl = bgImageUrl.startsWith('/') ? bgImageUrl : `/${bgImageUrl}`;
            document.body.style.backgroundImage = `url(${imageUrl})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundRepeat = 'no-repeat';
        } else {
            document.body.style.backgroundImage = 'none';
        }

        // 应用背景模糊度(根据开关状态)
        const bgBlurEnabled = this.settings.bg_blur_enabled === '1' || this.settings.bg_blur_enabled === true;
        const bgBlur = bgBlurEnabled ? (parseInt(this.settings.bg_blur) || 5) : 0;
        document.documentElement.style.setProperty('--bg-blur', `${bgBlur}px`);

        // 应用背景透明度(根据开关状态)
        const bgOpacityEnabled = this.settings.bg_opacity_enabled === '1' || this.settings.bg_opacity_enabled === true;
        const bgOpacity = bgOpacityEnabled ? (parseFloat(this.settings.bg_opacity) || 0.8) : 1;
        document.documentElement.style.setProperty('--bg-opacity', bgOpacity);

        // 应用遮罩层颜色(根据开关状态)
        const overlayColorEnabled = this.settings.overlay_color_enabled === '1' || this.settings.overlay_color_enabled === true;
        const overlayColor = overlayColorEnabled ? (this.settings.overlay_color || '#000000') : 'transparent';
        document.documentElement.style.setProperty('--overlay-color', overlayColor);

        // 应用遮罩层透明度(根据开关状态)
        const overlayOpacityEnabled = this.settings.overlay_opacity_enabled === '1' || this.settings.overlay_opacity_enabled === true;
        const overlayOpacity = overlayOpacityEnabled ? (parseFloat(this.settings.overlay_opacity) || 0.3) : 0;
        document.documentElement.style.setProperty('--overlay-opacity', overlayOpacity);

        // 更新 body 的伪元素样式以应用背景效果
        this.updateBodyBackgroundStyles();
    }

    /**
     * 更新 body 背景相关样式
     */
    updateBodyBackgroundStyles() {
        // 创建或更新用于背景效果的样式
        let styleElement = document.getElementById('background-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'background-styles';
            document.head.appendChild(styleElement);
        }

        // 构建背景效果样式
        const bgBlur = getComputedStyle(document.documentElement).getPropertyValue('--bg-blur').trim() || '5px';
        const bgOpacity = getComputedStyle(document.documentElement).getPropertyValue('--bg-opacity').trim() || '0.8';
        const overlayColor = getComputedStyle(document.documentElement).getPropertyValue('--overlay-color').trim() || '#ffffff';
        const overlayOpacity = getComputedStyle(document.documentElement).getPropertyValue('--overlay-opacity').trim() || '0.3';

        styleElement.textContent = `
            body::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: inherit;
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                filter: blur(${bgBlur});
                z-index: -1;
                opacity: ${bgOpacity};
            }
            
            body::after {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: ${overlayColor};
                z-index: -1;
                opacity: ${overlayOpacity};
            }
        `;
    }

    /**
     * 根据视口宽度计算合适的列数
     */
    calculateAutoGridCols() {
        const viewportWidth = window.innerWidth;

        // 定义断点和对应的列数
        const breakpoints = [
            { width: 500, cols: 4 },    // 小屏手机
            { width: 768, cols: 6 },    // 大屏手机
            { width: 1024, cols: 8 },   // 平板
            { width: 1280, cols: 10 },  // 小屏笔记本
            { width: 1440, cols: 11 },  // 普通桌面
            { width: 1600, cols: 12 },  // 大屏桌面
            { width: 1920, cols: 13 },  // 超大屏
            { width: 2560, cols: 14 },  // 4K屏幕
            { width: Infinity, cols: 20 } // 超宽屏
        ];

        // 找到合适的断点
        for (const breakpoint of breakpoints) {
            if (viewportWidth <= breakpoint.width) {
                return Math.min(Math.max(breakpoint.cols, 4), 20); // 确保在4-20范围内
            }
        }

        return 20; // 默认最大值
    }

    /**
     * 应用网格行列数
     */
    applyGridDimensions(cols, rows) {
        // 等待 DOM 加载完成后应用
        setTimeout(() => {
            const gridContainers = document.querySelectorAll('.grid-container');

            gridContainers.forEach((container) => {
                const categoryPanel = container.closest('.category-panel');
                if (!categoryPanel) return;

                // 计算容器可用宽度（减去 padding）
                const panelStyle = window.getComputedStyle(categoryPanel);
                const panelPadding = parseFloat(panelStyle.paddingLeft) + parseFloat(panelStyle.paddingRight);
                const availableWidth = categoryPanel.clientWidth - panelPadding;

                // 计算网格所需宽度
                const cellSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-base-size')) || 64;
                const cellGap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-gap')) || 32;

                // 使用自动计算的列数（优先级最高）
                const autoCols = this.calculateAutoGridCols();
                const gridWidth = autoCols * cellSize + (autoCols - 1) * cellGap;

                // 如果网格宽度大于可用宽度，自动调整列数
                if (gridWidth > availableWidth) {
                    // 计算最大可容纳列数
                    const maxCols = Math.floor((availableWidth + cellGap) / (cellSize + cellGap));
                    const actualCols = Math.max(maxCols, 4); // 至少 4 列
                    container.style.gridTemplateColumns = `repeat(${actualCols}, var(--cell-base-size))`;
                } else {
                    // 使用自动计算的列数
                    container.style.gridTemplateColumns = `repeat(${autoCols}, var(--cell-base-size))`;
                }
            });
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
     * 获取所有设置(用于 Modal)
     */
    getAllSettings() {
        return {
            // 基础设置
            gridRows: parseInt(this.settings.grid_rows) || 5,
            gridCols: parseInt(this.settings.grid_cols) || 13,
            gridGap: parseFloat(this.settings.cell_gap) || 2,
            sidebarWidth: parseInt(this.settings.sidebar_width) || 50,

            // 外观主题
            themeMode: this.settings.theme_mode || 'light',
            themeColor: this.settings.theme_color || '#3b82f6',
            globalFont: this.settings.global_font || 'NotoSansSC-Regular',
            bgImageEnabled: this.settings.bg_image_enabled === '1',
            bgImageUrl: this.settings.bg_image_url || '',
            bgBlurEnabled: this.settings.bg_blur_enabled === '1',
            bgBlur: parseInt(this.settings.bg_blur) || 5,
            bgOpacityEnabled: this.settings.bg_opacity_enabled === '1',
            bgOpacity: parseFloat(this.settings.bg_opacity) || 0.8,
            overlayColorEnabled: this.settings.overlay_color_enabled === '1',
            overlayColor: this.settings.overlay_color || '#000000',
            overlayOpacityEnabled: this.settings.overlay_opacity_enabled === '1',
            overlayOpacity: parseFloat(this.settings.overlay_opacity) || 0.3,

            // 图标样式
            iconRadius: parseFloat(this.settings.icon_radius) || 0.5,
            iconShadow: this.settings.icon_shadow === '1',
            iconHoverEffect: this.settings.icon_hover_effect || 'scale',
            showTitle: this.settings.show_title === '1',
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

            // 组件设置
            widgetBorderRadius: parseFloat(this.settings.widget_border_radius) || 1.4,

            // 交互行为
            scrollAnimationSpeed: parseInt(this.settings.scroll_animation_speed) || 300,
            dragSensitivity: parseInt(this.settings.drag_sensitivity) || 5,
            enableContextMenu: this.settings.enable_context_menu === '1',

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
            global_font: newSettings.globalFont,
            bg_image_enabled: newSettings.bgImageEnabled ? '1' : '0',
            bg_image_url: newSettings.bgImageUrl,
            bg_blur_enabled: newSettings.bgBlurEnabled ? '1' : '0',
            bg_blur: newSettings.bgBlur,
            bg_opacity_enabled: newSettings.bgOpacityEnabled ? '1' : '0',
            bg_opacity: newSettings.bgOpacity,
            overlay_color_enabled: newSettings.overlayColorEnabled ? '1' : '0',
            overlay_color: newSettings.overlayColor,
            overlay_opacity_enabled: newSettings.overlayOpacityEnabled ? '1' : '0',
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

            // 组件设置
            widget_border_radius: newSettings.widgetBorderRadius,

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