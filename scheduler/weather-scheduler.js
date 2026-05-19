const { fetchAndSaveCurrentWeather } = require('../routes/weather-routes');

// 默认城市列表（可以从配置文件或数据库读取）
const DEFAULT_CITIES = process.env.WEATHER_CITIES
    ? process.env.WEATHER_CITIES.split(',')
    : ['Weihai'];
//: ['Weihai', 'Wuhan', 'Guiyang', 'Quanzhou', 'Qingdao', 'Yantai'];

/**
 * 定时任务：每6小时自动获取天气数据
 * 在每天的 0:00, 6:00, 12:00, 18:00 执行
 */
class WeatherScheduler {
    constructor(db) {
        this.db = db;
        this.isRunning = false;
        this.intervalId = null;
    }

    /**
     * 启动定时任务
     */
    start() {
        if (this.isRunning) {
            console.log('⚠️  天气定时任务已在运行');
            return;
        }

        console.log('🕒 启动天气数据自动更新定时任务...');

        // 立即执行一次
        this.fetchAllCitiesWeather();

        // 设置定时器：在每天的 0:00, 6:00, 12:00, 18:00 执行
        this.scheduleNextExecution();

        this.isRunning = true;
        console.log('✅ 天气定时任务已启动（每天 0:00, 6:00, 12:00, 18:00 执行）');
    }

    /**
     * 停止定时任务
     */
    stop() {
        if (!this.isRunning) {
            console.log('⚠️  天气定时任务未运行');
            return;
        }

        if (this.intervalId) {
            clearTimeout(this.intervalId);
            this.intervalId = null;
        }

        this.isRunning = false;
        console.log('🛑 天气定时任务已停止');
    }

    /**
     * 获取所有城市的天气数据
     */
    async fetchAllCitiesWeather() {
        console.log(`\n🌤️  开始批量获取天气数据 (${new Date().toLocaleString('zh-CN')})`);
        console.log(`📍 城市列表: ${DEFAULT_CITIES.join(', ')}`);

        const results = [];

        for (const city of DEFAULT_CITIES) {
            try {
                console.log(`\n🔄 正在获取 ${city} 的天气数据...`);

                const result = await fetchAndSaveCurrentWeather(city);

                results.push({
                    city: city,
                    success: true,
                    temperature: result.data.main.temp,
                    weather: result.data.weather[0].description
                });

                console.log(`✅ ${city}: ${result.data.main.temp}°C, ${result.data.weather[0].description}`);

                // 避免请求过快，间隔1秒
                await this.sleep(1000);

            } catch (error) {
                console.error(`❌ ${city} 获取失败:`, error.message);

                results.push({
                    city: city,
                    success: false,
                    error: error.message
                });
            }
        }

        // 输出统计信息
        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;

        console.log(`\n📊 批量获取完成:`);
        console.log(`   成功: ${successCount} 个城市`);
        console.log(`   失败: ${failCount} 个城市`);
        console.log(`⏰ 下次执行时间将在定时任务中自动安排\n`);

        return results;
    }

    /**
     * 手动触发一次更新
     */
    async triggerManualUpdate() {
        console.log('🔧 手动触发天气数据更新...');
        return await this.fetchAllCitiesWeather();
    }

    /**
     * 安排下一次执行时间
     */
    scheduleNextExecution() {
        const now = new Date();
        const currentHour = now.getHours();

        // 确定下一个执行时间点（0, 6, 12, 18）
        let nextHour;
        if (currentHour < 0) nextHour = 0;
        else if (currentHour < 6) nextHour = 6;
        else if (currentHour < 12) nextHour = 12;
        else if (currentHour < 18) nextHour = 18;
        else nextHour = 24; // 第二天0点

        // 如果nextHour是24，表示第二天0点
        const nextRun = new Date(now);
        if (nextHour === 24) {
            nextRun.setDate(nextRun.getDate() + 1);
            nextRun.setHours(0, 0, 0, 0);
        } else {
            nextRun.setHours(nextHour, 0, 0, 0);
        }

        const delay = nextRun.getTime() - now.getTime();

        console.log(`⏰ 下次执行时间: ${nextRun.toLocaleString('zh-CN')} (${Math.round(delay / 1000 / 60)}分钟后)`);

        this.intervalId = setTimeout(() => {
            this.fetchAllCitiesWeather();
            this.scheduleNextExecution(); // 递归安排下一次执行
        }, delay);
    }

    /**
     * 延时函数
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = WeatherScheduler;
