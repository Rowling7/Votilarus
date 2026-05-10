// ==================== NavDock Web Component ====================

class NavDock extends HTMLElement {
    static get observedAttributes() {
        return ['position', 'max-items'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.items = [];
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
        const position = this.getAttribute('position') || 'bottom';
        const maxItems = this.getAttribute('max-items') || '10';

        let positionStyles = '';
        switch (position) {
            case 'left':
                positionStyles = 'left: 1rem; top: 50%; transform: translateY(-50%); flex-direction: column;';
                break;
            case 'right':
                positionStyles = 'right: 1rem; top: 50%; transform: translateY(-50%); flex-direction: column;';
                break;
            default: // bottom
                positionStyles = 'bottom: 1rem; left: 50%; transform: translateX(-50%); flex-direction: row;';
        }

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: fixed;
                    z-index: 1000;
                }

                .dock-container {
                    ${positionStyles}
                    display: flex;
                    gap: 1rem;
                    padding: 0.75rem;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border-radius: 1rem;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                }

                ::slotted(*) {
                    transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
            </style>
            <div class="dock-container">
                <slot></slot>
            </div>
        `;
    }

    bindEvents() {
        const container = this.shadowRoot.querySelector('.dock-container');

        // 监听子元素的鱼眼效果
        container.addEventListener('mousemove', (e) => {
            const items = Array.from(container.querySelectorAll('::slotted(*)'));
            const hoveredItem = e.target.closest('::slotted(*)');

            if (hoveredItem) {
                this.applyFisheyeEffect(hoveredItem, items);
            }
        });

        container.addEventListener('mouseleave', () => {
            const items = Array.from(container.querySelectorAll('::slotted(*)'));
            items.forEach(item => {
                item.style.transform = 'scale(1)';
            });
        });
    }

    applyFisheyeEffect(hoveredItem, allItems) {
        const hoveredIndex = allItems.indexOf(hoveredItem);
        if (hoveredIndex === -1) return;

        allItems.forEach((item, index) => {
            const distance = Math.abs(index - hoveredIndex);
            const fisheyeScale = 1.5;
            const fisheyeRange = 2;

            if (distance <= fisheyeRange) {
                const scale = 1 + (fisheyeScale - 1) * (1 - distance / (fisheyeRange + 1));
                const translateY = (scale - 1) * -20;
                item.style.transform = `scale(${scale}) translateY(${translateY}px)`;
                // 为放大的图标设置更高的z-index
                item.style.zIndex = 10 - distance;
            } else {
                item.style.transform = 'scale(1) translateY(0)';
                item.style.zIndex = 1;
            }
        });
    }

    // 公共方法：添加项目
    addItem(itemElement) {
        const container = this.shadowRoot.querySelector('.dock-container');
        const maxItems = parseInt(this.getAttribute('max-items')) || 10;

        if (container.children.length >= maxItems) {
            return false;
        }

        container.appendChild(itemElement);
        this.dispatchEvent(new CustomEvent('item-added', {
            bubbles: true,
            detail: { element: itemElement }
        }));
        return true;
    }

    // 公共方法：移除项目
    removeItem(itemElement) {
        itemElement.remove();
        this.dispatchEvent(new CustomEvent('item-removed', {
            bubbles: true,
            detail: { element: itemElement }
        }));
    }

    // 公共方法：获取所有项目
    getItems() {
        const container = this.shadowRoot.querySelector('.dock-container');
        return Array.from(container.children);
    }
}

// 注册自定义元素
customElements.define('nav-dock', NavDock);

export default NavDock;
