// ==================== 背景图设置工具 ====================

/**
 * 背景图设置工具 - 用于控制台模态框
 * 功能：分页浏览 /static/background/backImage/ 中的图片和视频
 *        图片和视频分页签展示，点击即可设为页面背景
 */
class BackgroundTool {
    constructor() {
        this._container = null;
        this._currentMedia = null;    // 当前选中的媒体路径
        this._currentType = null;     // 'image' | 'video'
        this._previewEl = null;       // 预览区元素

        // 页签状态
        this._activeTab = 'image';    // 'image' | 'video'

        // 分页状态（每个页签独立）
        this._page = {
            image: 1,
            video: 1
        };

        this._PAGE_SIZE = 6;
    }

    /**
     * 媒体文件基础路径
     */
    get BASE_PATH() {
        return 'static/background/backImage/';
    }

    /**
     * 图片文件列表
     */
    get IMAGE_FILES() {
        return [
            ...Array.from({ length: 105 }, (_, i) => ({
                name: `image${String(i + 1).padStart(3, '0')}.png`,
                type: 'image',
                path: `${this.BASE_PATH}image${String(i + 1).padStart(3, '0')}.png`
            })),
            { name: '2024121021eg5e.webp', type: 'image', path: `${this.BASE_PATH}2024121021eg5e.webp` },
            { name: 'background-default.svg', type: 'image', path: `${this.BASE_PATH}background-default.svg` },
        ];
    }

    /**
     * 视频文件列表
     */
    get VIDEO_FILES() {
        return [
            { name: 'video001.mp4', type: 'video', path: `${this.BASE_PATH}video001.mp4` },
            { name: 'video002.mp4', type: 'video', path: `${this.BASE_PATH}video002.mp4` },
            { name: 'video003.mp4', type: 'video', path: `${this.BASE_PATH}video003.mp4` },
            { name: 'video004.mp4', type: 'video', path: `${this.BASE_PATH}video004.mp4` },
            { name: 'video005.mp4', type: 'video', path: `${this.BASE_PATH}video005.mp4` },
            { name: 'video006.mp4', type: 'video', path: `${this.BASE_PATH}video006.mp4` },
            { name: 'video007.mp4', type: 'video', path: `${this.BASE_PATH}video007.mp4` },
            { name: 'video008.mp4', type: 'video', path: `${this.BASE_PATH}video008.mp4` },
            { name: 'video010.mp4', type: 'video', path: `${this.BASE_PATH}video010.mp4` },
        ];
    }

    /**
     * 获取当前活跃页签的文件列表
     */
    get _activeFiles() {
        return this._activeTab === 'video' ? this.VIDEO_FILES : this.IMAGE_FILES;
    }

    /**
     * 获取当前活跃页签的页码
     */
    get _activePage() {
        return this._page[this._activeTab];
    }

    /**
     * 设置当前活跃页签的页码
     */
    set _activePage(val) {
        this._page[this._activeTab] = val;
    }

    /**
     * 获取当前活跃页签的总页数
     */
    get _activeTotalPages() {
        return Math.ceil(this._activeFiles.length / this._PAGE_SIZE);
    }

    /**
     * 获取当前页的数据切片
     */
    get _activePageItems() {
        const start = (this._activePage - 1) * this._PAGE_SIZE;
        return this._activeFiles.slice(start, start + this._PAGE_SIZE);
    }

    /**
     * 渲染工具内容到容器
     * @param {HTMLElement} container - 右侧内容区容器
     */
    render(container) {
        this._container = container;

        container.innerHTML = `
            <div class="bg-tool">
                <h2 class="bg-tool-title">🖼️ 背景图</h2>

                <!-- 页签切换 -->
                <div class="bg-tool-tabs" id="bgTabs">
                    <button class="bg-tool-tab active" data-tab="image" id="bgTabImage">
                        🖼️ 图片
                        <span class="bg-tool-tab-count">(${this.IMAGE_FILES.length})</span>
                    </button>
                    <button class="bg-tool-tab" data-tab="video" id="bgTabVideo">
                        🎬 视频
                        <span class="bg-tool-tab-count">(${this.VIDEO_FILES.length})</span>
                    </button>
                </div>

                <!-- 预览区 -->
                <div class="bg-tool-preview" id="bgPreview">
                    <div class="bg-tool-preview-placeholder">
                        <span class="bg-tool-preview-placeholder-text">← 点击下方媒体文件预览并设置为背景</span>
                    </div>
                </div>

                <!-- 分页信息栏 -->
                <div class="bg-tool-pageinfo" id="bgPageInfo">
                    <span class="bg-tool-pageinfo-text" id="bgPageInfoText"></span>
                </div>

                <!-- 网格缩略图区 -->
                <div class="bg-tool-grid" id="bgGrid">
                    ${this._renderGridItems()}
                </div>

                <!-- 分页控制器 -->
                <div class="bg-tool-pagination" id="bgPagination">
                    <button class="bg-tool-page-btn" id="bgPagePrev" disabled>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <span class="bg-tool-page-num" id="bgPageNum">1 / ${this._activeTotalPages}</span>
                    <button class="bg-tool-page-btn" id="bgPageNext" ${this._activeTotalPages <= 1 ? 'disabled' : ''}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>

                <!-- 操作按钮 -->
                <div class="bg-tool-actions">
                    <button class="bg-tool-btn bg-tool-btn-set" id="bgBtnSet" disabled>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"></polygon>
                        </svg>
                        设为背景
                    </button>
                    <button class="bg-tool-btn bg-tool-btn-clear" id="bgBtnClear">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        清除背景
                    </button>
                </div>

                <!-- 反馈消息 -->
                <div class="bg-tool-feedback" id="bgFeedback">
                    <p class="bg-tool-feedback-text" id="bgFeedbackText"></p>
                </div>
            </div>
        `;

        this._previewEl = container.querySelector('#bgPreview');
        this._updatePageInfo();
        this._bindEvents(container);
    }

