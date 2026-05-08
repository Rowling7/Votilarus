// ==================== NavSidebar Web Component ====================

class NavSidebar extends HTMLElement {
    static get observedAttributes() {
        return ['width', 'avatar-url', 'username'];
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
                    z-index: 100;
                }

                .sidebar-container {
                    width: ${width}vw;
                    min-width: 80px;
                    max-width: 120px;
                    height: auto;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border-radius: 1rem;
                    padding: 1rem 0.5rem;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .avatar {
                    width: 3rem;
                    height: 3rem;
                    border-radius: 50%;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                }

                .avatar:hover {
                    transform: scale(1.1);
                    border-color: var(--theme-color, #667eea);
                }

                .avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .avatar-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    font-size: 1.5rem;
                    font-weight: bold;
                }

                .category-list {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .category-item {
                    width: 100%;
                    padding: 0.75rem 0.5rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: center;
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.9rem;
                    user-select: none;
                }

                .category-item:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }

                .category-item.active {
                    background: var(--theme-color, #667eea);
                    color: white;
                    font-weight: bold;
                }

                .category-icon {
                    font-size: 1.5rem;
                    margin-bottom: 0.25rem;
                }

                .category-name {
                    font-size: 0.75rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            </style>
            <div class="sidebar-container">
                <div class="avatar" title="${username}">
                    ${avatarUrl
                ? `<img src="${avatarUrl}" alt="${username}">`
                : `<div class="avatar-placeholder">${username.charAt(0).toUpperCase()}</div>`
            }
                </div>
                <div class="category-list">
                    ${this.categories.map((cat, index) => `
                        <div class="category-item ${index === 0 ? 'active' : ''}" data-category-id="${cat.id}">
                            <div class="category-icon">${cat.icon || '📁'}</div>
                            <div class="category-name">${cat.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    bindEvents() {
        const avatar = this.shadowRoot.querySelector('.avatar');
        const categoryItems = this.shadowRoot.querySelectorAll('.category-item');

        // 头像点击事件
        avatar.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('avatar-click', {
                bubbles: true,
                detail: { username: this.getAttribute('username') }
            }));
        });

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
        const items = this.shadowRoot.querySelectorAll('.category-item');
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
        const activeItem = this.shadowRoot.querySelector('.category-item.active');
        return activeItem ? activeItem.dataset.categoryId : null;
    }
}

// 注册自定义元素
customElements.define('nav-sidebar', NavSidebar);

export default NavSidebar;
