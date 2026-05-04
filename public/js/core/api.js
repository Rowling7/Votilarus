// ==================== API 调用封装 ====================

const API_BASE = '/api';

export async function fetchCategories() {
    const response = await fetch(`${API_BASE}/categories`);
    if (!response.ok) {
        throw new Error('获取分类失败');
    }
    return await response.json();
}

export async function fetchItems(categoryUuid = null) {
    let url = `${API_BASE}/items`;
    // 使用 !== undefined 和 !== null 来判断，因为 uuid 可能是 0
    if (categoryUuid !== undefined && categoryUuid !== null) {
        url += `?category_uuid=${categoryUuid}`;
        console.log(`🌐 [API.fetchItems] 请求分类 ${categoryUuid} 的图标`);
    } else {
        console.log(' [API.fetchItems] 请求所有图标');
    }
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('获取图标失败');
    }
    const data = await response.json();
    console.log(`  - ✅ 接收到 ${data.length} 个图标`);
    return data;
}

export async function fetchLayouts(itemUuid = null) {
    let url = `${API_BASE}/layout`;
    if (itemUuid) {
        url += `?item_uuid=${itemUuid}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('获取布局失败');
    }
    return await response.json();
}

export async function fetchDockItems() {
    const response = await fetch(`${API_BASE}/dock`);
    if (!response.ok) {
        throw new Error('获取 Dock 项失败');
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
