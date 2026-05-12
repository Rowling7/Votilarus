// Notebook组件
class NotebookWidget extends BaseWidget {
  getDefaultOptions() {
    return {
      ...super.getDefaultOptions(),
      widgetClass: "widget notebook-widget widget-row4Col2",
    };
  }

  init() {
    const container = document.getElementById(this.options.containerId);
    if (!container) {
      console.error(`容器 ${this.options.containerId} 未找到`);
      return;
    }

    // 渲染组件并获取数据
    this.render();
    this.fetchNotes();
  }

  render() {
    this.container.innerHTML = `
      <div class="notebook-container">
        <div class="notebook-header">
          <h6><i class="bi bi-journal-check"></i></h6>
          <div class="notebook-statistics-container" id="notebook-stat-important" style="cursor: pointer;">
            <div class="NSC-part"style="color:red;font-weight:bold;">Impt:</div>
            <div class="NSC-part" id="notebook-stat-cntImportant">0</div>
          </div>
          <div class="notebook-statistics-container" id="notebook-stat-urgent" style="cursor: pointer;">
            <div class="NSC-part"style="color:orange;font-weight:bold;">Urgent:</div>
            <div class="NSC-part" id="notebook-stat-cntUrgent">0</div>
          </div>
          <div class="notebook-statistics-container" id="notebook-stat-done" style="cursor: pointer;">
            <div class="NSC-part"style="color:green;font-weight:bold;">Done:</div>
            <div class="NSC-part" id="notebook-stat-cntIsdone">0</div>
          </div>
          <div class="notebook-statistics-container" id="notebook-stat-live" style="cursor: pointer;">
            <div class="NSC-part"style="font-weight:bold;">Live:</div>
            <div class="NSC-part" id="notebook-stat-cntLive">0</div>
          </div>
          <button class="notebook-refresh-btn" id="refreshBtn4note"><i class="bi bi-arrow-clockwise"></i></button>
        </div>
        <div class="notebook-content">
          <div class="notebook-list">
            <div class="loading">加载中...</div>
          </div>
        </div>
      </div>
    `;

    // 绑定刷新事件
    document.getElementById('refreshBtn4note').addEventListener('click', () => {
      window.ToastManager.success('数据已刷新', 800);
      this.fetchNotes();
      const allStats = this.container.querySelectorAll('.NSC-part');
      allStats.forEach(stat => {
        stat.style.borderBottom = '';
      });
    });

    // 添加鼠标滚轮事件监听器，防止滚动穿透
    this.addScrollPrevention();

    // 获取并显示统计信息
    this.fetchStatistics();

    // 绑定统计信息点击事件
    this.bindStatisticsClickEvents();
  }

  // 添加滚动阻止功能
  addScrollPrevention() {
    const notebookContent = this.container.querySelector('.notebook-content');
    if (notebookContent) {
      notebookContent.addEventListener('wheel', (event) => {
        // 阻止事件冒泡到页面级滚动
        event.stopPropagation();

        // 允许在notebook-content内部正常滚动
        const scrollTop = notebookContent.scrollTop;
        const scrollHeight = notebookContent.scrollHeight;
        const height = notebookContent.clientHeight;
        const delta = event.deltaY;

        // 只有在滚动到边界时才阻止默认行为，防止页面滚动
        if ((scrollTop === 0 && delta < 0) ||
          (Math.ceil(scrollTop + height) >= scrollHeight && delta > 0)) {
          event.preventDefault();
        }
      }, { passive: false });
    }
  }

