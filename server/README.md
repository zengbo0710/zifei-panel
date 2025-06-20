# 服务器API文档

本文档详细说明了服务器提供的所有API端点、参数和返回格式，以及可供直接调用的内部函数API。所有HTTP API路由都是基于`/api`前缀。

## API端点列表

### 1. 获取所有套利机会

获取当前所有可用的套利机会，按照机会值（价差）倒序排列。

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

获取特定交易对组合的所有套利机会。

- **URL:** `/api/opportunities/:pair`
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
      "funding": {
        "bybit": {
          "BTC/USDT:USDT": {
            "fundingRate": 0.00001149,
            "fundingTime": 1750348800000,
            "fundingInterval": 8
          },
          // ... 更多交易对
        },
        "okx": {
          // OKX资金费率数据
        },
        "binance": {
          // Binance资金费率数据
        },
        "bitget": {
          // Bitget资金费率数据
        }
      }
    }
  }
  ```

### 5. 获取K线数据

获取特定交易所和交易对的K线数据。

- **URL:** `/api/kline/:exchange/:symbol`
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

3. 结果默认按照资费套利利润（fundingProfit.rawProfit）从高到低排序（原先按照价差绝对值排序）

## 更新频率

- 套利机会数据每5秒更新一次
- 资金费率数据每1分钟更新一次

## 内部函数API

除了HTTP API外，系统还提供了以下可直接在代码中调用的函数API，无需发起HTTP请求：

### getTopFundingProfitOpportunities

此函数返回按照资费套利利润排序的前5个交易机会。默认UI排序方式也已调整为资费套利利润。

**导入方式**：
```javascript
const { getTopFundingProfitOpportunities } = require('../services/arbitrageService');
```

**参数**：无需参数

**返回值**：
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

**排序逻辑**：
- 函数内部使用`fundingProfit.rawProfit`字段进行降序排序
- 只返回排名前5的记录

**使用场景**：
- 直接在代码中获取资费套利利润最高的几个机会，无需重复调用API和在前端进行排序
- 提高应用性能，减少不必要的数据传输
