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
        console.log('📦 [CategoryManager] 开始加载所有图标');
        console.log('  - 分类数量:', this.categories.length);
        
        for (const category of this.categories) {
            console.log(`\n [CategoryManager] 加载分类: ${category.name} (uuid: ${category.uuid})`);
            try {
                const items = await fetchItems(category.uuid);
                console.log(`  - ✅ 获取到 ${items.length} 个图标`);
                if (items.length > 0) {
                    console.log(`  - 第一个图标:`, {
                        uuid: items[0].uuid,
                        a70Id: items[0].a70Id,
                        name: items[0].name
                    });
                }
                this.items[category.uuid] = items;
                
                // 加载布局信息
                const layouts = await fetchLayouts();
                layouts.forEach(layout => {
                    this.layouts[layout.item_uuid] = layout;
                });
            } catch (error) {
                console.error(`  - ❌ 加载失败:`, error);
                this.items[category.uuid] = [];
            }
        }
        
        console.log('\n📊 [CategoryManager] 加载完成，总览:');
        Object.keys(this.items).forEach(uuid => {
            const category = this.categories.find(c => c.uuid == uuid);
            console.log(`  - ${category ? category.name : uuid}: ${this.items[uuid].length} 个图标`);
        });
    }

    getCategories() {
        return this.categories;
    }

    getItems(categoryUuid) {
        console.log(`📦 [CategoryManager.getItems] 请求分类 ${categoryUuid} 的图标`);
        const items = this.items[categoryUuid] || [];
        console.log(`  - 返回 ${items.length} 个图标`);
        return items;
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
