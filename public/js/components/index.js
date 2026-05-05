// ==================== Web Components 统一注册器 ====================

import NavIcon from './nav-icon.js';
import NavDock from './nav-dock.js';
import SearchBox from './search-box.js';
import NavSidebar from './nav-sidebar.js';
import NavWidget from './nav-widget.js';
import SettingsModal from './settings-modal.js';
import ConfirmModal from './confirm-modal.js';

/**
 * 注册所有 Web Components
 */
export function registerAllComponents() {
    const components = [
        { name: 'nav-icon', class: NavIcon },
        { name: 'nav-dock', class: NavDock },
        { name: 'search-box', class: SearchBox },
        { name: 'nav-sidebar', class: NavSidebar },
        { name: 'nav-widget', class: NavWidget },
        { name: 'settings-modal', class: SettingsModal },
        { name: 'confirm-modal', class: ConfirmModal }
    ];

    components.forEach(component => {
        if (!customElements.get(component.name)) {
            customElements.define(component.name, component.class);
        }
    });
}

/**
 * 按需注册单个组件
 */
export function registerComponent(name) {
    const componentMap = {
        'nav-icon': NavIcon,
        'nav-dock': NavDock,
        'search-box': SearchBox,
        'nav-sidebar': NavSidebar,
        'nav-widget': NavWidget,
        'settings-modal': SettingsModal,
        'confirm-modal': ConfirmModal
    };

    const ComponentClass = componentMap[name];
    
    if (ComponentClass && !customElements.get(name)) {
        customElements.define(name, ComponentClass);
        return true;
    }
    
    return false;
}

export {
    NavIcon,
    NavDock,
    SearchBox,
    NavSidebar,
    NavWidget,
    SettingsModal,
    ConfirmModal
};
