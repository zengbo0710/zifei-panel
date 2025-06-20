// 测试新创建的函数
const { getOpportunitiesBySymbol, getOpportunitiesByPair } = require('./services/arbitrageService');

// 测试 getOpportunitiesBySymbol 函数
console.log('\n==== 测试 getOpportunitiesBySymbol 函数 ====');
const symbolTest = 'BTC/USDT:USDT'; // 测试常见交易对
const symbolResult = getOpportunitiesBySymbol(symbolTest);

console.log(`交易对 "${symbolTest}" 套利机会数量: ${symbolResult.data?.count || 0}`);
console.log('函数返回结构:', JSON.stringify(symbolResult, null, 2).substring(0, 300) + '...');
console.log('成功状态:', symbolResult.success);

// 测试 getOpportunitiesByPair 函数
console.log('\n==== 测试 getOpportunitiesByPair 函数 ====');
const pairTest = 'BINANCE-OKX'; // 测试常见交易所对
const pairResult = getOpportunitiesByPair(pairTest);

console.log(`交易所对 "${pairTest}" 套利机会数量: ${pairResult.data?.count || 0}`);
console.log('函数返回结构:', JSON.stringify(pairResult, null, 2).substring(0, 300) + '...');
console.log('成功状态:', pairResult.success);

// 测试错误处理
console.log('\n==== 测试错误处理 ====');
const emptySymbolResult = getOpportunitiesBySymbol('');
console.log('空交易对参数处理:', emptySymbolResult.success ? '成功' : '失败', emptySymbolResult.error || '');

const emptyPairResult = getOpportunitiesByPair('');
console.log('空交易所对参数处理:', emptyPairResult.success ? '成功' : '失败', emptyPairResult.error || '');

console.log('\n==== 测试大小写不敏感性 ====');
const lowerSymbolResult = getOpportunitiesBySymbol('btc/usdt:usdt');
console.log(`小写交易对 "btc/usdt:usdt" 套利机会数量: ${lowerSymbolResult.data?.count || 0}`);

const mixedPairResult = getOpportunitiesByPair('binance-OKX');
console.log(`混合大小写交易所对 "binance-OKX" 套利机会数量: ${mixedPairResult.data?.count || 0}`);