# 套利系统API文档

本文档详细说明了服务器提供的所有API端点、参数、返回格式，以及可供直接调用的内部函数API。

## HTTP API端点

所有HTTP API端点都基于`/api`前缀。

### 1. 获取所有套利机会

获取当前所有可用的套利机会，默认按照资费套利利润降序排列。

- **URL:** `/api/opportunities`
- **方法:** GET
- **参数:** 无
- **响应:**
  ```json
  {
    "success": true,
    "data": {
      "opportunities": [
        {
          "pair": "A-B",
          "exchangeA": "BINANCE",
          "exchangeB": "OKX",
          "symbol": "BTC/USDT:USDT",
          "A-ASK": 104594.8,
          "A-BID": 104594.8,
          "A-LAST": 104594.8,
          "B-ASK": 104614.3,
          "B-BID": 104614.2,
          "B-LAST": 104614.3,
          "LASB": 0.999814556723657,
          "SALB": 0.9998136010086576,
          "timestamp": "2025-06-19T13:21:51.666Z",
          "opportunity": "LASB",
          "opportunityValue": 0.00018544327634295588,
          "A-FUNDINGRATE": 0.0000013,
          "A-FUNDINGTIME": 1750348800000,
          "A-FUNDINGPERIOD": 8,
          "B-FUNDINGRATE": 0.0000719118012741,
          "B-FUNDINGTIME": 1750348800000,
          "B-FUNDINGPERIOD": 8,
          "fundingProfit": {
            "rawDiff": 0.0000706118012741,
            "rawProfit": 0.0000706118012741,
            "profitPerPeriod": "0.0071"
          }
        },
        // ... 更多套利机会
      ],
      "lastUpdate": "2025-06-19T13:21:51.667Z",
      "count": 419
    }
  }
  ```

### 2. 获取特定交易对的套利机会

获取特定交易对的所有套利机会。

- **URL:** `/api/opportunities/:symbol`
- **方法:** GET
- **参数:** 
  - `symbol`: 交易对符号（例如：`BTC%2FUSDT%3AUSDT`，注意需URL编码）
- **响应:**
  ```json
  {
    "success": true,
    "data": {
      "opportunities": [
        {
          "pair": "A-B",
          "exchangeA": "BINANCE",
          "exchangeB": "OKX",
          "symbol": "BTC/USDT:USDT",
          "A-ASK": 104594.8,
          "A-BID": 104594.8,
          "A-LAST": 104594.8,
          "B-ASK": 104614.3,
          "B-BID": 104614.2,
          "B-LAST": 104614.3,
          "LASB": 0.999814556723657,
          "SALB": 0.9998136010086576,
          "timestamp": "2025-06-19T13:21:51.666Z",
          "opportunity": "LASB",
          "opportunityValue": 0.00018544327634295588,
          "A-FUNDINGRATE": 0.0000013,
          "A-FUNDINGTIME": 1750348800000,
          "A-FUNDINGPERIOD": 8,
          "B-FUNDINGRATE": 0.0000719118012741,
          "B-FUNDINGTIME": 1750348800000,
          "B-FUNDINGPERIOD": 8,
          "fundingProfit": {
            "rawDiff": 0.0000706118012741,
            "rawProfit": 0.0000706118012741,
            "profitPerPeriod": "0.0071"
          }
        }
        // 可能有多个特定交易对的套利机会
      ],
      "lastUpdate": "2025-06-19T13:21:51.667Z",
      "count": 3
    }
  }
  ```

### 3. 获取特定交易对组合的套利机会

获取特定交易所组合的所有套利机会。

- **URL:** `/api/opportunities/pair/:pair`
- **方法:** GET
- **参数:** 
  - `pair`: 交易所组合（例如：`BINANCE-OKX`）
- **响应:**
  ```json
  {
    "success": true,
    "data": {
      "opportunities": [
        {
          "pair": "A-B",
          "exchangeA": "BINANCE",
          "exchangeB": "OKX",
          "symbol": "BTC/USDT:USDT",
          "A-ASK": 104594.8,
          "A-BID": 104594.8,
          "A-LAST": 104594.8,
          "B-ASK": 104614.3,
          "B-BID": 104614.2,
          "B-LAST": 104614.3,
          "LASB": 0.999814556723657,
          "SALB": 0.9998136010086576,
          "timestamp": "2025-06-19T13:21:51.666Z",
          "opportunity": "LASB",
          "opportunityValue": 0.00018544327634295588,
          "A-FUNDINGRATE": 0.0000013,
          "A-FUNDINGTIME": 1750348800000,
          "A-FUNDINGPERIOD": 8,
          "B-FUNDINGRATE": 0.0000719118012741,
          "B-FUNDINGTIME": 1750348800000,
          "B-FUNDINGPERIOD": 8,
          "fundingProfit": {
            "rawDiff": 0.0000706118012741,
            "rawProfit": 0.0000706118012741,
            "profitPerPeriod": "0.0071"
          }
        },
        // ... 更多特定交易所组合的套利机会
      ],
      "lastUpdate": "2025-06-19T13:21:51.667Z",
      "count": 145
    }
  }
  ```

