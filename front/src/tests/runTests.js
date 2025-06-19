/**
 * 前端API集成测试运行器
 * 该文件用于手动运行API集成测试
 */

const { manualTest } = require('./api.test');

// 执行测试
console.log('================================================');
console.log('开始执行前端API集成测试...');
console.log('确保后端服务已启动在 http://localhost:3000');
console.log('================================================\n');

// 运行手动测试
manualTest()
  .then(() => {
    console.log('\n测试完成!');
  })
  .catch((error) => {
    console.error('\n测试失败:', error);
    process.exit(1);
  });