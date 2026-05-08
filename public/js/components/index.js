// ==================== Web Components 统一注册器 ====================

import NavIcon from './NavIcon.js';
import NavDock from './NavDock.js';
import SearchBox from './SearchBox.js';
import NavSidebar from './NavSidebar.js';
import SettingsModal from './SettingsModal.js';
import ConfirmModal from './ConfirmModal.js';

/**
 * 注册所有 Web Components
 */
export function registerAllComponents() {
    const components = [
        { name: 'nav-icon', class: NavIcon },
        { name: 'nav-dock', class: NavDock },
        { name: 'search-box', class: SearchBox },
        { name: 'nav-sidebar', class: NavSidebar },
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
    SettingsModal,
    ConfirmModal
};