    /**
     * 渲染当前页网格项
     */
    _renderGridItems() {
        return this._activePageItems.map((media, index) => `
            <div class="bg-tool-grid-item"
                 data-index="${index}"
                 data-type="${media.type}"
                 data-path="${encodeURIComponent(media.path)}"
                 title="${media.name}">
                ${media.type === 'video'
                ? `<div class="bg-tool-video-placeholder">
                            <svg viewBox="0 0 24 24" fill="white" width="32" height="32">
                                <polygon points="8,5 19,12 8,19"></polygon>
                            </svg>
                        </div>
                        <span class="bg-tool-item-name">${media.name}</span>`
                : `<img src="/${media.path}"
                            alt="${media.name}"
                            loading="lazy"
                            onerror="this.style.opacity='0.3';this.parentElement.querySelector('.bg-tool-item-error')&&(this.parentElement.querySelector('.bg-tool-item-error').style.display='block')">
                        <div class="bg-tool-item-error" style="display:none">⚠</div>
                        <span class="bg-tool-item-name">${media.name}</span>`
            }
            </div>
        `).join('');
    }

    /**
     * 更新分页信息文字
     */
    _updatePageInfo() {
        const pageInfoText = this._container?.querySelector('#bgPageInfoText');
        const pageNumEl = this._container?.querySelector('#bgPageNum');
        const prevBtn = this._container?.querySelector('#bgPagePrev');
        const nextBtn = this._container?.querySelector('#bgPageNext');

        if (pageInfoText) {
            pageInfoText.textContent = `共 ${this._activeFiles.length} 个文件`;
        }
        if (pageNumEl) {
            pageNumEl.textContent = `${this._activePage} / ${this._activeTotalPages}`;
        }
        if (prevBtn) {
            prevBtn.disabled = this._activePage <= 1;
        }
        if (nextBtn) {
            nextBtn.disabled = this._activePage >= this._activeTotalPages;
        }
    }

    /**
     * 刷新网格和分页控件
     */
    _refreshGrid() {
        const grid = this._container?.querySelector('#bgGrid');
        if (grid) {
            grid.innerHTML = this._renderGridItems();
        }
        this._updatePageInfo();

        // 清除选中状态和预览
        this._clearSelection();
    }

    /**
     * 清除选中状态
     */
    _clearSelection() {
        this._currentMedia = null;
        this._currentType = null;

        const setBtn = this._container?.querySelector('#bgBtnSet');
        if (setBtn) setBtn.disabled = true;

        if (this._previewEl) {
            this._previewEl.innerHTML = `
                <div class="bg-tool-preview-placeholder">
                    <span class="bg-tool-preview-placeholder-text">← 点击下方媒体文件预览并设置为背景</span>
                </div>
            `;
        }
    }

