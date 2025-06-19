/**
 * 资金费率套利利润排序逻辑测试
 * 
 * 这个测试文件用于验证资金费率套利利润排序逻辑的正确性，
 * 使用真实数据模拟前端的排序实现。
 */

// 模拟数据集
const testData = [
  {
    symbol: "SNT/USDT:USDT",
    "A-FUNDINGRATE": -0.00332567,
    "B-FUNDINGRATE": -0.005438,
    "A-FUNDINGPERIOD": 4,
    "B-FUNDINGPERIOD": 4
    // 资金费率差值: |-0.00332567 - (-0.005438)| = |0.00211233| = 0.00211233 (0.211233%)
  },
  {
    symbol: "RESOLV/USDT:USDT",
    "A-FUNDINGRATE": 0.00005,
    "B-FUNDINGRATE": 0.0000099801208721,
    "A-FUNDINGPERIOD": 4,
    "B-FUNDINGPERIOD": 4
    // 资金费率差值: |0.00005 - 0.0000099801208721| = |0.0000400198791279| = 0.0000400198791279 (0.00400198791279%)
  },
  {
    symbol: "ALICE/USDT:USDT",
    "A-FUNDINGRATE": 0.00005,
    "B-FUNDINGRATE": -0.00005,
    "A-FUNDINGPERIOD": 4,
    "B-FUNDINGPERIOD": 4
    // 资金费率差值: |0.00005 - (-0.00005)| = |0.0001| = 0.0001 (0.01%)
  },
  {
    symbol: "HIGH_DIFF/USDT:USDT",
    "A-FUNDINGRATE": 0.01,
    "B-FUNDINGRATE": -0.01,
    "A-FUNDINGPERIOD": 4,
    "B-FUNDINGPERIOD": 4
    // 资金费率差值: |0.01 - (-0.01)| = |0.02| = 0.02 (2%) - 这应该排在最前面
  },
  {
    symbol: "DIFF_PERIOD/USDT:USDT",
    "A-FUNDINGRATE": 0.001,
    "B-FUNDINGRATE": -0.001,
    "A-FUNDINGPERIOD": 8,
    "B-FUNDINGPERIOD": 4
    // A标准化到24小时: 0.001 * (24/8) = 0.003
    // B标准化到24小时: -0.001 * (24/4) = -0.006
    // 标准化后差值: |0.003 - (-0.006)| = |0.009| = 0.009 (0.9%)
    // 但每期差值: |0.001 - (-0.001)| = |0.002| = 0.002 (0.2%)
  },
  {
    symbol: "STRING_VALUES/USDT:USDT",
    "A-FUNDINGRATE": "0.003",
    "B-FUNDINGRATE": "-0.002",
    "A-FUNDINGPERIOD": "8",
    "B-FUNDINGPERIOD": "8"
    // 资金费率差值: |0.003 - (-0.002)| = |0.005| = 0.005 (0.5%)
  },
  {
    symbol: "MISSING_VALUES/USDT:USDT",
    "A-FUNDINGRATE": null,
    "B-FUNDINGRATE": -0.004,
    "A-FUNDINGPERIOD": null,
    "B-FUNDINGPERIOD": 8
    // 资金费率差值应处理为: |0 - (-0.004)| = |0.004| = 0.004 (0.4%)
  }
];

/**
 * 获取资金费率差值函数（与前端实现相同）
 */
const getFundingDiff = (item) => {
  // 严格处理资金费率，确保是数值类型
  let rateA = 0, rateB = 0;
  
  // 处理各种可能的格式：字符串、数字、百分比、null、undefined
  if (typeof item['A-FUNDINGRATE'] === 'string') {
    rateA = parseFloat(item['A-FUNDINGRATE'].replace('%', '')) || 0;
  } else if (typeof item['A-FUNDINGRATE'] === 'number') {
    rateA = item['A-FUNDINGRATE'];
  }
  
  if (typeof item['B-FUNDINGRATE'] === 'string') {
    rateB = parseFloat(item['B-FUNDINGRATE'].replace('%', '')) || 0;
  } else if (typeof item['B-FUNDINGRATE'] === 'number') {
    rateB = item['B-FUNDINGRATE'];
  }
  
  // 计算绝对差值并返回
  return Math.abs(rateA - rateB);
};

/**
 * 运行排序测试
 */
const runSortingTest = () => {
  console.log('开始测试资金费率套利利润排序逻辑...');
  console.log('测试数据集大小:', testData.length);
  
  // 计算并显示原始数据的资金费率差值
  console.log('\n原始数据及其资金费率差值:');
  const dataWithDiffs = testData.map(item => {
    const diff = getFundingDiff(item);
    return {
      symbol: item.symbol,
      rateA: item['A-FUNDINGRATE'],
      rateB: item['B-FUNDINGRATE'],
      diff: diff,
      percentDiff: (diff * 100).toFixed(4) + '%'
    };
  });
  
  dataWithDiffs.forEach(item => {
    console.log(`${item.symbol}: 资金费率A=${item.rateA}, 资金费率B=${item.rateB}, 差值=${item.diff}, 百分比=${item.percentDiff}`);
  });
  
  // 按资金费率差值排序
  const sorted = [...testData].map(item => ({
    ...item,
    _fundingDiff: getFundingDiff(item)
  }));
  
  sorted.sort((a, b) => {
    if (a._fundingDiff > b._fundingDiff) return -1;
    if (a._fundingDiff < b._fundingDiff) return 1;
    return 0;
  });
  
  // 显示排序结果
  console.log('\n排序后结果 (按资金费率差值从大到小):');
  sorted.forEach((item, index) => {
    console.log(`${index + 1}. ${item.symbol}: ${(item._fundingDiff * 100).toFixed(4)}%`);
  });
  
  // 验证排序结果是否符合预期
  const expectedOrder = [
    "HIGH_DIFF/USDT:USDT",       // 2% 应该第一
    "STRING_VALUES/USDT:USDT",   // 0.5%
    "MISSING_VALUES/USDT:USDT",  // 0.4%
    "SNT/USDT:USDT",             // 0.211233%
    "DIFF_PERIOD/USDT:USDT",     // 0.2% (每期)
    "ALICE/USDT:USDT",           // 0.01%
    "RESOLV/USDT:USDT"           // 0.00400198791279%
  ];
  
  let isCorrect = true;
  for (let i = 0; i < expectedOrder.length; i++) {
    if (sorted[i].symbol !== expectedOrder[i]) {
      isCorrect = false;
      console.log(`\n排序错误: 位置 ${i+1} 应该是 ${expectedOrder[i]}, 但实际是 ${sorted[i].symbol}`);
    }
  }
  
  if (isCorrect) {
    console.log('\n测试通过! 资金费率套利利润排序逻辑工作正常。');
  } else {
    console.log('\n测试失败! 实际排序结果与预期不符。');
  }
};

// 执行测试
runSortingTest();