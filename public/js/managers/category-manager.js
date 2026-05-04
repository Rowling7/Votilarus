// ==================== 分类管理器 ====================

import { fetchCategories, fetchItems, fetchLayouts } from '../core/api.js';

class CategoryManager {
    constructor() {
        this.categories = [];
        this.items = {};
        this.layouts = {};
        this.currentCategory = null;
    }

    async init() {
        try {
            this.categories = await fetchCategories();
            if (this.categories.length > 0) {
                this.currentCategory = this.categories[0].uuid;
            }
            await this.loadAllItems();
        } catch (error) {
            // 处理错误
        }
    }

    async loadAllItems() {
        for (const category of this.categories) {
            try {
                const items = await fetchItems(category.uuid);
                this.items[category.uuid] = items;
                
                // 加载布局信息
                const layouts = await fetchLayouts();
                layouts.forEach(layout => {
                    this.layouts[layout.item_uuid] = layout;
                });
            } catch (error) {
                this.items[category.uuid] = [];
            }
        }
    }

    getCategories() {
        return this.categories;
    }

    getItems(categoryUuid) {
        return this.items[categoryUuid] || [];
    }

    getLayout(itemUuid) {
        return this.layouts[itemUuid];
    }

    getCurrentCategory() {
        return this.currentCategory;
    }

    setCurrentCategory(uuid) {
        this.currentCategory = uuid;
    }

    getCategoryName(uuid) {
        const category = this.categories.find(c => c.uuid == uuid);
        return category ? category.name : '';
    }
}

export default new CategoryManager();
