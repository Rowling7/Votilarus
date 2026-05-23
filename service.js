const { Service } = require('node-windows');
const svc = new Service({
  name: 'PitayaService',
  description: 'Pitaya App Service',
  script: 'C:\\Software\\VSCodeFolder\\Votilarus\\app.js', // 项目入口文件
  env: { name: 'NODE_ENV', value: 'production' }
});
svc.on('install', () => {
  svc.start(); // 安装后自动启动
  console.log('服务安装并启动成功！');
});

const { EventLogger } = require('node-windows');
const logger = new EventLogger('MyApp');
svc.on('error', (err) => {
  logger.error('服务错误: ' + err.message);
});
svc.install();
