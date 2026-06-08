// ==================== Votilarus History Tracker Popup Script ====================

document.addEventListener('DOMContentLoaded', function() {
  const syncBtn = document.getElementById('syncBtn');
  const viewHistoryBtn = document.getElementById('viewHistoryBtn');
  const statusDiv = document.getElementById('status');
  const lastSyncDiv = document.getElementById('lastSync');
  const serverLocalhostBtn = document.getElementById('serverLocalhost');
  const serverLanBtn = document.getElementById('serverLan');

  // 格式化时间
  function formatDateTime(dateString) {
    if (!dateString || dateString === 'never') {
      return dateString;
    }

    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (e) {
      return dateString;
    }
  }

  // 更新服务器按钮状态
  function updateServerButtonState(currentServerUrl) {
    serverLocalhostBtn.classList.remove('active');
    serverLanBtn.classList.remove('active');

    if (currentServerUrl === 'http://localhost:3000') {
      serverLocalhostBtn.classList.add('active');
    } else if (currentServerUrl === 'http://192.168.101.12:3000') {
      serverLanBtn.classList.add('active');
    }
  }

  // 获取并显示扩展状态
  function getStatus() {
    chrome.runtime.sendMessage({ action: 'getStatus' }, function(response) {
      if (chrome.runtime.lastError) {
        statusDiv.textContent = '状态获取失败: ' + chrome.runtime.lastError.message;
        statusDiv.className = 'status inactive';
        return;
      }

      if (response) {
        if (response.status === 'active') {
          statusDiv.textContent = '✓ 状态: 活跃';
          statusDiv.className = 'status active';
        } else {
          statusDiv.textContent = '✗ 状态: 未活跃';
          statusDiv.className = 'status inactive';
        }

        let syncText = '';
        if (response.lastSync && response.lastSync !== 'never') {
          syncText = `最后同步: ${formatDateTime(response.lastSync)}`;
        } else {
          syncText = '最后同步: 从未同步';
        }

        if (response.serverUrl) {
          syncText += `\n服务器: ${response.serverUrl}`;
          updateServerButtonState(response.serverUrl);
        }

        lastSyncDiv.textContent = syncText;
      } else {
        statusDiv.textContent = '✗ 状态: 未知';
        statusDiv.className = 'status inactive';
      }
    });
  }

  // 检测服务器地址
  function detectServerAddress() {
    statusDiv.textContent = '正在检测服务器地址...';
    statusDiv.className = 'status info';

    chrome.runtime.sendMessage({ action: 'detectServer' }, function(response) {
      if (chrome.runtime.lastError) {
        console.error('检测服务器地址时出错:', chrome.runtime.lastError);
      }

      setTimeout(getStatus, 500);
    });
  }

  // 切换服务器
  function switchServer(serverUrl) {
    statusDiv.textContent = `正在切换到: ${serverUrl}`;
    statusDiv.className = 'status info';

    chrome.runtime.sendMessage({ action: 'switchServer', serverUrl: serverUrl }, function(response) {
      if (chrome.runtime.lastError) {
        statusDiv.textContent = '切换服务器失败: ' + chrome.runtime.lastError.message;
        statusDiv.className = 'status inactive';
        return;
      }

      if (response && response.status === 'switch completed') {
        statusDiv.textContent = `✓ 服务器已切换到: ${response.serverUrl}`;
        statusDiv.className = 'status active';
        updateServerButtonState(response.serverUrl);
      } else {
        statusDiv.textContent = '切换服务器失败: ' + (response.error || '未知错误');
        statusDiv.className = 'status inactive';
      }
    });
  }

  // 初始化：检测服务器地址
  detectServerAddress();

  // 服务器选择按钮事件
  serverLocalhostBtn.addEventListener('click', function() {
    switchServer('http://localhost:3000');
  });

  serverLanBtn.addEventListener('click', function() {
    switchServer('http://192.168.101.12:3000');
  });

  // 立即同步
  syncBtn.addEventListener('click', function() {
    syncBtn.textContent = '⏳ 同步中...';
    syncBtn.disabled = true;
    statusDiv.textContent = '正在同步历史记录...';
    statusDiv.className = 'status info';

    const startTime = new Date();

    chrome.runtime.sendMessage({ action: 'syncNow' }, function(response) {
      const endTime = new Date();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      if (chrome.runtime.lastError) {
        statusDiv.textContent = '同步失败: ' + chrome.runtime.lastError.message;
        statusDiv.className = 'status inactive';
        syncBtn.textContent = '⟳ 立即同步';
        syncBtn.disabled = false;
        return;
      }

      if (response && response.status === 'sync completed' && response.result) {
        const result = response.result;
        if (result.success) {
          const count = result.count || 0;
          const failed = result.failed || 0;
          statusDiv.textContent = `✓ 同步成功! 用时 ${duration}秒 | 成功 ${count} 条，失败 ${failed} 条`;
          statusDiv.className = 'status active';
          syncBtn.className = 'btn success';
          syncBtn.textContent = '✓ 同步成功';

          // 更新状态
          getStatus();
        } else {
          statusDiv.textContent = `✗ 同步失败: ${result.error || '未知错误'}`;
          statusDiv.className = 'status inactive';
          syncBtn.textContent = '⟳ 立即同步';
          syncBtn.disabled = false;
        }
      } else {
        statusDiv.textContent = `同步已开始 | 用时 ${duration}秒`;
        statusDiv.className = 'status active';
        syncBtn.className = 'btn success';
        syncBtn.textContent = '✓ 同步完成';
      }

      // 3秒后恢复按钮状态
      setTimeout(() => {
        syncBtn.textContent = '⟳ 立即同步';
        syncBtn.className = 'btn';
        syncBtn.disabled = false;
      }, 3000);
    });
  });

  // 查看历史记录
  viewHistoryBtn.addEventListener('click', function() {
    chrome.runtime.sendMessage({ action: 'getStatus' }, function(response) {
      let serverUrl = 'http://localhost:3000';
      if (response && response.serverUrl) {
        serverUrl = response.serverUrl;
      }
      window.open(`${serverUrl}/api/ext-history/list?page=1&pageSize=50`, '_blank');
    });
  });
});