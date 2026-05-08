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
        style.textContent = `
/* ==================== 左侧悬浮侧栏 ==================== */
.sidebar {
    position: fixed;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: var(--sidebar-width);
    height: auto;
    max-height: 80vh;
    background: var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border-radius: 1rem;
    box-shadow: var(--shadow-lg);
    z-index: 1000;
    padding: 1rem 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

/* 头像 */
.sidebar-avatar {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    transition: transform var(--transition-normal);
    border: 2px solid var(--theme-color);
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
    min-height: 0; /* 允许 flex 子元素缩小 */
    overflow-y: auto;
    overflow-x: hidden;
    /* 自定义滚动条样式 */
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

/* WebKit 浏览器的滚动条样式 */
.sidebar-categories::-webkit-scrollbar {
    width: 4px;
}

.sidebar-categories::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 2px;
}

.sidebar-categories::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    transition: background var(--transition-fast);
}

.sidebar-categories::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
}

.sidebar-category {
    width: 100%;
    padding: 0.75rem 0.5rem;
    text-align: center;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: 0.5rem;
    transition: all var(--transition-fast);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
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

.sidebar-category:hover .sidebar-icon {
    opacity: 1;
    transform: scale(1.1);
}

.sidebar-category.active .sidebar-icon svg {
    /* 激活状态：使用主题色 */
    fill: white;
    color: white;
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

/* 侧栏渐入动画 */
.sidebar {
    animation: fadeIn 0.3s ease backwards;
}

/* ==================== 移动端适配 ==================== */
@media (max-width: 767px) {
    .sidebar {
        display: none;
    }
}

/* 平板端适配 */
@media (min-width: 768px) and (max-width: 1023px) {
    .sidebar {
        width: 8%;
    }
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
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const width = this.getAttribute('width') || '6';
        const avatarUrl = this.getAttribute('avatar-url') || '';
        const username = this.getAttribute('username') || '用户';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: fixed;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 1000;
                }

                /* ==================== 左侧悬浮侧栏 ==================== */
                .sidebar {
                    width: var(--sidebar-width, ${width}vw);
                    height: auto;
                    max-height: 80vh;
                    background: var(--glass-bg, rgba(255, 255, 255, 0.1));
                    backdrop-filter: blur(var(--glass-blur, 10px));
                    -webkit-backdrop-filter: blur(var(--glass-blur, 10px));
                    border-radius: 1rem;
                    box-shadow: var(--shadow-lg, 0 4px 16px rgba(0, 0, 0, 0.2));
                    padding: 1rem 0.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                /* 头像 */
                .sidebar-avatar {
                    width: 3rem;
                    height: 3rem;
                    border-radius: 50%;
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform var(--transition-normal, 0.3s ease);
                    border: 2px solid var(--theme-color, #667eea);
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
                    min-height: 0; /* 允许 flex 子元素缩小 */
                    overflow-y: auto;
                    overflow-x: hidden;
                    /* 自定义滚动条样式 */
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
                }

                /* WebKit 浏览器的滚动条样式 */
                .sidebar-categories::-webkit-scrollbar {
                    width: 4px;
                }

                .sidebar-categories::-webkit-scrollbar-track {
                    background: transparent;
                    border-radius: 2px;
                }

                .sidebar-categories::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 2px;
                    transition: background var(--transition-fast, 0.2s);
                }

                .sidebar-categories::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.4);
                }

                .sidebar-category {
                    width: 100%;
                    padding: 0.75rem 0.5rem;
                    text-align: center;
                    color: var(--text-secondary, rgba(255, 255, 255, 0.8));
                    cursor: pointer;
                    border-radius: 0.5rem;
                    transition: all var(--transition-fast, 0.2s);
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* 侧栏 SVG 图标容器 */
                .sidebar-icon {
                    width: 1.5rem;
                    height: 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.8;
                    transition: all var(--transition-fast, 0.2s);
                }

                /* SVG 元素本身 */
                .sidebar-icon svg {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    /* 默认浅色模式：深色图标 */
                    fill: var(--text-secondary, rgba(255, 255, 255, 0.8));
                    color: var(--text-secondary, rgba(255, 255, 255, 0.8));
                }

                .sidebar-category:hover .sidebar-icon {
                    opacity: 1;
                    transform: scale(1.1);
                }

                .sidebar-category.active .sidebar-icon svg {
                    /* 激活状态：使用主题色 */
                    fill: white;
                    color: white;
                }

                .sidebar-category:hover {
                    background: var(--bg-tertiary, rgba(255, 255, 255, 0.1));
                    color: var(--text-primary, white);
                }

                .sidebar-category.active {
                    background: var(--theme-color, #667eea);
                    color: white;
                    font-weight: bold;
                }
            </style>
            <div class="sidebar">
                <div class="sidebar-avatar" title="${username}">
                    ${avatarUrl
                ? `<img src="${avatarUrl}" alt="${username}">`
                : `<div class="avatar-placeholder">${username.charAt(0).toUpperCase()}</div>`
            }
                </div>
                <div class="sidebar-categories">
                    ${this.categories.map((cat, index) => `
                        <div class="sidebar-category ${index === 0 ? 'active' : ''}" data-category-id="${cat.id}">
                            ${cat.ico ? `
                                <div class="sidebar-icon">${cat.ico}</div>
                            ` : cat.icon ? `
                                <div class="sidebar-icon">${cat.icon}</div>
                            ` : `
                                <span>${cat.name || cat.category_name}</span>
                            `}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
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
