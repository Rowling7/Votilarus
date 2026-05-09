// ==================== API 调用封装 ====================

const API_BASE = '/api';

// 简单的内存缓存
const cache = new Map();
const CACHE_TTL = 5000; // 缓存有效期 5 秒

function getCacheKey(url) {
    return url;
}

function getCachedData(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    cache.delete(key);
    return null;
}

function setCacheData(key, data) {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
}

export async function fetchCategories() {
    const cacheKey = getCacheKey(`${API_BASE}/categories`);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const response = await fetch(`${API_BASE}/categories`);
    if (!response.ok) {
        throw new Error('获取分类失败');
    }
    const data = await response.json();
    setCacheData(cacheKey, data);
    return data;
}

export async function fetchItems(categoryUuid = null) {
    let url = `${API_BASE}/items`;
    // 使用 !== undefined 和 !== null 来判断，因为 uuid 可能是 0
    if (categoryUuid !== undefined && categoryUuid !== null) {
        url += `?category_uuid=${categoryUuid}`;
    }

    const cacheKey = getCacheKey(url);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('获取图标失败');
    }
    const data = await response.json();
    setCacheData(cacheKey, data);
    return data;
}

export async function fetchLayouts(itemId = null) {
    let url = `${API_BASE}/layout`;
    if (itemId) {
        url += `?item_id=${itemId}`;
    }

    const cacheKey = getCacheKey(url);
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('获取布局失败');
    }
    const data = await response.json();
    setCacheData(cacheKey, data);
    return data;
}

export async function fetchDockItems() {
    const response = await fetch(`${API_BASE}/dock`);
    if (!response.ok) {
        throw new Error('获取 Dock 项失败');
    }
    return await response.json();
}

// 添加图标到 Dock
export async function addToDock(itemId) {
    const response = await fetch(`${API_BASE}/dock`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item_id: itemId }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '添加到 Dock 失败');
    }
    return await response.json();
}

// 从 Dock 移除图标
export async function removeFromDock(itemId) {
    const response = await fetch(`${API_BASE}/dock/${itemId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('从 Dock 移除失败');
    }
    return await response.json();
}

// 更新 Dock 排序
export async function reorderDock(items) {
    const response = await fetch(`${API_BASE}/dock/reorder`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
    });
    if (!response.ok) {
        throw new Error('更新 Dock 排序失败');
    }
    return await response.json();
}

export async function fetchSettings() {
    const response = await fetch(`${API_BASE}/settings`);
    if (!response.ok) {
        throw new Error('获取设置失败');
    }
    return await response.json();
}

export async function updateSettings(settings) {
    const response = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
    });
    if (!response.ok) {
        throw new Error('更新设置失败');
    }
    return await response.json();
}

// 更新图标布局
export async function updateItemLayout(layoutData) {
    const response = await fetch(`${API_BASE}/items/layout`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(layoutData),
    });
    if (!response.ok) {
        throw new Error('更新图标布局失败');
    }
    return await response.json();
}

// 批量更新图标排序
export async function reorderItems(items) {
    const response = await fetch(`${API_BASE}/items/reorder`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
    });
    if (!response.ok) {
        throw new Error('更新图标排序失败');
    }
    return await response.json();
}

// 移动图标到另一个分类
export async function moveItemToCategory(itemId, newCategoryId) {
    const response = await fetch(`${API_BASE}/items/move`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item_id: itemId, new_category_id: newCategoryId }),
    });
    if (!response.ok) {
        throw new Error('移动图标失败');
    }
    return await response.json();
}

// 删除图标（软删除）
export async function deleteItem(itemId) {
    const response = await fetch(`${API_BASE}/items/${itemId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('删除图标失败');
    }
    return await response.json();
}

// 更新图标信息
export async function updateItem(itemId, data) {
    const response = await fetch(`${API_BASE}/items/${itemId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('更新图标失败');
    }
    return await response.json();
}

// 创建新图标
export async function createItem(itemData) {
    const response = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
    });
    if (!response.ok) {
        throw new Error('创建图标失败');
    }
    return await response.json();
}

// 创建小组件 - 已废弃，请使用新的 createWidget API
// export async function createWidget(widgetData) {
//     const response = await fetch(`${API_BASE}/items/widget`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(widgetData),
//     });
//     if (!response.ok) {
//         throw new Error('创建小组件失败');
//     }
//     return await response.json();
// }

// ==================== Widget API ====================

// 获取组件列表
export async function getWidgets(categoryId = null) {
    let url = `${API_BASE}/widgets`;
    if (categoryId !== null && categoryId !== undefined) {
        url += `?category_id=${categoryId}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('获取组件列表失败');
    }
    return await response.json();
}

// 创建组件
export async function createWidget(widgetData) {
    const response = await fetch(`${API_BASE}/widgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(widgetData),
    });
    if (!response.ok) {
        throw new Error('创建组件失败');
    }
    return await response.json();
}

// 更新组件布局（位置、尺寸）
export async function updateWidgetLayout(widgetId, layoutData) {
    const response = await fetch(`${API_BASE}/widgets/${widgetId}/layout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(layoutData),
    });
    if (!response.ok) {
        throw new Error('更新组件布局失败');
    }
    return await response.json();
}

// 批量更新组件排序
export async function reorderWidgets(updates) {
    const response = await fetch(`${API_BASE}/widgets/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets: updates }),
    });
    if (!response.ok) {
        throw new Error('更新组件排序失败');
    }
    return await response.json();
}

// 删除组件
export async function deleteWidget(widgetId) {
    const response = await fetch(`${API_BASE}/widgets/${widgetId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('删除组件失败');
    }
    return await response.json();
}

// 获取网格配置
export async function getGridConfig() {
    const response = await fetch(`${API_BASE}/layout/grid`);
    if (!response.ok) {
        throw new Error('获取网格配置失败');
    }
    return await response.json();
}

// 更新网格配置
export async function updateGridConfig(config) {
    const response = await fetch(`${API_BASE}/layout/grid`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
    });
    if (!response.ok) {
        throw new Error('更新网格配置失败');
    }
    return await response.json();
}

// 导出设置
export async function exportSettings() {
    const response = await fetch(`${API_BASE}/settings/export`);
    if (!response.ok) {
        throw new Error('导出设置失败');
    }
    return await response.json();
}

// 导入设置
export async function importSettings(settingsData) {
    const response = await fetch(`${API_BASE}/settings/import`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
    });
    if (!response.ok) {
        throw new Error('导入设置失败');
    }
    return await response.json();
}

// 恢复默认设置
export async function resetSettings() {
    const response = await fetch(`${API_BASE}/settings/reset`, {
        method: 'POST',
    });
    if (!response.ok) {
        throw new Error('恢复默认设置失败');
    }
    return await response.json();
}
