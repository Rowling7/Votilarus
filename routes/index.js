const categoriesRoute = require('./category-routes');
const itemsRoute = require('./icon-routes');
const widgetsRoute = require('./widget-routes');
const layoutsRoute = require('./layout-routes');
const dockRoute = require('./dock-routes');
const settingsRoute = require('./settings-routes');
const searchEngineRoute = require('./search-engine-routes');
const holidayRoute = require('./holiday-routes');
const notebookRoute = require('./notebook-routes');
const weatherRoute = require('./weather-routes');
const cityRoute = require('./city-routes');
const hotpointRoute = require('./hotpoint-routes');
const worktimeRoute = require('./worktime-routes');
const compleaveRoute = require('./compleave-routes');
const yiyanRoute = require('./yiyan-routes');
const folderRoute = require('./folder-routes');

/**
 * 注册所有路由到 Express 应用
 * @param {Object} app - Express 应用实例
 * @param {Object} db - 数据库连接对象
 */
function registerRoutes(app, db) {
    // 设置所有路由的数据库连接
    categoriesRoute.setDatabase(db);
    itemsRoute.setDatabase(db);
    widgetsRoute.setDatabase(db);
    layoutsRoute.setDatabase(db);
    dockRoute.setDatabase(db);
    settingsRoute.setDatabase(db);
    searchEngineRoute.setDatabase(db);
    holidayRoute.setDatabase(db);
    notebookRoute.setDatabase(db);
    weatherRoute.setDatabase(db);
    cityRoute.setDatabase(db);
    hotpointRoute.setDatabase(db);
    worktimeRoute.setDatabase(db);
    compleaveRoute.setDatabase(db);
    yiyanRoute.setDatabase(db);
    folderRoute.setDatabase(db);

    // 注册路由
    app.use('/api/categories', categoriesRoute.router);
    app.use('/api/items', itemsRoute.router);
    app.use('/api/widgets', widgetsRoute.router);
    app.use('/api/layout', layoutsRoute.router);
    app.use('/api/dock', dockRoute.router);
    app.use('/api/settings', settingsRoute.router);
    app.use('/api/search-engines', searchEngineRoute.router);
    app.use('/api/holidays', holidayRoute.router);
    app.use('/api/notebook', notebookRoute.router);
    app.use('/api/weather', weatherRoute.router);
    app.use('/api/cities', cityRoute.router);
    app.use('/api/hotpoint', hotpointRoute.router);
    app.use('/api/worktime', worktimeRoute.router);
    app.use('/api/compleave', compleaveRoute.router);
    app.use('/api/yiyan', yiyanRoute.router);
    app.use('/api/folder', folderRoute.router);
}

module.exports = registerRoutes;
