const categoriesRoute = require('./categories');
const itemsRoute = require('./items');
const layoutsRoute = require('./layouts');
const dockRoute = require('./dock');
const settingsRoute = require('./settings');

/**
 * 注册所有路由到 Express 应用
 * @param {Object} app - Express 应用实例
 * @param {Object} db - 数据库连接对象
 */
function registerRoutes(app, db) {
    // 设置所有路由的数据库连接
    categoriesRoute.setDatabase(db);
    itemsRoute.setDatabase(db);
    layoutsRoute.setDatabase(db);
    dockRoute.setDatabase(db);
    settingsRoute.setDatabase(db);

    // 注册路由
    app.use('/api/categories', categoriesRoute.router);
    app.use('/api/items', itemsRoute.router);
    app.use('/api/layout', layoutsRoute.router);
    app.use('/api/dock', dockRoute.router);
    app.use('/api/settings', settingsRoute.router);
    
    console.log('✅ 所有 API 路由已注册');
}

module.exports = registerRoutes;
