const { fetchAndSaveCurrentWeather } = require('../routes/weather-routes');

// 默认城市列表（可以从配置文件或数据库读取）
const DEFAULT_CITIES = process.env.WEATHER_CITIES
    ? process.env.WEATHER_CITIES.split(',')
    : ['Weihai', 'Wuhan', 'Guiyang', 'Quanzhou', 'Qingdao', 'Yantai'];

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

        // 设置定时器：每6小时执行一次（6 * 60 * 60 * 1000 = 21600000 毫秒）
        this.intervalId = setInterval(() => {
            this.fetchAllCitiesWeather();
        }, 6 * 60 * 60 * 1000);

        this.isRunning = true;
        console.log('✅ 天气定时任务已启动（每6小时执行一次）');
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
            clearInterval(this.intervalId);
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
        console.log(`⏰ 下次执行时间: ${this.getNextRunTime()}\n`);

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
     * 计算下次执行时间
     */
    getNextRunTime() {
        const now = new Date();
        const nextRun = new Date(now.getTime() + 6 * 60 * 60 * 1000);
        return nextRun.toLocaleString('zh-CN');
    }

    /**
     * 延时函数
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = WeatherScheduler;
