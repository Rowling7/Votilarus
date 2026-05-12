/**
 * 农历转换工具
 * 使用 lunar-script.js 提供公历转农历的功能
 * 注意：lunar-script.js 已在 index.html 中作为全局脚本加载
 */

class LunarConverter {
    constructor() {
        // lunar-script.js 库已在全局作用域中可用
    }

    /**
     * 公历转农历
     * @param {number} y - 公历年份
     * @param {number} m - 公历月份（1-12）
     * @param {number} d - 公历日期
     * @returns {Object} 农历信息 {year, month, day}
     */
    solarToLunar(y, m, d) {
        try {
            // 从全局对象获取 Solar 和 Lunar
            const { Solar, Lunar } = window;

            // 创建公历对象
            const solar = Solar.fromYmd(y, m, d);
            // 转换为农历对象
            const lunar = solar.getLunar();

            // 获取农历月份名称（已包含闰月标识）
            const monthName = lunar.getMonthInChinese();
            // 获取农历日期名称
            const dayName = lunar.getDayInChinese();

            return {
                year: lunar.getYear(),
                month: monthName + '月',
                day: dayName
            };
        } catch (error) {
            console.error('农历转换失败:', error);
            // 返回默认值
            return {
                year: y,
                month: '未知',
                day: '未知'
            };
        }
    }

    /**
     * 获取格式化的农历字符串
     * @param {number} y - 公历年份
     * @param {number} m - 公历月份（1-12）
     * @param {number} d - 公历日期
     * @returns {string} 格式化后的农历字符串
     */
    getLunarString(y, m, d) {
        const lunar = this.solarToLunar(y, m, d);
        return `${lunar.month}${lunar.day}`;
    }
}

// 导出单例实例
export default new LunarConverter();