### 4. 获取系统状态信息

获取完整的系统状态信息，包括各交易所的资金费率数据。

- **URL:** `/api/status`
- **方法:** GET
- **参数:** 无
- **响应:**
  ```json
  {
    "success": true,
    "data": {
      "lastUpdate": "2025-06-19T13:21:51.667Z",
      "totalOpportunities": 419,
      "isRunning": true,
      "bitgetFundingMap": {
        "BTC/USDT:USDT": {
          "fundingRate": 0.0000045,
          "fundingTime": 1750348800000,
          "fundingInterval": 8
        },
        // ... 更多交易对
      }
    }
  }
  ```

### 5. 获取K线数据

获取特定交易所和交易对的K线数据。

- **URL:** `/api/kline`
- **方法:** GET
- **参数:** 
  - `exchange`: 交易所名称（例如：`bybit`, `binance`, `okx`, `bitget`）
  - `symbol`: 交易对符号（例如：`BTC%2FUSDT%3AUSDT`，注意需URL编码）
  - `timeframe`: 时间框架（可选，默认为`1m`）
  - `limit`: 返回的K线数量限制（可选，默认为1000）
- **响应:**
  ```json
  {
    "success": true,
    "data": [
      {
        "timestamp": 1684147200000,
        "open": 27500.0,
        "high": 27550.0,
        "low": 27480.0,
        "close": 27520.0,
        "volume": 152.35
      },
      // ... 更多K线数据
    ]
  }
  ```

## 内部函数API

除了HTTP API外，系统还提供了以下可直接在代码中调用的函数API，无需发起HTTP请求：

### 1. getLatestOpportunities

获取最新的所有交易机会数据。

**函数定义：**
```javascript
const getLatestOpportunities = () => {
    return {
        opportunities: latestOpportunities,
        lastUpdateTime
    };
};
```

**导入方式：**
```javascript
const { getLatestOpportunities } = require('../services/arbitrageService');
```

**参数：** 无需参数

**返回值：**
```javascript
{
  opportunities: [ ... ], // 所有套利机会数组
  lastUpdateTime: "2025-06-20T15:16:04.123Z" // 最后更新时间
}
```

### 2. getTopFundingProfitOpportunities

获取按照资费套利利润排序的前5个交易机会，默认UI排序方式也已调整为资费套利利润。

### 3. getOpportunitiesBySymbol

获取特定交易对的套利机会。

**函数定义：**
```javascript
const getOpportunitiesBySymbol = (symbol) => {
    // 实现代码
};
```

**导入方式：**
```javascript
const { getOpportunitiesBySymbol } = require('../services/arbitrageService');
```

**参数：**
- `symbol`: 交易对符号（例如：`'BTC/USDT:USDT'`），不区分大小写

**返回值：**
```javascript
{
  success: true,
  data: {
    opportunities: [
      // 特定交易对的所有套利机会，结构与API返回的一致
    ],
    lastUpdate: "2025-06-20T15:16:04.123Z",
    count: 3  // 返回的机会数量
  }
}
```

**使用场景：**
- 在后端代码中直接过滤特定交易对的套利机会，而无需调用HTTP API
- 例如，实现交易对级别的监控或分析功能

**代码示例：**
```javascript
const { getOpportunitiesBySymbol } = require('../services/arbitrageService');

// 获取BTC/USDT:USDT交易对的所有套利机会
const result = getOpportunitiesBySymbol('BTC/USDT:USDT');

if (result.success) {
  const { opportunities, lastUpdate, count } = result.data;
  console.log(`找到${count}个${symbol}交易对的套利机会，最后更新时间: ${lastUpdate}`);
  
  opportunities.forEach(opp => {
    console.log(`${opp.exchangeA}-${opp.exchangeB}: ${opp.opportunity} 价差: ${opp.opportunityValue}`);
  });
}
```

