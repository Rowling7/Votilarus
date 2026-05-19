/**
 * 时间工具类 - TimeUtils
 * 统一处理东八区（UTC+8）时间
 * 支持 CommonJS 和 ES6 模块导出
 */

class TimeUtils {
    /**
     * 获取当前东八区时间的 Date 对象
     * @returns {Date} 东八区时间的 Date 对象
     */
    static getBeijingTime() {
        const now = new Date();
        // 获取 UTC 时间戳
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        // 转换为东八区时间（UTC+8）
        return new Date(utc + (3600000 * 8));
    }

    /**
     * 将任意 Date 对象转换为东八区时间
     * @param {Date} date - 需要转换的日期对象
     * @returns {Date} 转换后的东八区时间 Date 对象
     */
    static toBeijingTime(date) {
        if (!(date instanceof Date)) {
            throw new Error('参数必须是 Date 对象');
        }
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        return new Date(utc + (3600000 * 8));
    }

    /**
     * 获取格式化的东八区时间字符串
     * @param {string} format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
     * @param {Date} date - 可选的日期对象，默认为当前时间
     * @returns {string} 格式化后的时间字符串
     */
    static formatBeijingTime(format = 'YYYY-MM-DD HH:mm:ss', date = null) {
        const beijingTime = date ? this.toBeijingTime(date) : this.getBeijingTime();

        const year = beijingTime.getFullYear();
        const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
        const day = String(beijingTime.getDate()).padStart(2, '0');
        const hours = String(beijingTime.getHours()).padStart(2, '0');
        const minutes = String(beijingTime.getMinutes()).padStart(2, '0');
        const seconds = String(beijingTime.getSeconds()).padStart(2, '0');
        const milliseconds = String(beijingTime.getMilliseconds()).padStart(3, '0');

        const replacements = {
            'YYYY': year,
            'MM': month,
            'DD': day,
            'HH': hours,
            'mm': minutes,
            'ss': seconds,
            'SSS': milliseconds,
            'YY': String(year).slice(-2)
        };

        let result = format;
        for (const [key, value] of Object.entries(replacements)) {
            result = result.replace(new RegExp(key, 'g'), value);
        }

        return result;
    }

    /**
     * 获取东八区时间的时间戳（毫秒）
     * @param {Date} date - 可选的日期对象，默认为当前时间
     * @returns {number} 时间戳（毫秒）
     */
    static getBeijingTimestamp(date = null) {
        const beijingTime = date ? this.toBeijingTime(date) : this.getBeijingTime();
        return beijingTime.getTime();
    }

    /**
     * 获取东八区的日期部分（YYYY-MM-DD）
     * @param {Date} date - 可选的日期对象，默认为当前时间
     * @returns {string} 日期字符串
     */
    static getBeijingDate(date = null) {
        return this.formatBeijingTime('YYYY-MM-DD', date);
    }

    /**
     * 获取东八区的时间部分（HH:mm:ss）
     * @param {Date} date - 可选的日期对象，默认为当前时间
     * @returns {string} 时间字符串
     */
    static getBeijingTimeOnly(date = null) {
        return this.formatBeijingTime('HH:mm:ss', date);
    }

    /**
     * 判断是否为同一天（基于东八区时间）
     * @param {Date} date1 - 第一个日期
     * @param {Date} date2 - 第二个日期，默认为当前时间
     * @returns {boolean} 是否为同一天
     */
    static isSameDay(date1, date2 = null) {
        const beijingDate1 = this.toBeijingTime(date1);
        const beijingDate2 = date2 ? this.toBeijingTime(date2) : this.getBeijingTime();

        return beijingDate1.getFullYear() === beijingDate2.getFullYear() &&
            beijingDate1.getMonth() === beijingDate2.getMonth() &&
            beijingDate1.getDate() === beijingDate2.getDate();
    }

    /**
     * 获取东八区时间的星期几
     * @param {Date} date - 可选的日期对象，默认为当前时间
     * @param {boolean} chinese - 是否返回中文，默认 false
     * @returns {string|number} 星期几（0-6 或 星期日-星期六）
     */
    static getBeijingWeekday(date = null, chinese = false) {
        const beijingTime = date ? this.toBeijingTime(date) : this.getBeijingTime();
        const day = beijingTime.getDay();

        if (chinese) {
            const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            return weekdays[day];
        }

        return day;
    }

    /**
     * 计算两个东八区时间之间的天数差
     * @param {Date} date1 - 第一个日期
     * @param {Date} date2 - 第二个日期，默认为当前时间
     * @returns {number} 天数差（date1 - date2）
     */
    static getDaysDifference(date1, date2 = null) {
        const beijingDate1 = this.toBeijingTime(date1);
        const beijingDate2 = date2 ? this.toBeijingTime(date2) : this.getBeijingTime();

        const timeDiff = beijingDate1.getTime() - beijingDate2.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    /**
     * 从时间戳创建东八区时间的 Date 对象
     * @param {number} timestamp - 时间戳（毫秒）
     * @returns {Date} 东八区时间的 Date 对象
     */
    static fromTimestamp(timestamp) {
        return new Date(timestamp);
    }

    /**
     * 解析日期字符串为东八区时间的 Date 对象
     * @param {string} dateString - 日期字符串（如 '2024-01-01' 或 '2024-01-01 12:00:00'）
     * @returns {Date} 东八区时间的 Date 对象
     */
    static parseBeijingDate(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error('无效的日期字符串');
        }
        return this.toBeijingTime(date);
    }
}

// ==================== 导出模块 ====================

// UMD (Universal Module Definition) 模式
// 同时支持 CommonJS、AMD 和浏览器全局变量
(function (root, factory) {
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        // CommonJS 环境（Node.js）
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD 环境（RequireJS）
        define([], factory);
    } else {
        // 浏览器环境 - 挂载到全局对象
        root.TimeUtils = factory();
    }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this), function () {
    return TimeUtils;
});