  async fetchNotes() {
    try {
      const response = await fetch('/api/notebook/list');

      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        this.displayNotes(result.data);
      } else {
        this.showError('获取笔记列表失败');
      }
    } catch (error) {
      console.error('获取笔记列表出错:', error);
      this.showError('获取笔记列表失败');
    }
  }

  async fetchStatistics() {
    try {
      const response = await fetch('/api/notebook/statistics');

      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const stats = result.data[0];

        // 更新统计信息显示
        document.getElementById('notebook-stat-cntIsdone').textContent = stats.cntIsdone || 0;
        document.getElementById('notebook-stat-cntUrgent').textContent = stats.cntUrgent || 0;
        document.getElementById('notebook-stat-cntImportant').textContent = stats.cntImportant || 0;
        document.getElementById('notebook-stat-cntLive').textContent = stats.cntLive || 0;
      }
    } catch (error) {
      console.error('获取统计信息出错:', error);
      // 错误处理，保持默认值 "-"
    }
  }

  displayNotes(notes) {
    const contentElement = this.container.querySelector('.notebook-content');
    if (!contentElement) return;
  }

  showError(message) {
    const contentElement = this.container.querySelector('.notebook-content');
    if (contentElement) {
      contentElement.innerHTML = `
        <div class="notebook-list">
          <p style="color: red;">${message}</p>
        </div>
      `;
    }
  }


  // 绑定统计信息点击事件
  bindStatisticsClickEvents() {
    const doneStat = this.container.querySelector('#notebook-stat-done');
    const urgentStat = this.container.querySelector('#notebook-stat-urgent');
    const importantStat = this.container.querySelector('#notebook-stat-important');
    const liveStat = this.container.querySelector('#notebook-stat-live');

    if (doneStat) {
      doneStat.addEventListener('click', () => {
        this.fetchNotesWithParams({ isdel: '0', isdone: '1' });
        this.highlightStat(doneStat, 'Done');
      });
    }

    if (urgentStat) {
      urgentStat.addEventListener('click', () => {
        this.fetchNotesWithParams({ isdel: '0', urgent: '1' });
        this.highlightStat(urgentStat, 'Urgent');
      });
    }

    if (importantStat) {
      importantStat.addEventListener('click', () => {
        this.fetchNotesWithParams({ isdel: '0', important: '1' });
        this.highlightStat(importantStat, 'Important');
      });
    }

    if (liveStat) {
      liveStat.addEventListener('click', () => {
        this.fetchNotesWithParams({ isdel: '0' });
        this.highlightStat(liveStat, 'Live');
      });
    }
  }

  // 高亮统计信息并显示toast提示
  highlightStat(element, type) {
    // 移除其他元素的高亮
    const allStats = this.container.querySelectorAll('.NSC-part');
    allStats.forEach(stat => {
      // 只修改 bottom 边框，保持其他边框设置不变
      stat.style.borderBottom = '';
    });

    // 高亮当前元素内的 NSC-part 元素
    const nscParts = element.querySelectorAll('.NSC-part');
    nscParts.forEach(part => {
      // 只修改 bottom 边框，保持其他边框设置不变
      part.style.borderBottom = '2px solid rgba(121, 120, 120, 0.87)';
      part.style.fontWeight = 'bold';
    });

    // 显示toast提示
    window.ToastManager.show(`已调用到${type}`, 'info', 500);
  }

  // 带参数获取笔记列表
  async fetchNotesWithParams(params = {}) {
    try {
      // 构建查询参数
      const queryParams = new URLSearchParams({
        ...params
      }).toString();

      const url = `/api/notebook/list?${queryParams}`;
      const response = await fetch(url);

      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        this.displayNotes(result.data);
      } else {
        this.showError('获取笔记列表失败');
      }
    } catch (error) {
      console.error('获取笔记列表出错:', error);
      this.showError('获取笔记列表失败');
    }
  }

  displayNotes(notes) {
    const contentElement = this.container.querySelector('.notebook-content');
    if (!contentElement) return;

    if (!notes || notes.length === 0) {
      contentElement.innerHTML = `
        <div class="notebook-list">
          <p>暂无笔记</p>
        </div>
      `;
      return;
    }

    // 创建笔记列表
    const notesList = notes.map(note => {
      // 根据重要性和紧急性组合显示标签
      let tags = '';
      const isImportant = note.important === '1';
      const isUrgent = note.urgent === '1';
      const isTop = note.istop === '1';

      // isdone=1优先级最高
      if (note.isdone === '1') {
        // 任务已完成
        tags = '<span class="tag important-urgent"><i class="bi bi-check-circle-fill" style= "color: green;font-size: 1.2rem;"></i></span>';
      } else if (isImportant && isUrgent) {
        // 重要且紧急
        tags = '<span class="tag important-urgent"><i class="bi bi-exclamation-circle-fill" style= "color: #ff6b6b;font-size: 1.2rem;"></i></span>';
      } else if (isImportant && !isUrgent) {
        // 重要不紧急
        tags = '<span class="tag important-not-urgent"><i class="bi bi-exclamation-circle-fill" style= "color: #ffe66d;font-size: 1.2rem;"></i></span>';
      } else if (!isImportant && isUrgent) {
        // 不重要但紧急
        tags = '<span class="tag not-important-urgent"><i class="bi bi-exclamation-circle-fill" style= "color: #5dd686ff;font-size: 1.2rem;"></i></span>';
      } else if (!isImportant && !isUrgent) {
        // 不重要不紧急
        tags = '<span class="tag not-important-not-urgent"><i class="bi bi-exclamation-circle-fill" style= "color: #c7c7c7;font-size: 1.2rem;"></i></span>';
      }

      // 添加置顶标签（如果笔记被置顶且不是重要且紧急的情况）
      let topTag = '';
      if (isTop && !(isImportant && isUrgent)) {
        topTag = '<span class="tag top-tag" style="background-color: rgba(93, 214, 134, 0.2); border-radius: 4px; padding: 2px 6px;"><i class="bi bi-chevron-bar-up" style="color: rgba(93, 214, 134, 1);font-size: 1.2rem;"></i></span>';
      }

      // 如果是重要且紧急的笔记，使用红色置顶图标
      if (isImportant && isUrgent) {
        topTag = '<span class="tag top-tag" style="background-color: rgba(255, 107, 107, 0.2); border-radius: 4px; padding: 2px 6px;"><i class="bi bi-chevron-bar-up" style="color: #ff6b6b;font-size: 1.2rem;"></i></span>';
      }

      return `
        <div class="note-item" onclick="window.ModalManager.showNotebookModal('${note.uuid}')">
        <div class="note-item-container">
          <div class="note-title">
            ${tags}
            ${note.title || '无标题'}
          </div>
          <div class="note-meta">
            <span>Deadline: ${note.endtime || '未知'}</span>
          </div>
        </div>
        <div class="note-item-options">
         ${topTag}
        </div>
        </div>
      `;
    }).join('');

    contentElement.innerHTML = `
      <div class="notebook-list">
        ${notesList}
        <div class="end-of-list">------已到底啦------</div>
      </div>
    `;

    // 内容更新后重新绑定滚动事件
    this.addScrollPrevention();
  }

  showError(message) {
    const contentElement = this.container.querySelector('.notebook-content');
    if (contentElement) {
      contentElement.innerHTML = `
        <div class="notebook-list">
          <p style="color: red;">${message}</p>
        </div>
      `;
    }
  }

  // 实现BaseWidget的刷新接口
  refresh() {
    this.fetchNotes();
    this.fetchStatistics();
  }
}


// 确保全局可以访问到 NotebookWidget
window.NotebookWidget = NotebookWidget;