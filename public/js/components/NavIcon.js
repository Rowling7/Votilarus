// ==================== NavIcon Web Component ====================

class NavIcon extends HTMLElement {
    static get observedAttributes() {
        return ['title', 'url', 'size', 'image', 'uuid'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    connectedCallback() {
        this.bindEvents();
        // 监听 CSS 变量变化
        this.observeCSSVariables();
    }

    /**
     * 观察 CSS 变量变化并重新渲染
     */
    observeCSSVariables() {
        // 创建一个 MutationObserver 来监听 document.documentElement 的 style 属性变化
        const observer = new MutationObserver(() => {
            // 当 CSS 变量变化时，重新渲染组件
            this.render();
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style']
        });

        // 保存 observer 引用以便后续清理
        this.cssObserver = observer;
    }

    disconnectedCallback() {
        // 清理 observer
        if (this.cssObserver) {
            this.cssObserver.disconnect();
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const title = this.getAttribute('title') || '';
        const url = this.getAttribute('url') || '';
        const size = this.getAttribute('size') || '1x1';
        const image = this.getAttribute('image') || '';
        const uuid = this.getAttribute('uuid') || '';

        const [width, height] = size.split('x').map(Number);

        // 获取标题最大长度设置
        const titleMaxLength = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--title-max-length')) || 8;
        const displayTitle = title.length > titleMaxLength ? title.substring(0, titleMaxLength) + '...' : title;

        // 获取标题位置设置
        const titlePosition = getComputedStyle(document.documentElement).getPropertyValue('--title-position').trim() || 'bottom';

        // 根据位置计算样式
        let titlePositionStyle = '';
        switch (titlePosition) {
            case 'top':
                titlePositionStyle = `
                    top: -1.5rem;
                    bottom: auto;
                `;
                break;
            case 'floating':
                titlePositionStyle = `
                    bottom: 0.5rem;
                    background: rgba(0, 0, 0, 0.7);
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    font-size: calc(var(--title-font-size, 12px) * 0.9);
                `;
                break;
            case 'bottom':
            default:
                titlePositionStyle = `
                    bottom: -1.5rem;
                    top: auto;
                `;
                break;
        }

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: absolute;
                    cursor: pointer;
                    user-select: none;
                    transition: transform 0.2s ease;
                }

                :host(:hover) {
                    transform: scale(1.05);
                }

                .icon-container {
                    width: calc(var(--cell-base-size, 4rem) * ${width} - var(--cell-gap, 1rem));
                    height: calc(var(--cell-base-size, 4rem) * ${height} - var(--cell-gap, 1rem));
                    border-radius: var(--icon-radius, 0.5rem);
                    overflow: hidden;
                    position: relative;
                    box-shadow: var(--icon-shadow, 0 2px 8px rgba(0, 0, 0, 0.2));
                }

                .icon-bg {
                    width: 100%;
                    height: 100%;
                    background-size: cover;
                    background-position: center;
                    ${image ? `background-image: url(${image});` : ''}
                }

                .icon-letter {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    font-weight: bold;
                    color: white;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .icon-title {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: var(--title-font-size, 12px);
                    color: var(--title-color, #ffffff);
                    white-space: nowrap;
                    max-width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: var(--show-title, block);
                    ${titlePositionStyle}
                }
            </style>
            <div class="icon-container" data-uuid="${uuid}" data-url="${url}">
                ${image
                ? `<div class="icon-bg"></div>`
                : `<div class="icon-letter">${title.charAt(0).toUpperCase()}</div>`
            }
                <div class="icon-title">${displayTitle}</div>
            </div>
        `;
    }

    bindEvents() {
        const container = this.shadowRoot.querySelector('.icon-container');

        // 点击事件
        container.addEventListener('click', (e) => {
            const url = container.dataset.url;
            if (url) {
                window.open(url, '_blank');
            }
        });

        // 拖拽事件
        container.setAttribute('draggable', 'true');
        container.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', container.dataset.itemId);
            this.dispatchEvent(new CustomEvent('drag-start', {
                bubbles: true,
                detail: { itemId: container.dataset.itemId }
            }));
        });

        // 右键菜单
        container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.dispatchEvent(new CustomEvent('context-menu', {
                bubbles: true,
                detail: {
                    itemId: container.dataset.itemId,
                    x: e.clientX,
                    y: e.clientY
                }
            }));
        });
    }

    // 公共方法：更新属性
    update(props) {
        if (props.title) this.setAttribute('title', props.title);
        if (props.url) this.setAttribute('url', props.url);
        if (props.size) this.setAttribute('size', props.size);
        if (props.image !== undefined) this.setAttribute('image', props.image);
    }
}

// 注册自定义元素
customElements.define('nav-icon', NavIcon);

export default NavIcon;
