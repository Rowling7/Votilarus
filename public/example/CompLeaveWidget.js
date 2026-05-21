// 调休组件 CompLeaveWidget
class CompLeaveWidget extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.currentPage = "display"; // 'display' 或 'settings'
  }

  getDefaultOptions() {
    return {
      ...super.getDefaultOptions(),
      widgetClass: "widget compleave-widget widget-row2Col2",
    };
  }

  init() {
    // 使用已存在的容器，不再创建新容器
    const container = document.getElementById(this.options.containerId);
    if (!container) {
      console.error(`容器 ${this.options.containerId} 未找到`);
      return;
    }
    this.currentPage = "display"; // 强制设置为显示页面
    // 渲染组件
    this.render();

    // 获取数据
    this.updateDisplay();
  }

  render() {
    this.container.innerHTML = `
      <div class="widget-content">
        ${this.currentPage === "display"
        ? this.renderDisplayPage()
        : this.renderSettingsPage()
      }
        <button class="compleave-flip-button" id="flipPageCompLeave">
          ${this.currentPage === "display" ? "设置" : "返回"}
        </button>
      </div>
    `;

    document.getElementById("flipPageCompLeave").addEventListener("click", () => {
      this.currentPage =
        this.currentPage === "display" ? "settings" : "display";
      this.render();

      // 当从设置页面返回显示页面时，重新加载数据
      if (this.currentPage === "display") {
        this.updateDisplay();
      }
    });

    if (this.currentPage === "settings") {
      document.getElementById("saveCompLeaveSettings").addEventListener("click", () => {
        this.saveSettings();
      });
    }
  }

  renderDisplayPage() {
    return `
    <div class="compleave-display compact-display">
      <div class="compleave-info-row">
        <div class="compleave-item">
          <div class="compleave-label small-label">总加班时间</div>
          <div class="compleave-value small-value" id="totalOvertime">--天 --时 --分</div>
        </div>
      </div>
      <div class="compleave-info-row">
        <div class="compleave-item">
          <div class="compleave-label small-label">已调休时间</div>
          <div class="compleave-value small-value" id="usedLeave">--天 --时 --分</div>
        </div>
      </div>
      <div class="compleave-info-row">
        <div class="compleave-item">
          <div class="compleave-label small-label">可调休时间</div>
          <div class="compleave-value small-value" id="availableLeave">--天 --时 --分</div>
        </div>
      </div>
    </div>
  `;
  }

  renderSettingsPage() {
    return `
    <div class="compleave-settings-form compact-form">
      <div class="settings-grid">
        <div class="settings-group">
          <label class="settings-label">小时</label>
          <input type="number" class="settings-input compact-input" id="compLeaveHours" min="0" value="0">
        </div>
        <div class="settings-group">
          <label class="settings-label">分钟</label>
          <input type="number" class="settings-input compact-input" id="compLeaveMinutes" min="0" max="59" value="0">
        </div>
        <div class="settings-group compleave-full-width">
          <label class="settings-label">类型</label>
          <div class="btn-group" role="group" id="compLeaveTypeButtons">
            <input type="radio" class="btn-check" name="compLeaveType" id="compLeaveType1" value="1" checked>
            <label class="btn btn-outline-primary" for="compLeaveType1">加班</label>

            <input type="radio" class="btn-check" name="compLeaveType" id="compLeaveType-1" value="-1">
            <label class="btn btn-outline-primary" for="compLeaveType-1">调休</label>
          </div>
        </div>
      </div>
      <button class="save-button compact-button" id="saveCompLeaveSettings">保存</button>
    </div>
  `;
  }

  saveSettings() {
    const hours = document.getElementById("compLeaveHours").value;
    const minutes = document.getElementById("compLeaveMinutes").value;
    const type = document.querySelector('input[name="compLeaveType"]:checked').value;

    // 验证输入
    if (hours < 0 || minutes < 0 || minutes >= 60) {
      window.ToastManager.error("请输入有效的时间", 1000);
      return;
    }

    // 发送到服务器
    fetch('/api/holiday/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        hours: parseInt(hours),
        minutes: parseInt(minutes),
        type: type
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          window.ToastManager.success("保存成功", 1000);
          // 重置表单
          document.getElementById("compLeaveHours").value = "0";
          document.getElementById("compLeaveMinutes").value = "0";
          // 重置类型选择为默认的加班选项
          document.getElementById("compLeaveType1").checked = true;

          // 保存后自动返回显示页面
          this.currentPage = "display";
          this.render();
          // 保存成功后刷新显示
          this.updateDisplay();
        } else {
          window.ToastManager.error(data.message || "保存失败", 1000);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        window.ToastManager.error("保存失败", 1000);
      });
  }

  // 更新显示页面
  updateDisplay() {
    // 只在显示页面更新
    if (this.currentPage !== "display") return;

    // 从服务器获取调休数据
    fetch('/api/holiday/list')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.calculateLeaveTimes(data.data);
        } else {
          window.ToastManager.error("获取调休数据失败", 1000);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        window.ToastManager.error("获取调休数据失败", 1000);
      });
  }

  calculateLeaveTimes(holidayData) {
    let totalOvertime = 0;  // type=1 的时间总和 (加班)
    let usedLeave = 0;      // type=-1 的时间总和 (已调休)

    holidayData.forEach(item => {
      const hours = parseInt(item.hours) || 0;
      const minutes = parseInt(item.minutes) || 0;
      const totalMinutes = hours * 60 + minutes;

      if (item.type == "1") {
        totalOvertime += totalMinutes;
      } else if (item.type == "-1") {
        usedLeave += totalMinutes;
      }
    });

    // 可调休时间 = 总加班时间 - 已调休时间
    const availableLeave = totalOvertime - usedLeave;

    // 格式化时间为 天 时 分 格式 (1天 = 8小时 = 480分钟)
    const formatTime = (totalMinutes) => {
      // 处理负数时间
      const isNegative = totalMinutes < 0;
      const absTotalMinutes = Math.abs(totalMinutes);

      const days = Math.floor(absTotalMinutes / 480);  // 1天 = 8小时 = 480分钟
      const remainingMinutes = absTotalMinutes % 480;
      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;

      // 应用符号
      const sign = isNegative ? "-" : "";

      return `${sign}${days}天 ${hours}时 ${minutes}分`;
    };

    // 安全更新DOM元素
    const safeUpdate = (id, content) => {
      const element = document.getElementById(id);
      if (element) element.textContent = content;
    };

    safeUpdate("totalOvertime", formatTime(totalOvertime));
    safeUpdate("usedLeave", formatTime(usedLeave));
    safeUpdate("availableLeave", formatTime(availableLeave));
  }
}

// 确保全局可以访问到 CompLeaveWidget
window.CompLeaveWidget = CompLeaveWidget;