### 4. getOpportunitiesByPair

获取特定交易所对组合的套利机会。

**函数定义：**
```javascript
const getOpportunitiesByPair = (pair) => {
    // 实现代码
};
```

**导入方式：**
```javascript
const { getOpportunitiesByPair } = require('../services/arbitrageService');
```

**参数：**
- `pair`: 交易所对组合（例如：`'BINANCE-OKX'`），不区分大小写

**返回值：**
```javascript
{
  success: true,
  data: {
    opportunities: [
      // 特定交易所对组合的所有套利机会，结构与API返回的一致
    ],
    lastUpdate: "2025-06-20T15:16:04.123Z",
    count: 145  // 返回的机会数量
  }
}
```

**使用场景：**
- 在后端代码中直接过滤特定交易所对组合的套利机会，而无需调用HTTP API
- 例如，实现交易所对级别的监控或分析功能

**代码示例：**
```javascript
const { getOpportunitiesByPair } = require('../services/arbitrageService');

// 获取BINANCE-OKX交易所对组合的所有套利机会
const result = getOpportunitiesByPair('BINANCE-OKX');

if (result.success) {
  const { opportunities, lastUpdate, count } = result.data;
  console.log(`找到${count}个BINANCE-OKX交易所对的套利机会，最后更新时间: ${lastUpdate}`);
  
  opportunities.forEach(opp => {
    console.log(`${opp.symbol}: ${opp.opportunity} 价差: ${opp.opportunityValue}`);
  });
}

**函数定义：**
```javascript
const getTopFundingProfitOpportunities = () => {
    // 复制最新机会数组
    const sortedOpportunities = [...latestOpportunities];
    
    // 按照资费套利利润（fundingProfit.rawProfit）降序排序
    sortedOpportunities.sort((a, b) => {
        const profitA = a.fundingProfit?.rawProfit || 0;
        const profitB = b.fundingProfit?.rawProfit || 0;
        return profitB - profitA;
    });
    
    // 只返回前5个交易机会
    const topOpportunities = sortedOpportunities.slice(0, 5);
    
    // 使返回格式与API保持一致
    return {
        success: true,
        data: {
            opportunities: topOpportunities,
            lastUpdate: lastUpdateTime,
            count: topOpportunities.length
        }
    };
};
```

**导入方式：**
```javascript
const { getTopFundingProfitOpportunities } = require('../services/arbitrageService');
```

**参数：** 无需参数

**返回值：**
```javascript
{
  success: true,
  data: {
    opportunities: [
      {
        "pair": "A-B",
        "exchangeA": "BINANCE",
        "exchangeB": "OKX",
        "symbol": "BTC/USDT:USDT",
        "A-ASK": 104594.8,
        "A-BID": 104594.8,
        "A-LAST": 104594.8,
        "B-ASK": 104614.3,
        "B-BID": 104614.2,
        "B-LAST": 104614.3,
        "LASB": 0.999814556723657,
        "SALB": 0.9998136010086576,
        "timestamp": "2025-06-20T15:16:04.123Z",
        "opportunity": "LASB",
        "opportunityValue": 0.00018544327634295588,
        "A-FUNDINGRATE": 0.0000013,
        "A-FUNDINGTIME": 1750348800000,
        "A-FUNDINGPERIOD": 8,
        "B-FUNDINGRATE": 0.0000719118012741,
        "B-FUNDINGTIME": 1750348800000,
        "B-FUNDINGPERIOD": 8,
        "fundingProfit": {
          "rawDiff": 0.0000706118012741,
          "rawProfit": 0.0000706118012741,
          "profitPerPeriod": "0.0071"
        }
      },
      // ...更多交易机会（最多5个，按资费套利利润排序）
    ],
    lastUpdate: "2025-06-20T15:16:04.123Z",
    count: 5
  }
}
```

**功能说明：**

该函数执行以下操作：
1. 复制最新的机会数据数组，避免修改原始数据
2. 根据`fundingProfit.rawProfit`值对交易机会进行降序排序（从高到低）
3. 只保留排名前5的交易机会
4. 以与HTTP API一致的格式返回数据

**使用场景：**
- 直接在代码中获取资费套利利润最高的几个机会，无需重复调用API和在前端进行排序
- 提高应用性能，减少不必要的数据传输
- 例如在前端可以直接显示"高利润推荐"部分

**代码示例：**
```javascript
const { getTopFundingProfitOpportunities } = require('../services/arbitrageService');

