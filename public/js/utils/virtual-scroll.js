// ==================== 虚拟滚动管理器 ====================

class VirtualScrollManager {
    constructor(options = {}) {
        this.container = options.container;
        this.itemHeight = options.itemHeight || 100;
        this.bufferSize = options.bufferSize || 5; // 缓冲区大小
        this.visibleItems = [];
        this.scrollTop = 0;
        this.totalHeight = 0;
        this.renderCallback = options.renderCallback;
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            console.error('VirtualScrollManager: container is required');
            return;
        }
        
        // 创建滚动容器和占位元素
        this.scrollContainer = document.createElement('div');
        this.scrollContainer.className = 'virtual-scroll-container';
        this.scrollContainer.style.cssText = `
            height: 100%;
            overflow-y: auto;
            position: relative;
        `;
        
        this.spacerTop = document.createElement('div');
        this.spacerTop.className = 'virtual-spacer-top';
        
        this.contentContainer = document.createElement('div');
        this.contentContainer.className = 'virtual-content';
        this.contentContainer.style.cssText = `
            position: absolute;
            width: 100%;
            left: 0;
        `;
        
        this.spacerBottom = document.createElement('div');
        this.spacerBottom.className = 'virtual-spacer-bottom';
        
        this.scrollContainer.appendChild(this.spacerTop);
        this.scrollContainer.appendChild(this.contentContainer);
        this.scrollContainer.appendChild(this.spacerBottom);
        
        this.container.innerHTML = '';
        this.container.appendChild(this.scrollContainer);
        
        // 绑定滚动事件（使用防抖）
        let scrollTimer = null;
        this.scrollContainer.addEventListener('scroll', () => {
            if (scrollTimer) {
                cancelAnimationFrame(scrollTimer);
            }
            scrollTimer = requestAnimationFrame(() => {
                this.handleScroll();
            });
        });
    }
    
    /**
     * 设置数据
     */
    setData(items) {
        this.items = items || [];
        this.totalHeight = this.items.length * this.itemHeight;
        
        this.spacerTop.style.height = '0px';
        this.spacerBottom.style.height = `${this.totalHeight}px`;
        
        this.renderVisibleItems();
    }
    
    /**
     * 处理滚动
     */
    handleScroll() {
        this.scrollTop = this.scrollContainer.scrollTop;
        this.renderVisibleItems();
    }
    
    /**
     * 渲染可见项
     */
    renderVisibleItems() {
        const containerHeight = this.scrollContainer.clientHeight;
        
        // 计算可见范围
        const startIndex = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.bufferSize);
        const endIndex = Math.min(
            this.items.length,
            Math.ceil((this.scrollTop + containerHeight) / this.itemHeight) + this.bufferSize
        );
        
        // 更新占位元素高度
        const topHeight = startIndex * this.itemHeight;
        const bottomHeight = (this.items.length - endIndex) * this.itemHeight;
        
        this.spacerTop.style.height = `${topHeight}px`;
        this.spacerBottom.style.height = `${bottomHeight}px`;
        this.contentContainer.style.top = `${topHeight}px`;
        
        // 只渲染可见项
        const visibleData = this.items.slice(startIndex, endIndex);
        
        // 清空并重新渲染
        this.contentContainer.innerHTML = '';
        
        visibleData.forEach((item, index) => {
            const actualIndex = startIndex + index;
            const element = this.renderCallback(item, actualIndex);
            
            if (element) {
                element.style.height = `${this.itemHeight}px`;
                element.style.position = 'absolute';
                element.style.top = `${index * this.itemHeight}px`;
                element.style.width = '100%';
                this.contentContainer.appendChild(element);
            }
        });
        
        this.visibleItems = visibleData;
    }
    
    /**
     * 滚动到指定索引
     */
    scrollToIndex(index) {
        const position = index * this.itemHeight;
        this.scrollContainer.scrollTop = position;
    }
    
    /**
     * 获取当前可见项
     */
    getVisibleItems() {
        return this.visibleItems;
    }
    
    /**
     * 销毁
     */
    destroy() {
        if (this.scrollContainer && this.scrollContainer.parentNode) {
            this.scrollContainer.parentNode.removeChild(this.scrollContainer);
        }
    }
}

export default VirtualScrollManager;
