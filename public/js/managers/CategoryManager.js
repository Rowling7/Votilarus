// ==================== 分类管理器 ====================

import { fetchCategories, fetchItems, fetchLayouts } from '../core/api-client.js';

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
            // 默认选中首页（-1），而不是第一个分类
            this.currentCategory = '-1';
            await this.loadAllItems();
        } catch (error) {
            // 处理错误
        }
    }

    async loadAllItems() {
        const startTime = performance.now();

        // 优化1：先一次性加载所有布局信息（只调用一次 API）
        try {
            const allLayouts = await fetchLayouts();
            allLayouts.forEach(layout => {
                this.layouts[layout.item_id] = layout;
            });
        } catch (error) {
        }

        // 优化2：并行加载所有分类的图标
        const loadPromises = this.categories.map(async (category) => {
            try {
                const items = await fetchItems(category.id);
                return { categoryId: category.id, items };
            } catch (error) {
                return { categoryId: category.id, items: [] };
            }
        });

        // 等待所有请求完成
        const results = await Promise.all(loadPromises);

        // 存储结果
        results.forEach(result => {
            this.items[result.categoryId] = result.items;
        });
    }

    /**
     * 重新加载单个分类的图标数据
     */
    async reloadCategoryItems(categoryUuid) {
        try {
            // 重新获取该分类的图标
            const items = await fetchItems(categoryUuid);
            this.items[categoryUuid] = items;

            // 重新获取布局信息
            const allLayouts = await fetchLayouts();
            allLayouts.forEach(layout => {
                this.layouts[layout.item_id] = layout;
            });

            return items;
        } catch (error) {
            console.error('重新加载分类数据失败:', error);
            throw error;
        }
    }

    getCategories() {
        return this.categories;
    }

    getItems(categoryUuid) {
        return this.items[categoryUuid] || [];
    }

    getLayout(itemId) {
        return this.layouts[itemId];
    }

    getCurrentCategory() {
        return this.currentCategory;
    }

    setCurrentCategory(uuid) {
        this.currentCategory = uuid;
    }

    getCategoryName(uuid) {
        const category = this.categories.find(c => c.id == uuid);
        return category ? category.category_name : '';
    }

    /**
     * 获取所有可切换的分类列表（包含首页）
     */
    getAllSwitchableCategories() {
        // 首页作为第一个分类
        const homeCategory = { id: '-1', category_name: '首页', category_code: 'home' };
        return [homeCategory, ...this.categories];
    }
}

export default new CategoryManager();