// 获取按资费套利利润排序的前5个交易机会
const result = getTopFundingProfitOpportunities();

// 处理结果
if (result.success) {
  const { opportunities, lastUpdate, count } = result.data;
  console.log(`发现${count}个高利润套利机会，最后更新时间: ${lastUpdate}`);
  
  opportunities.forEach(opp => {
    // 访问资费套利利润数据
    const profit = opp.fundingProfit.profitPerPeriod;
    console.log(`${opp.exchangeA}-${opp.exchangeB} ${opp.symbol}: 资费套利利润 ${profit}%`);
  });
}
```

### 3. fetchKlineData

获取特定交易所和交易对的K线数据。

**函数定义：**
```javascript
async function fetchKlineData(exchange, symbol, timeframe = '1m', limit = 1000) {
    try {
        // 创建交易所实例
        const exchangeInstance = createExchange(exchange);
        
        // 获取K线数据
        const ohlcv = await exchangeInstance.fetchOHLCV(symbol, timeframe, undefined, 2000);
        
        // 格式化数据
        return ohlcv.map(item => ({
            timestamp: item[0],
            open: item[1],
            high: item[2],
            low: item[3],
            close: item[4],
            volume: item[5]
        }));
    } catch (error) {
        console.error('Error fetching kline data:', error);
        throw error;
    }
}
```

**导入方式：**
```javascript
const { fetchKlineData } = require('../services/arbitrageService');
```

**参数：**
- `exchange`: 交易所名称（例如：`'bybit'`, `'binance'`, `'okx'`, `'bitget'`）
- `symbol`: 交易对符号（例如：`'BTC/USDT:USDT'`）
- `timeframe`: 时间框架（可选，默认为`'1m'`）
- `limit`: 返回的K线数量限制（可选，默认为1000）

**返回值：**
```javascript
[
  {
    timestamp: 1684147200000,
    open: 27500.0,
    high: 27550.0,
    low: 27480.0,
    close: 27520.0,
    volume: 152.35
  },
  // ... 更多K线数据
]
```

## 数据结构说明

### 套利机会对象

每个套利机会对象包含以下字段：

- `pair`: 交易所对组合标识，固定为"A-B"
- `exchangeA`: 交易所A的名称（例如：BINANCE, OKX, BYBIT, BITGET）
- `exchangeB`: 交易所B的名称
- `symbol`: 交易对符号（例如：BTC/USDT:USDT）
- `A-ASK`: 交易所A的卖出价
- `A-BID`: 交易所A的买入价
- `A-LAST`: 交易所A的最新成交价
- `B-ASK`: 交易所B的卖出价
- `B-BID`: 交易所B的买入价
- `B-LAST`: 交易所B的最新成交价
- `LASB`: Long A Short B价差比率（A-ASK/B-BID）
- `SALB`: Short A Long B价差比率（A-BID/B-ASK）
- `timestamp`: 数据时间戳（ISO格式）
- `opportunity`: 套利机会类型（"LASB"或"SALB"）
- `opportunityValue`: 套利机会价值（价差的绝对值）
- `A-FUNDINGRATE`: 交易所A的资金费率
- `A-FUNDINGTIME`: 交易所A的下次资金费率时间（时间戳）
- `A-FUNDINGPERIOD`: 交易所A的资金费率周期（小时）
- `B-FUNDINGRATE`: 交易所B的资金费率
- `B-FUNDINGTIME`: 交易所B的下次资金费率时间（时间戳）
- `B-FUNDINGPERIOD`: 交易所B的资金费率周期（小时）
- `fundingProfit`: 资金费率套利利润数据对象，包含以下属性：
  - `rawDiff`: 资金费率差值的绝对值（原始小数格式）
  - `rawProfit`: 资金费率套利利润（原始小数格式，与rawDiff相同）
  - `profitPerPeriod`: 每期利润百分比（格式化为百分比字符串，四位小数）

### 套利机会筛选逻辑

系统对套利机会进行筛选，主要条件包括：

1. 如果交易对包含Bitget交易所：
   - Bitget的交易量必须≥1,000,000 USDT
   - Bitget的资金费率绝对值必须≥0.001（0.1%）

2. 价差判断：
   - LASB：当A-ASK < B-BID时，表示买A卖B有套利空间
   - SALB：当A-BID > B-ASK时，表示卖A买B有套利空间

3. 结果默认按照资费套利利润（fundingProfit.rawProfit）从高到低排序

## 更新频率

- 套利机会数据每5秒更新一次
- 资金费率数据每1分钟更新一次