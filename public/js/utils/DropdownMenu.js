// ==================== 下拉菜单组件 ====================

/**
 * DropdownMenu - 通用下拉菜单组件
 *
 * 使用方式:
 *   import { DropdownMenu } from '/js/utils/DropdownMenu.js';
 *   const menu = new DropdownMenu(items, options);
 *   menu.show(x, y); // 在指定坐标显示
 *
 * 数据格式 (items):
 *   [
 *     { label: '编辑', icon: '✏️', shortcut: 'Ctrl+E', action: () => { ... } },
 *     { label: '复制', icon: '📋', shortcut: 'Ctrl+C', action: () => { ... } },
 *     { type: 'divider' },
 *     { type: 'divider', label: '高级' },
 *     { type: 'group', label: '视图', children: [
 *         { label: '列表', selected: true, action: ... },
 *         { label: '网格', action: ... }
 *     ]},
 *     { label: '更多', icon: '▶', children: [
 *         { label: '子选项1', action: ... },
 *         { label: '子选项2', action: ... }
 *     ]},
 *     { label: '删除', icon: '🗑️', danger: true, action: () => { ... } }
 *   ]
 */

class DropdownMenu {
    /**
     * 当前所有活跃的菜单实例（用于全局关闭）
     */
    static activeInstances = new Set();

    /**
     * @param {Array} items - 菜单项配置数组
     * @param {Object} options - 全局选项
     * @param {string} [options.trigger='click'] - 触发方式: 'click' | 'hover'
     * @param {boolean} [options.closeOnClickOutside=true] - 点击外部是否关闭
     * @param {boolean} [options.closeOnSelect=true] - 选择菜单项后是否关闭
     * @param {number} [options.submenuDelay=200] - 子菜单展开延迟(ms)，hover模式使用
     * @param {number} [options.submenuCloseDelay=300] - 子菜单关闭延迟(ms)，hover模式使用
     * @param {string} [options.menuClass=''] - 附加的菜单容器 CSS 类名
     * @param {Function} [options.onShow] - 菜单显示回调
     * @param {Function} [options.onHide] - 菜单关闭回调
     */
    constructor(items = [], options = {}) {
        this.items = items;
        this.options = {
            trigger: 'click',
            closeOnClickOutside: true,
            closeOnSelect: true,
            submenuDelay: 200,
            submenuCloseDelay: 300,
            menuClass: '',
            onShow: null,
            onHide: null,
            ...options
        };

        // DOM 元素
        this.menuEl = null;
        this.overlayEl = null;
        this.parentMenu = null;
        this.submenus = new Map(); // 所有子菜单集合，key: item index, value: DropdownMenu 实例

        // 状态
        this.isVisible = false;
        this.hoverTimers = new Map();
        this._handleKeyDown = this._handleKeyDown.bind(this);
    }

    // ==================== 公共方法 ====================

    /**
     * 在指定坐标显示菜单
     * @param {number} x - 鼠标 X 坐标
     * @param {number} y - 鼠标 Y 坐标
     * @param {DropdownMenu} [parentMenu] - 父菜单实例（子菜单用）
     */
    /**
     * 切换菜单的显示/关闭状态
     * 如果菜单已显示则关闭，否则在指定坐标显示
     * @param {number} x
     * @param {number} y
     * @param {DropdownMenu} [parentMenu]
     * @returns {boolean} true: 显示, false: 已关闭
     */
    toggle(x, y, parentMenu = null) {
        if (this.isVisible) {
            this.destroyAll();
            return false;
        }
        this.show(x, y, parentMenu);
        return true;
    }

