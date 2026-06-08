// ==================== Votilarus History Tracker Background Script ====================

// 服务器地址数组 - 用于自动检测可用地址（按优先级排序）
const SERVER_URLS = [
  'http://localhost:3000',
  'http://192.168.101.12:3000'
];

// 当前使用的服务器地址
let SERVER_URL = '';

// ==================== 工具函数 ====================

// 创建带超时的fetch请求
function fetchWithTimeout(url, options = {}) {
  const { timeout = 5000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  return fetch(url, {
    ...options,
    signal: controller.signal
  }).then((response) => {
    clearTimeout(id);
    return response;
  }).catch((error) => {
    clearTimeout(id);
    throw error;
  });
}

// 检测可用的服务器地址
async function detectServerAddress() {
  for (const url of SERVER_URLS) {
    try {
      console.log(`正在检测服务器地址: ${url}`);
      const response = await fetchWithTimeout(`${url}/api/ext-history/list?page=1&pageSize=1`, {
        method: 'GET',
        cache: 'no-cache',
        timeout: 2000
      });

      if (response.ok) {
        console.log(`服务器地址检测成功: ${url}`);
        SERVER_URL = url;
        return url;
      }
    } catch (error) {
      console.log(`服务器地址检测失败: ${url}`, error);
      continue;
    }
  }

  console.error('无法连接到任何服务器地址，使用默认地址:', SERVER_URLS[0]);
  SERVER_URL = SERVER_URLS[0];
  return SERVER_URL;
}

// 尝试切换到另一个服务器
async function trySwitchServer() {
  console.log('尝试切换服务器...');
  const currentIndex = SERVER_URLS.indexOf(SERVER_URL);
  if (currentIndex !== -1) {
    const nextIndex = (currentIndex + 1) % SERVER_URLS.length;
    const nextUrl = SERVER_URLS[nextIndex];

    console.log(`尝试切换到备用服务器: ${nextUrl}`);
    try {
      const response = await fetchWithTimeout(`${nextUrl}/api/ext-history/list?page=1&pageSize=1`, {
        method: 'GET',
        cache: 'no-cache',
        timeout: 2000
      });

      if (response.ok) {
        SERVER_URL = nextUrl;
        console.log('服务器已切换到:', SERVER_URL);
        return true;
      }
    } catch (error) {
      console.log('备用服务器连接失败，保持当前服务器:', error);
    }
  }
  return false;
}

// 格式化 Chrome 时间戳为本地日期时间字符串
function formatChromeTimestamp(timestamp) {
  // Chrome 历史记录的时间戳是微秒级，需要除以 1000 转换为毫秒
  const date = new Date(timestamp);
  return date.toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' }).replace('T', ' ');
}

// ==================== 核心同步逻辑 ====================

// 同步单个历史记录项
async function syncSingleHistoryItem(historyItem) {
  console.log('开始同步单个历史记录项:', historyItem.url);

  if (!SERVER_URL) {
    await detectServerAddress();
  }

  try {
    const historyData = {
      url: historyItem.url,
      title: historyItem.title,
      icon_path: null,
      last_visit_at: formatChromeTimestamp(historyItem.lastVisitTime)
    };

    console.log('准备发送历史记录数据到服务器:', historyData);

    const response = await fetchWithTimeout(`${SERVER_URL}/api/ext-history/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(historyData),
      timeout: 3000
    });

    if (!response.ok) {
      console.error('同步历史记录失败:', await response.text());
      await trySwitchServer();
    } else {
      const result = await response.json();
      console.log('历史记录同步成功:', result, 'URL:', historyItem.title);
    }
  } catch (error) {
    console.error('同步历史记录时发生错误:', error);
    await trySwitchServer();
  }
}

// 批量同步最近的历史记录
async function syncRecentHistory() {
  console.log('开始同步最近的历史记录...');

  if (!SERVER_URL) {
    await detectServerAddress();
  }

  try {
    // 获取最近30天的历史记录
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log('正在查询从', thirtyDaysAgo.toISOString(), '开始的历史记录');

    if (!chrome.history || !chrome.history.search) {
      console.error('chrome.history.search API 不可用');
      return { success: false, error: 'chrome.history.search API 不可用' };
    }

    const historyItems = await chrome.history.search({
      text: '',
      startTime: thirtyDaysAgo.getTime(),
      maxResults: 1000
    });

    console.log(`找到 ${historyItems.length} 条历史记录需要同步`);

    if (historyItems.length === 0) {
      return { success: true, count: 0, message: '没有找到需要同步的历史记录' };
    }

    let totalSynced = 0;
    let totalFailed = 0;
    const batchSize = 50;

    for (let i = 0; i < historyItems.length; i += batchSize) {
      const batch = historyItems.slice(i, i + batchSize);
      console.log(`处理第 ${Math.floor(i / batchSize) + 1} 批，包含 ${batch.length} 条记录`);

      // 构建批量数据
      const records = batch.map(item => ({
        url: item.url,
        title: item.title,
        icon_path: null,
        last_visit_at: formatChromeTimestamp(item.lastVisitTime)
      }));

      try {
        const response = await fetchWithTimeout(`${SERVER_URL}/api/ext-history/batch-add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ records }),
          timeout: 5000
        });

        if (!response.ok) {
          console.error(`第 ${Math.floor(i / batchSize) + 1} 批同步失败:`, await response.text());
          const switched = await trySwitchServer();
          if (switched) {
            // 重试
            const retryResponse = await fetchWithTimeout(`${SERVER_URL}/api/ext-history/batch-add`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ records }),
              timeout: 5000
            });

            if (retryResponse.ok) {
              const retryResult = await retryResponse.json();
              console.log(`重试第 ${Math.floor(i / batchSize) + 1} 批成功:`, retryResult);
              totalSynced += retryResult.successCount || batch.length;
              totalFailed += retryResult.errorCount || 0;
            } else {
              totalFailed += batch.length;
            }
          } else {
            totalFailed += batch.length;
          }
        } else {
          const result = await response.json();
          console.log(`第 ${Math.floor(i / batchSize) + 1} 批同步成功:`, result);
          totalSynced += result.successCount || batch.length;
          totalFailed += result.errorCount || 0;
        }
      } catch (error) {
        console.error(`第 ${Math.floor(i / batchSize) + 1} 批发送时发生错误:`, error);
        totalFailed += batch.length;
        await trySwitchServer();
      }
    }

    // 更新最后同步时间
    const now = new Date().toISOString();
    chrome.storage.local.set({ lastSync: now });

    console.log('历史记录同步完成');
    return {
      success: true,
      count: totalSynced,
      failed: totalFailed,
      total: historyItems.length,
      message: `成功同步 ${totalSynced} 条历史记录，失败 ${totalFailed} 条`
    };
  } catch (error) {
    console.error('同步最近历史记录时发生错误:', error);
    await trySwitchServer();
    return { success: false, error: error.message };
  }
}

