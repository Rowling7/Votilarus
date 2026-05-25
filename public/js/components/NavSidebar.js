// ==================== NavSidebar Web Component ====================

class NavSidebar extends HTMLElement {
    static get observedAttributes() {
        return ['width', 'avatar-url', 'username'];
    }

    /**
     * 注入侧边栏样式到页面中
     * 这个方法可以在应用初始化时调用，以确保样式可用
     */
    static injectStyles() {
        // 检查是否已经注入过样式
        if (document.getElementById('navsidebar-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'navsidebar-styles';

        // 从 CSS 文件加载样式（这里直接嵌入，因为 Shadow DOM 需要）
        style.textContent = `
/* ==================== 左侧悬浮侧栏 ==================== */
.sidebar {
    position: fixed;
    left: 0;
    /* 默认显示 */
    top: 50%;
    transform: translateY(-50%);
    width: var(--sidebar-width);
    height: auto;
    max-height: 80vh;
    background: var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border-radius: 2rem;
    box-shadow: var(--shadow-lg);
    z-index: 1000;
    padding: 1rem 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    transition: left 0.3s ease;
    /* 平滑滑出动画 */
}

/* 宽度 < 40px 时自动隐藏 */
.sidebar.auto-hidden {
    left: calc(var(--sidebar-width) * -1);
}

/* 鼠标悬停时显示（用于自动隐藏状态） */
.sidebar.auto-hidden.visible {
    left: 0;
}

/* 头像 */
.sidebar-avatar {
    width: 2rem;
    /* 32px */
    height: 2rem;
    /* 32px */
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    transition: transform var(--transition-normal);
    border: 1px solid var(--theme-color);
    flex-shrink: 0;
    /* 防止被压缩 */
}

.sidebar-avatar:hover {
    transform: scale(1.1);
}

.sidebar-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* 分类列表 */
.sidebar-categories {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    /* 添加滚动功能 - 占据剩余空间 */
    flex: 1;
    min-height: 0;
    /* 允许 flex 子元素缩小 */
    overflow-y: auto;
    overflow-x: hidden;
    /* 隐藏滚动条但保留功能 */
    scrollbar-width: none;
    /* Firefox */
    -ms-overflow-style: none;
    /* IE/Edge */
}

/* WebKit 浏览器的滚动条样式 - 隐藏 */
.sidebar-categories::-webkit-scrollbar {
    display: none;
}

.sidebar-category {
    width: 100%;
    padding: 0.5rem 0;
    /* 减小padding适应小宽度 */
    text-align: center;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: 0.5rem;
    transition: all var(--transition-fast);
    font-size: 0.9rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    min-height: 32px;
    /* 确保最小高度 */
}

/* 分类项文字 - 默认隐藏 */
.sidebar-text {
    font-size: 0.75rem;
    color: var(--text-secondary);
    opacity: 0;
    max-height: 0;
    overflow: hidden;
    transition: all var(--transition-fast);
}

/* 大宽度时显示文字 */
.sidebar.wide .sidebar-text {
    opacity: 1;
    max-height: 20px;
}

/* 侧栏 SVG 图标容器 */
.sidebar-icon {
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.8;
    transition: all var(--transition-fast);
}

/* SVG 元素本身 */
.sidebar-icon svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
    /* 默认浅色模式：深色图标 */
    fill: var(--text-secondary);
    color: var(--text-secondary);
}

/* 首字母显示 */
.sidebar-letter {
    font-size: 1rem;
    font-weight: bold;
    color: var(--text-secondary);
    opacity: 0.8;
    transition: all var(--transition-fast);
}

.sidebar-category:hover .sidebar-icon,
.sidebar-category:hover .sidebar-letter {
    opacity: 1;
    transform: scale(1.1);
}

.sidebar-category.active .sidebar-icon svg,
.sidebar-category.active .sidebar-letter {
    /* 激活状态：使用主题色 */
    fill: white;
    color: white;
    opacity: 1;
}

.sidebar-category:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
}

.sidebar-category.active {
    background: var(--theme-color);
    color: white;
    font-weight: bold;
}

/* 侧栏全屏模式（模式 2） */
.sidebar.sidebar-mode-full {
    top: 0 !important;
    transform: none !important;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    border-top-left-radius: 0rem !important;
    border-bottom-left-radius: 0rem !important;
    backdrop-filter: blur(var(--glass-blur, 15px));
    -webkit-backdrop-filter: blur(var(--glass-blur, 15px));
    background: rgba(255, 255, 255, 0) !important;
}

[data-theme="dark"] .sidebar.sidebar-mode-full {
    background: var(--glass-bg, rgba(30, 30, 30, 0.92));
}

/* 侧栏渐入动画 */
.sidebar {
    animation: fadeIn 0.3s ease backwards;
}
        `;
        document.head.appendChild(style);
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.categories = [];
        this.render();
    }

    connectedCallback() {
        this.bindEvents();
        this.initHoverDetection();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const width = this.getAttribute('width') || '50';
        const avatarUrl = this.getAttribute('avatar-url') || '';
        const username = this.getAttribute('username') || '用户';

        // 根据宽度决定是否显示文字
        const sidebarWidth = parseInt(width) || 50;
        const showText = sidebarWidth >= 60;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: fixed;
                    left: 0; /* 默认显示 */
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 1000;
                    transition: left 0.3s ease;
                }
            </style>
            <div class="sidebar ${showText ? 'wide' : 'narrow'}">
                <div class="sidebar-avatar" title="${username}">
                    ${avatarUrl
                ? `<img src="${avatarUrl}" alt="${username}">`
                : `<div class="avatar-placeholder">${username.charAt(0).toUpperCase()}</div>`
            }
                </div>
                <div class="sidebar-categories">
                    ${this.categories.map((cat, index) => {
                // 优先使用图标，否则显示首字母
                let iconContent = '';
                if (cat.ico) {
                    iconContent = `<div class="sidebar-icon">${cat.ico}</div>`;
                } else if (cat.icon) {
                    iconContent = `<div class="sidebar-icon">${cat.icon}</div>`;
                } else {
                    // 显示首字母
                    const name = cat.name || cat.category_name || '';
                    const firstLetter = name.charAt(0).toUpperCase();
                    iconContent = `<span class="sidebar-letter">${firstLetter}</span>`;
                }

                // 根据宽度决定是否显示文字
                const textContent = showText ? `<span class="sidebar-text">${cat.name || cat.category_name || ''}</span>` : '';

                return `
                        <div class="sidebar-category ${index === 0 ? 'active' : ''}" data-category-id="${cat.id}">
                            ${iconContent}
                            ${textContent}
                        </div>
                    `;
            }).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 初始化鼠标悬停检测
     */
    initHoverDetection() {
        // 监听鼠标移动
        this._handleMouseMove = (e) => {
            const sidebar = this.shadowRoot.querySelector('.sidebar');
            if (!sidebar) return;

            // 只有在 auto-hidden 状态下才响应悬停
            if (sidebar.classList.contains('auto-hidden')) {
                if (e.clientX <= 10) {
                    // 鼠标在左边缘10px内，显示侧边栏
                    sidebar.classList.add('visible');
                } else {
                    // 鼠标离开，隐藏侧边栏
                    sidebar.classList.remove('visible');
                }
            }
        };

        document.addEventListener('mousemove', this._handleMouseMove);
    }

    disconnectedCallback() {
        // 清理事件监听器
        if (this._handleMouseMove) {
            document.removeEventListener('mousemove', this._handleMouseMove);
        }
    }

    bindEvents() {
        const avatar = this.shadowRoot.querySelector('.sidebar-avatar');
        const categoryItems = this.shadowRoot.querySelectorAll('.sidebar-category');

        // 头像点击事件
        if (avatar) {
            avatar.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('avatar-click', {
                    bubbles: true,
                    detail: { username: this.getAttribute('username') }
                }));
            });
        }

        // 分类点击事件
        categoryItems.forEach(item => {
            item.addEventListener('click', () => {
                const categoryId = item.dataset.categoryId;

                // 更新激活状态
                categoryItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // 派发事件
                this.dispatchEvent(new CustomEvent('category-change', {
                    bubbles: true,
                    detail: { categoryId }
                }));
            });
        });
    }

    // 公共方法：设置分类列表
    setCategories(categories) {
        this.categories = categories || [];
        this.render();
    }

    // 公共方法：激活指定分类
    activateCategory(categoryId) {
        const items = this.shadowRoot.querySelectorAll('.sidebar-category');
        items.forEach(item => {
            if (item.dataset.categoryId === categoryId.toString()) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // 公共方法：获取当前激活的分类
    getActiveCategory() {
        const activeItem = this.shadowRoot.querySelector('.sidebar-category.active');
        return activeItem ? activeItem.dataset.categoryId : null;
    }
}

// 注册自定义元素
customElements.define('nav-sidebar', NavSidebar);

export default NavSidebar;
