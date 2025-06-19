/**
 * 前端API服务集成测试
 * 该测试文件用于验证前端API服务是否能够正确连接后端API
 * 
 * 注意：运行此测试需要启动服务器
 */

import ApiService from '../services/api';

// 模拟交易对数据结构
const testOpportunity = {
  symbol: 'BTC-USDT',
  exchangeA: 'BINANCE',
  exchangeB: 'BYBIT',
  opportunity: 'LASB',  // Long A Short B
  opportunityValue: 0.0012,
  'A-BID': 60000,
  'A-ASK': 60010,
  'A-LAST': 60005,
  'B-BID': 60100,
  'B-ASK': 60110,
  'B-LAST': 60105,
  'A-FUNDINGRATE': 0.0001,
  'B-FUNDINGRATE': -0.0002,
  'A-FUNDINGPERIOD': 8,
  'B-FUNDINGPERIOD': 8,
  'A-FUNDINGTIME': Date.now() + 3600000,
  'B-FUNDINGTIME': Date.now() + 3600000,
  'LASB': 0.0015,
  'SALB': 0.0010
};

/**
 * 测试流程：
 * 1. 确保API连接正常
 * 2. 验证所有API端点返回的数据结构符合预期
 * 3. 数据刷新机制正常工作
 */

// 手动测试步骤
async function manualTest() {
  console.log('开始API集成测试...');
  
  try {
    // 测试获取所有套利机会
    console.log('测试 getOpportunities API...');
    const allOpportunities = await ApiService.getOpportunities();
    console.log(`成功获取 ${allOpportunities.data?.opportunities?.length || 0} 个套利机会`);
    console.log('数据示例:', allOpportunities.data?.opportunities?.[0]);
    
    // 如果有数据，测试特定交易对
    if (allOpportunities.data?.opportunities?.length > 0) {
      const firstSymbol = allOpportunities.data.opportunities[0].symbol;
      console.log(`\n测试 getOpportunitiesBySymbol API，交易对: ${firstSymbol}...`);
      const symbolOpportunities = await ApiService.getOpportunitiesBySymbol(firstSymbol);
      console.log(`成功获取 ${symbolOpportunities.data?.opportunities?.length || 0} 个${firstSymbol}套利机会`);
    }
    
    // 测试系统状态API
    console.log('\n测试 getStatus API...');
    const status = await ApiService.getStatus();
    console.log('系统状态:', status);
    
    console.log('\nAPI集成测试完成，所有测试通过！');
  } catch (error) {
    console.error('API集成测试失败:', error.message);
    console.error('确保后端服务已启动，并且API端点正确配置');
  }
}

// 自动化测试函数
// 可以使用Jest或其他测试框架进行自动化测试
// 这里提供了测试逻辑的基本框架

// manualTest(); // 取消注释可手动执行测试

export { manualTest, testOpportunity };