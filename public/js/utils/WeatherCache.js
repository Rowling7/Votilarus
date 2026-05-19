// ==================== IndexedDB 缓存工具类 ====================

class WeatherCache {
    constructor() {
        this.dbName = 'VotilarusWeatherDB';
        this.storeName = 'weatherData';
        this.cacheDuration = 30 * 60 * 1000; // 30分钟（毫秒）
        this.db = null;
    }

    /**
     * 初始化数据库
     * @returns {Promise<IDBDatabase>} 数据库实例
     */
    async initDB() {
        if (this.db) {
            return this.db;
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => {
                console.error('IndexedDB 打开失败:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 创建对象存储空间，使用城市名作为主键
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'city' });
                    // 创建索引以便查询
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    /**
     * 保存天气数据到缓存
     * @param {string} city - 城市名称
     * @param {Object} weatherData - 天气数据
     * @returns {Promise<void>}
     */
    async saveWeatherData(city, weatherData) {
        try {
            const db = await this.initDB();

            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);

                const cacheEntry = {
                    city: city,
                    data: weatherData,
                    timestamp: Date.now(),
                    expiresAt: Date.now() + this.cacheDuration
                };

                const request = store.put(cacheEntry);

                request.onsuccess = () => {

                    resolve();
                };

                request.onerror = () => {
                    console.error('保存天气数据失败:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('保存天气数据异常:', error);
            throw error;
        }
    }

    /**
     * 从缓存获取天气数据
     * @param {string} city - 城市名称
     * @returns {Promise<Object|null>} 缓存的天气数据，如果不存在或已过期则返回 null
     */
    async getWeatherData(city) {
        try {
            const db = await this.initDB();

            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.get(city);

                request.onsuccess = () => {
                    const result = request.result;

                    if (!result) {

                        resolve(null);
                        return;
                    }

                    // 检查是否过期
                    if (Date.now() > result.expiresAt) {

                        // 删除过期数据
                        this.deleteWeatherData(city).catch(err => {
                            console.error('删除过期缓存失败:', err);
                        });
                        resolve(null);
                        return;
                    }


                    resolve(result.data);
                };

                request.onerror = () => {
                    console.error('获取缓存数据失败:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('获取缓存数据异常:', error);
            throw error;
        }
    }

    /**
     * 删除指定城市的缓存数据
     * @param {string} city - 城市名称
     * @returns {Promise<void>}
     */
    async deleteWeatherData(city) {
        try {
            const db = await this.initDB();

            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.delete(city);

                request.onsuccess = () => {

                    resolve();
                };

                request.onerror = () => {
                    console.error('删除缓存数据失败:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('删除缓存数据异常:', error);
            throw error;
        }
    }

    /**
     * 清除所有过期的缓存数据
     * @returns {Promise<void>}
     */
    async clearExpiredData() {
        try {
            const db = await this.initDB();

            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const index = store.index('timestamp');
                const request = index.openCursor();

                const now = Date.now();
                const keysToDelete = [];

                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        if (now > cursor.value.expiresAt) {
                            keysToDelete.push(cursor.value.city);
                        }
                        cursor.continue();
                    } else {
                        // 删除所有过期的数据
                        Promise.all(keysToDelete.map(key => this.deleteWeatherData(key)))
                            .then(() => {

                                resolve();
                            })
                            .catch(reject);
                    }
                };

                request.onerror = () => {
                    console.error('清理过期数据失败:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('清理过期数据异常:', error);
            throw error;
        }
    }

    /**
     * 清除所有缓存数据
     * @returns {Promise<void>}
     */
    async clearAllData() {
        try {
            const db = await this.initDB();

            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.clear();

                request.onsuccess = () => {

                    resolve();
                };

                request.onerror = () => {
                    console.error('清除所有缓存数据失败:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('清除所有缓存数据异常:', error);
            throw error;
        }
    }
}

// 导出单例实例
const weatherCache = new WeatherCache();
export default weatherCache;