// ==================== 初始化 ====================

// 扩展安装时初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('Votilarus History Tracker installed');

  detectServerAddress().then((url) => {
    console.log('最终设置的服务器地址:', url);
  });

  // 设置定时任务：延迟1分钟开始，每20分钟同步一次
  chrome.alarms.create('syncHistory', {
    delayInMinutes: 1,
    periodInMinutes: 20
  });

  console.log('定时同步任务已设置');
});

// ==================== 事件监听 ====================

// 监听历史记录变化
if (chrome.history && chrome.history.onVisited) {
  chrome.history.onVisited.addListener((historyItem) => {
    console.log('检测到新的浏览历史:', historyItem.title);
    syncSingleHistoryItem(historyItem);
  });
}

// 监听定时任务
if (chrome.alarms && chrome.alarms.onAlarm) {
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'syncHistory') {
      console.log('定时任务触发，开始同步历史记录');
      syncRecentHistory();
    }
  });
}

// 监听来自弹窗的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到弹窗消息:', request);

  if (request.action === 'syncNow') {
    console.log('收到立即同步请求');
    syncRecentHistory().then((result) => {
      console.log('立即同步请求处理完成', result);
      sendResponse({ status: 'sync completed', result: result });
    }).catch(error => {
      console.error('立即同步过程中发生错误:', error);
      sendResponse({ status: 'sync failed', error: error.message });
    });
    return true;
  }

  if (request.action === 'getStatus') {
    chrome.storage.local.get(['lastSync'], (result) => {
      sendResponse({
        status: 'active',
        lastSync: result.lastSync || 'never',
        serverUrl: SERVER_URL
      });
    });
    return true;
  }

  if (request.action === 'detectServer') {
    detectServerAddress().then(url => {
      sendResponse({
        status: 'server detection completed',
        serverUrl: SERVER_URL
      });
    }).catch(error => {
      sendResponse({
        status: 'server detection failed',
        error: error.message,
        serverUrl: SERVER_URL
      });
    });
    return true;
  }

  if (request.action === 'switchServer') {
    if (SERVER_URLS.includes(request.serverUrl)) {
      SERVER_URL = request.serverUrl;
      sendResponse({
        status: 'switch completed',
        serverUrl: SERVER_URL
      });
    } else {
      sendResponse({
        status: 'switch failed',
        error: '无效的服务器地址',
        serverUrl: SERVER_URL
      });
    }
    return true;
  }
});

console.log('Votilarus History Tracker 后台脚本已加载');