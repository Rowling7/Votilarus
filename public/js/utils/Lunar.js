/**
 * 农历转换工具
 * 提供公历转农历的功能
 */

class LunarConverter {
    constructor() {
        // 农历数据表 (1900-2100年)
        this.lunarInfo = [
            0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
            0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
            0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
            0x06566, 0x0d4a0, 0x0ea50, 0x16a95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
            0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
            0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
            0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
            0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
            0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
            0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
            0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
            0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
            0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
            0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
            0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
            0x14b63
        ];

        // 农历月份名称
        this.lunarMonthName = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];

        // 农历日期名称
        this.lunarDayName = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
            '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
            '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
    }

    /**
     * 获取闰月月份
     * @param {number} y - 年份
     * @returns {number} 闰月月份（0表示无闰月）
     */
    leapMonth(y) {
        return this.lunarInfo[y - 1900] & 0xf;
    }

    /**
     * 获取闰月天数
     * @param {number} y - 年份
     * @returns {number} 闰月天数（0表示无闰月）
     */
    leapDays(y) {
        if (this.leapMonth(y)) {
            return (this.lunarInfo[y - 1900] & 0x10000) ? 30 : 29;
        }
        return 0;
    }

    /**
     * 获取农历月份天数
     * @param {number} y - 年份
     * @param {number} m - 月份（0-11）
     * @returns {number} 月份天数
     */
    monthDays(y, m) {
        return (this.lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29;
    }

    /**
     * 获取农历年总天数
     * @param {number} y - 年份
     * @returns {number} 年总天数
     */
    lunarYearDays(y) {
        let sum = 348;
        for (let i = 0x8000; i > 0x8; i >>= 1) {
            sum += (this.lunarInfo[y - 1900] & i) ? 1 : 0;
        }
        return sum + this.leapDays(y);
    }

    /**
     * 公历转农历
     * @param {number} y - 公历年份
     * @param {number} m - 公历月份（1-12）
     * @param {number} d - 公历日期
     * @returns {Object} 农历信息 {year, month, day}
     */
    solarToLunar(y, m, d) {
        // 基准日期：1900-01-31 农历 1900-01-01
        const baseDate = new Date(1900, 0, 31);
        const targetDate = new Date(y, m - 1, d);
        let offset = Math.floor((targetDate - baseDate) / 86400000);

        let lunarY = 1900;
        let temp = 0;
        for (let i = 1900; i < 2100; i++) {
            temp = this.lunarYearDays(i);
            if (offset < temp) break;
            offset -= temp;
            lunarY = i;
        }

        const leap = this.leapMonth(lunarY);
        let isLeap = false;
        let lunarM = 1;

        for (let i = 0; i < 13; i++) {
            if (leap > 0 && i === leap && !isLeap) {
                --i;
                isLeap = true;
                temp = this.leapDays(lunarY);
            } else {
                temp = this.monthDays(lunarY, i);
            }

            if (isLeap && i === leap + 1) isLeap = false;

            offset -= temp;
            if (offset < 0) {
                offset += temp;
                lunarM = i + 1;
                break;
            }
        }

        const lunarD = offset + 1;

        return {
            year: lunarY,
            month: (isLeap ? '闰' : '') + this.lunarMonthName[lunarM - 1] + '月',
            day: this.lunarDayName[lunarD - 1]
        };
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