    show(x, y, parentMenu = null) {
        // 先关闭所有已存在的菜单
        DropdownMenu.closeAll();

        this.parentMenu = parentMenu;

        // 构建 DOM
        this.menuEl = this._buildMenu(this.items);
        if (this.options.menuClass) {
            this.menuEl.classList.add(this.options.menuClass);
        }
        if (parentMenu) {
            this.menuEl.classList.add('submenu');
        }

        // 创建遮罩层（只有顶层菜单需要）
        if (!parentMenu && this.options.closeOnClickOutside) {
            this.overlayEl = document.createElement('div');
            this.overlayEl.className = 'dropdown-overlay';
            this.overlayEl.addEventListener('click', (e) => {
                e.stopPropagation();
                DropdownMenu.closeAll();
            });
            this.overlayEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                DropdownMenu.closeAll();
            });
            document.body.appendChild(this.overlayEl);
        }

        document.body.appendChild(this.menuEl);

        // 调整位置，防止溢出视口
        this._adjustPosition(x, y);

        // 注册为活跃实例
        DropdownMenu.activeInstances.add(this);

        this.isVisible = true;

        // 绑定键盘事件
        document.addEventListener('keydown', this._handleKeyDown);

        // 触发回调
        if (this.options.onShow) {
            this.options.onShow(this);
        }
    }

    /**
     * 销毁当前菜单（不销毁子菜单由 destroyAll 统一处理）
     */
    destroy() {
        if (!this.isVisible) return;

        // 先销毁所有子菜单
        for (const submenu of this.submenus.values()) {
            submenu.destroy();
        }
        this.submenus.clear();

        // 移除键盘事件
        document.removeEventListener('keydown', this._handleKeyDown);

        // 清除所有 hover 计时器
        for (const timer of this.hoverTimers.values()) {
            clearTimeout(timer);
        }
        this.hoverTimers.clear();

        // 移除 DOM
        if (this.menuEl && this.menuEl.parentNode) {
            this.menuEl.parentNode.removeChild(this.menuEl);
        }
        if (this.overlayEl && this.overlayEl.parentNode) {
            this.overlayEl.parentNode.removeChild(this.overlayEl);
        }

        this.menuEl = null;
        this.overlayEl = null;
        this.isVisible = false;

        // 从活跃实例中移除
        DropdownMenu.activeInstances.delete(this);

        // 触发回调
        if (this.options.onHide) {
            this.options.onHide(this);
        }
    }

    /**
     * 销毁所有菜单（包括父菜单链）
     */
    destroyAll() {
        // 找到最顶层菜单
        let root = this;
        while (root.parentMenu) {
            root = root.parentMenu;
        }
        root._destroyRecursive();
    }

    /**
     * 静态方法：关闭所有打开的菜单
     */
    static closeAll() {
        const instances = [...DropdownMenu.activeInstances];
        for (const instance of instances) {
            instance.destroyAll();
        }
    }

    // ==================== 内部方法 ====================

    /**
     * 递归销毁菜单树
     */
    _destroyRecursive() {
        for (const submenu of this.submenus.values()) {
            submenu._destroyRecursive();
        }
        this.submenus.clear();

        document.removeEventListener('keydown', this._handleKeyDown);

        for (const timer of this.hoverTimers.values()) {
            clearTimeout(timer);
        }
        this.hoverTimers.clear();

        if (this.menuEl && this.menuEl.parentNode) {
            this.menuEl.parentNode.removeChild(this.menuEl);
        }
        if (this.overlayEl && this.overlayEl.parentNode) {
            this.overlayEl.parentNode.removeChild(this.overlayEl);
        }

        this.menuEl = null;
        this.overlayEl = null;
        this.isVisible = false;

        DropdownMenu.activeInstances.delete(this);

        if (this.options.onHide) {
            this.options.onHide(this);
        }
    }

    /**
     * 根据配置数据构建菜单 DOM
     */
    _buildMenu(items) {
        const menu = document.createElement('div');
        menu.className = 'dropdown-menu';

        items.forEach((item, index) => {
            const el = this._buildItem(item, index);
            if (el) {
                menu.appendChild(el);
            }
        });

        return menu;
    }

    /**
     * 构建单个菜单项
     * @returns {HTMLElement|null}
     */
    _buildItem(item, index) {
        // 分隔线
        if (item.type === 'divider') {
            return this._buildDivider(item);
        }

        // 分组
        if (item.type === 'group') {
            return this._buildGroup(item, index);
        }

        // 普通菜单项
        return this._buildMenuItem(item, index);
    }

    /**
     * 构建分隔线
     */
    _buildDivider(item) {
        const divider = document.createElement('div');

        if (item.label) {
            divider.className = 'dropdown-divider labeled';
            const label = document.createElement('span');
            label.className = 'dropdown-divider-label';
            label.textContent = item.label;
            divider.appendChild(label);
        } else {
            divider.className = 'dropdown-divider';
        }

        return divider;
    }

    /**
     * 构建分组容器
     */
    _buildGroup(item, index) {
        const group = document.createElement('div');
        group.className = 'dropdown-group';

        // 分组标题
        if (item.label) {
            const label = document.createElement('div');
            label.className = 'dropdown-group-label';
            label.textContent = item.label;
            group.appendChild(label);
        }

        // 分组内的子项
        if (item.children && Array.isArray(item.children)) {
            item.children.forEach((child, childIndex) => {
                if (child.type === 'divider') {
                    group.appendChild(this._buildDivider(child));
                } else {
                    group.appendChild(this._buildMenuItem(child, `${index}-${childIndex}`, true));
                }
            });
        }

        return group;
    }

    /**
     * 构建普通菜单项
     */
    _buildMenuItem(item, index, isGroupChild = false) {
        const menuItem = document.createElement('div');
        menuItem.className = 'dropdown-item';
        menuItem.dataset.index = index;

        if (item.disabled) {
            menuItem.classList.add('disabled');
        }
        if (item.danger) {
            menuItem.classList.add('danger');
        }
        if (item.selected) {
            menuItem.classList.add('selected');
        }

        // 左侧图标
        if (item.icon) {
            const iconEl = document.createElement('span');
            iconEl.className = 'dropdown-item-icon';
            // 支持 SVG 字符串或纯文本 emoji
            if (typeof item.icon === 'string' && item.icon.trim().startsWith('<')) {
                iconEl.innerHTML = item.icon;
            } else {
                iconEl.textContent = item.icon;
            }
            menuItem.appendChild(iconEl);
        }

        // 标签文字
        const labelEl = document.createElement('span');
        labelEl.className = 'dropdown-item-label';
        labelEl.textContent = item.label || '';
        menuItem.appendChild(labelEl);

        // 右侧快捷键
        if (item.shortcut) {
            const shortcutEl = document.createElement('span');
            shortcutEl.className = 'dropdown-item-shortcut';
            shortcutEl.textContent = item.shortcut;
            menuItem.appendChild(shortcutEl);
        }

        // 子菜单箭头
        const hasChildren = item.children && Array.isArray(item.children) && item.children.length > 0;
        if (hasChildren) {
            const arrowEl = document.createElement('span');
            arrowEl.className = 'dropdown-item-arrow';
            arrowEl.textContent = '▶';
            menuItem.appendChild(arrowEl);
        }

        // 绑定交互事件
        if (!item.disabled) {
            if (hasChildren) {
                this._bindSubmenuEvents(menuItem, item, index);
            }
            if (item.action && !hasChildren) {
                this._bindActionEvent(menuItem, item);
            }
            // 即使有子菜单，也可能有点击 action（极少情况）
            if (item.action && hasChildren) {
                // 如果有 action 同时有子菜单，点击触发 action，hover 触发子菜单
                this._bindActionEvent(menuItem, item);
            }
        }

        return menuItem;
    }

    /**
     * 绑定点击/悬停事件 - 用于普通菜单项
     */
    _bindActionEvent(menuItem, item) {
        if (this.options.trigger === 'hover') {
            menuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                this._executeAction(item);
            });
        } else {
            // click 模式
            menuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                this._executeAction(item);
            });
        }
    }

    /**
     * 绑定子菜单的 hover / click 事件
     */
    _bindSubmenuEvents(menuItem, item, index) {
        if (this.options.trigger === 'hover') {
            // hover 模式：鼠标进入时展开子菜单
            menuItem.addEventListener('mouseenter', () => {
                this._clearHoverTimer(index);
                const timer = setTimeout(() => {
                    this._openSubmenu(menuItem, item, index);
                }, this.options.submenuDelay);
                this.hoverTimers.set(`open_${index}`, timer);
            });

            menuItem.addEventListener('mouseleave', () => {
                this._clearHoverTimer(index);
                const timer = setTimeout(() => {
                    this._closeSubmenu(index);
                }, this.options.submenuCloseDelay);
                this.hoverTimers.set(`close_${index}`, timer);
            });
        } else {
            // click 模式：点击时展开子菜单
            menuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                // 如果已经有子菜单打开，则关闭
                if (this.submenus.has(index)) {
                    this._closeSubmenu(index);
                } else {
                    // 关闭其他同级子菜单
                    for (const [key, sub] of this.submenus) {
                        if (key !== index) {
                            sub.destroy();
                            this.submenus.delete(key);
                        }
                    }
                    this._openSubmenu(menuItem, item, index);
                }
            });

            // click 模式下也支持 hover 预览，但仅在已有子菜单打开时
            menuItem.addEventListener('mouseenter', () => {
                // 如果有其他子菜单已打开，切换到当前
                if (this.submenus.size > 0 && !this.submenus.has(index)) {
                    for (const [key, sub] of this.submenus) {
                        sub.destroy();
                        this.submenus.delete(key);
                    }
                    this._openSubmenu(menuItem, item, index);
                }
            });
        }
    }

    /**
     * 打开子菜单
     */
    _openSubmenu(menuItem, item, index) {
        // 如果已存在则跳过
        if (this.submenus.has(index)) return;

        const submenu = new DropdownMenu(item.children, {
            ...this.options,
            // 子菜单默认使用与父菜单相同的触发方式
        });

        const rect = menuItem.getBoundingClientRect();
        // 子菜单出现在父菜单项的右侧
        const x = rect.right + 4;
        const y = rect.top;

        submenu.show(x, y, this);
        this.submenus.set(index, submenu);
    }

    /**
     * 关闭指定子菜单
     */
    _closeSubmenu(index) {
        const submenu = this.submenus.get(index);
        if (submenu) {
            submenu.destroy();
            this.submenus.delete(index);
        }
    }

    /**
     * 清除 hover 计时器
     */
    _clearHoverTimer(index) {
        const openTimer = this.hoverTimers.get(`open_${index}`);
        const closeTimer = this.hoverTimers.get(`close_${index}`);
        if (openTimer) {
            clearTimeout(openTimer);
            this.hoverTimers.delete(`open_${index}`);
        }
        if (closeTimer) {
            clearTimeout(closeTimer);
            this.hoverTimers.delete(`close_${index}`);
        }
    }

    /**
     * 执行菜单项 action
     */
    _executeAction(item) {
        if (typeof item.action === 'function') {
            item.action(item);
        }
        if (this.options.closeOnSelect) {
            this.destroyAll();
        }
    }

    /**
     * 根据坐标调整菜单位置，防止溢出视口
     */
    _adjustPosition(x, y) {
        // 先设置初始位置，让浏览器计算尺寸
        this.menuEl.style.left = `${x}px`;
        this.menuEl.style.top = `${y}px`;
        this.menuEl.style.visibility = 'hidden';

        // 获取菜单尺寸
        const menuRect = this.menuEl.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let finalX = x;
        let finalY = y;

        // 右侧溢出 -> 向左偏移
        if (finalX + menuRect.width > viewportWidth - 8) {
            finalX = viewportWidth - menuRect.width - 8;
        }
        // 左侧溢出 -> 贴边
        if (finalX < 8) {
            finalX = 8;
        }

        // 下方溢出 -> 向上偏移
        if (finalY + menuRect.height > viewportHeight - 8) {
            finalY = viewportHeight - menuRect.height - 8;
        }
        // 上方溢出 -> 贴边
        if (finalY < 8) {
            finalY = 8;
        }

        this.menuEl.style.left = `${finalX}px`;
        this.menuEl.style.top = `${finalY}px`;
        this.menuEl.style.visibility = '';
    }

    /**
     * 键盘导航
     */
    _handleKeyDown(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            this.destroyAll();
        }
        // 可选扩展：方向键导航
    }
}

// ==================== 便捷方法：快速创建并显示菜单 ====================

/**
 * 快速显示下拉菜单
 * @param {Array} items - 菜单项配置
 * @param {number} x - X 坐标
 * @param {number} y - Y 坐标
 * @param {Object} options - 选项
 * @returns {DropdownMenu} 菜单实例
 */
function showDropdown(items, x, y, options = {}) {
    const menu = new DropdownMenu(items, options);
    menu.show(x, y);
    return menu;
}

export { DropdownMenu, showDropdown };
export default DropdownMenu;