    /**
     * 绑定事件
     */
    _bindEvents(container) {
        // 页签切换
        const tabs = container.querySelector('#bgTabs');
        if (tabs) {
            tabs.addEventListener('click', (e) => {
                const tab = e.target.closest('.bg-tool-tab');
                if (!tab) return;

                const tabName = tab.dataset.tab;
                if (tabName === this._activeTab) return;

                // 切换页签样式
                tabs.querySelectorAll('.bg-tool-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // 更新状态并刷新内容
                this._activeTab = tabName;
                this._refreshGrid();
            });
        }

        // 网格项点击 - 选中预览
        const grid = container.querySelector('#bgGrid');
        if (grid) {
            grid.addEventListener('click', (e) => {
                const item = e.target.closest('.bg-tool-grid-item');
                if (!item) return;

                const type = item.dataset.type;
                const path = decodeURIComponent(item.dataset.path);

                this._selectMedia(type, path, item);
            });
        }

        // 分页按钮
        container.querySelector('#bgPagePrev')?.addEventListener('click', () => {
            if (this._activePage > 1) {
                this._activePage--;
                this._refreshGrid();
                this._scrollToGridTop();
            }
        });

        container.querySelector('#bgPageNext')?.addEventListener('click', () => {
            if (this._activePage < this._activeTotalPages) {
                this._activePage++;
                this._refreshGrid();
                this._scrollToGridTop();
            }
        });

        // 设为背景按钮
        container.querySelector('#bgBtnSet')?.addEventListener('click', () => {
            this._applyBackground();
        });

        // 清除背景按钮
        container.querySelector('#bgBtnClear')?.addEventListener('click', () => {
            this._clearBackground();
        });
    }

    /**
     * 滚动网格到顶部
     */
    _scrollToGridTop() {
        const grid = this._container?.querySelector('#bgGrid');
        if (grid) {
            grid.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    /**
     * 选中媒体文件
     */
    _selectMedia(type, path, itemEl) {
        // 更新网格选中状态
        this._container.querySelectorAll('.bg-tool-grid-item').forEach(el => {
            el.classList.remove('selected');
        });
        itemEl.classList.add('selected');

        this._currentMedia = path;
        this._currentType = type;

        // 更新预览区
        this._renderPreview(path, type);

        // 启用设置按钮
        const setBtn = this._container.querySelector('#bgBtnSet');
        if (setBtn) setBtn.disabled = false;

        // 滚动网格项到可见区域
        itemEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * 渲染预览
     */
    _renderPreview(path, type) {
        if (!this._previewEl) return;

        if (type === 'video') {
            this._previewEl.innerHTML = `
                <div class="bg-tool-preview-media">
                    <video src="/${path}"
                           muted loop autoplay playsinline
                           class="bg-tool-preview-video"></video>
                    <div class="bg-tool-preview-label">
                        <span class="bg-tool-preview-badge video">🎬 视频背景</span>
                        <span class="bg-tool-preview-filename">${path.split('/').pop()}</span>
                    </div>
                </div>
            `;
        } else {
            this._previewEl.innerHTML = `
                <div class="bg-tool-preview-media">
                    <img src="/${path}"
                         alt="Preview"
                         class="bg-tool-preview-image"
                         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                    <div class="bg-tool-preview-error" style="display:none">⚠️ 图片加载失败</div>
                    <div class="bg-tool-preview-label">
                        <span class="bg-tool-preview-badge image">🖼️ 图片背景</span>
                        <span class="bg-tool-preview-filename">${path.split('/').pop()}</span>
                    </div>
                </div>
            `;
        }
    }

    /**
     * 应用背景（通过 SettingsManager）
     */
    async _applyBackground() {
        if (!this._currentMedia) return;

        try {
            const SettingsManager = (await import('../managers/SettingsManager.js')).default;

            if (this._currentType === 'video') {
                await SettingsManager.set('bg_video_url', this._currentMedia);
                await SettingsManager.set('bg_image_enabled', '1');
                await SettingsManager.set('bg_image_url', '');
            } else {
                await SettingsManager.set('bg_image_url', this._currentMedia);
                await SettingsManager.set('bg_image_enabled', '1');
                await SettingsManager.set('bg_video_url', '');
            }

            this._showFeedback(
                `✅ 已设置"${this._currentMedia.split('/').pop()}"为页面背景`,
                true
            );
        } catch (err) {
            this._showFeedback(`❌ 设置失败: ${err.message}`, false);
        }
    }

    /**
     * 清除所有背景
     */
    async _clearBackground() {
        try {
            const SettingsManager = (await import('../managers/SettingsManager.js')).default;

            await SettingsManager.set('bg_image_enabled', '0');
            await SettingsManager.set('bg_image_url', '');
            await SettingsManager.set('bg_video_url', '');

            this._clearSelection();

            this._showFeedback('✅ 背景已清除', true);
        } catch (err) {
            this._showFeedback(`❌ 清除失败: ${err.message}`, false);
        }
    }

    /**
     * 显示操作反馈
     */
    _showFeedback(message, success = true) {
        const feedback = document.getElementById('bgFeedback');
        const feedbackText = document.getElementById('bgFeedbackText');

        if (feedback && feedbackText) {
            feedbackText.textContent = message;
            feedback.className = 'bg-tool-feedback visible ' + (success ? 'success' : 'error');

            clearTimeout(this._feedbackTimer);
            this._feedbackTimer = setTimeout(() => {
                if (feedback) feedback.className = 'bg-tool-feedback';
            }, 4000);
        }
    }
}

export default BackgroundTool;