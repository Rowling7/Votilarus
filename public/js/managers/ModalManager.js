// ==================== 模态框统一管理器 ====================

import CalendarModal from '../modal/CalendarModal.js';
import NotebookEditModal from '../modal/NotebookEditModal.js';
import WeatherForecastModal from '../modal/WeatherForecastModal.js';

/**
 * ModalManager - 统一管理所有模态框的访问和生命周期
 */
class ModalManager {
    constructor() {
        // 初始化所有模态框实例
        this.calendarModal = CalendarModal;
        this.notebookEditModal = NotebookEditModal;
        this.weatherForecastModal = new WeatherForecastModal();
    }

    /**
     * 显示日历模态框
     */
    showCalendarModal() {
        this.calendarModal.open();
    }

    /**
     * 显示备忘录编辑模态框
     * @param {string} uuid - 备忘录 UUID
     */
    showNotebookModal(uuid) {
        this.notebookEditModal.open(uuid);
    }

    /**
     * 显示天气预报详情模态框
     * @param {string} cityPinyin - 城市拼音
     * @param {string} cityName - 城市名称
     * @param {string} themeColor - 主题颜色
     */
    async showWeatherForecastModal(cityPinyin, cityName, themeColor) {
        await this.weatherForecastModal.open(cityPinyin, cityName, themeColor);
    }

    /**
     * 关闭所有模态框
     */
    closeAll() {
        if (this.calendarModal._isOpen) {
            this.calendarModal.close();
        }
        if (this.notebookEditModal._isOpen) {
            this.notebookEditModal.close();
        }
        if (this.weatherForecastModal._isOpen) {
            this.weatherForecastModal.close();
        }
    }

    /**
     * 获取天气预报模态框实例（用于绑定城市切换回调）
     * @returns {WeatherForecastModal}
     */
    getWeatherForecastModal() {
        return this.weatherForecastModal;
    }
}

// 导出单例实例
export default new ModalManager();
