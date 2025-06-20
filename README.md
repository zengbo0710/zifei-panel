# 套利机会监控面板

## 项目概述

套利机会监控面板是一个用于实时监控不同交易所间的套利机会、价格差异和资金费率的完整系统。该项目包含后端服务（Node.js）和前端UI（Next.js），支持通过Docker一键部署整个应用。

## 项目结构

```
zifei-panel/
├── docker/                    # Docker配置目录
│   ├── server.Dockerfile      # 后端Docker配置
│   └── frontend.Dockerfile    # 前端Docker配置
├── front/                     # 前端项目目录
│   ├── src/                   # 前端源码
│   ├── public/                # 静态资源
│   ├── .env.local             # 环境配置
│   └── README.md              # 前端文档
├── server/                    # 后端模块化代码
│   ├── api/                   # API路由
│   ├── config/                # 配置文件
│   ├── services/              # 业务逻辑服务
│   └── README.md              # 后端API文档
├── plan/                      # 项目计划文档
│   └── plan202506192135.md    # 开发计划
├── index.js                   # 应用入口点
├── package.json               # 项目依赖
├── docker-compose.yml         # Docker Compose配置
├── deploy.sh                  # 一键部署脚本
└── README.md                  # 项目说明文档
```

## 技术栈

### 后端
- Node.js
- Express
- CCXT (加密货币交易库)
- Axios

### 前端
- Next.js
- React.js
- Tailwind CSS
- Axios

### 部署
- Docker
- Docker Compose
- Coolify 支持

## 功能特性

- 实时监控多个交易所的价格数据
- 自动计算并显示套利机会
- 获取并显示资金费率信息和下次资金费率时间
- 支持按交易所和交易对筛选
- 支持多种排序方式：价差绝对值、资费绝对值、资费差值和资费套利利润
- 响应式设计，适配桌面和移动设备
- 支持用户自定义刷新时间间隔（7秒至60秒），并且设置会被保存
- 清晰的资费套利利润标注，易于识别收益数据

## 计算方法

### 价差计算
- 价差绝对值 = |交易所A价格与交易所B价格的比率 - 1|
- 例如：如果交易所A价格为100，交易所B价格为105，则价差为|(100/105) - 1| = 0.0476 (4.76%)

### 资费差值计算
- 原始资费差值 = |交易所A资金费率 - 交易所B资金费率|
- 标准化资费差值（24小时） = |(交易所A资金费率 * 24/周期A) - (交易所B资金费率 * 24/周期B)|
- 例如：如果交易所A资金费率为0.01%（8小时周期），交易所B资金费率为-0.02%（8小时周期），则：
  - 原始资费差值 = |0.01% - (-0.02%)| = 0.03%
  - 标准化资费差值（24小时） = |(0.01% * 24/8) - (-0.02% * 24/8)| = |0.03% - (-0.06%)| = 0.09%

### 资费套利利润计算

#### 基本计算原理
- **每次结算利润**：资金费率差值的绝对值（以百分比表示）
- **24小时标准化利润**：标准化到24小时周期的资金费率差值绝对值（以百分比表示）
- 基于两个交易所间做多做空对冲头寸时，仅考虑资金费率因素可获得的利润

#### 资金费率套利方法详解

资金费率套利是利用不同交易所之间的资金费率差异获利的策略。通过在资金费率为正的交易所做空，在资金费率为负的交易所做多，可以在每个资金费率结算周期获得利润。

**套利步骤**：
1. 找出同一交易对在不同交易所的资金费率差异
2. 在资金费率为正（支付方）的交易所做空
3. 在资金费率为负（收取方）的交易所做多
4. 持有头寸直到资金费率结算，获得资金费率差值作为利润
5. 可以继续持有至下次结算，或者平仓退出

**计算公式**：
- 单次结算利润% = |交易所A资金费率 - 交易所B资金费率|
- 标准化24小时利润% = |（交易所A资金费率 × 24/周期A）- （交易所B资金费率 × 24/周期B）|

#### 资金费率套利示例

**示例1：相同结算周期**

假设BTC/USDT交易对：
- Binance资金费率：+0.01%（每8小时结算，正值表示多方支付给空方）
- OKX资金费率：-0.025%（每8小时结算，负值表示空方支付给多方）

套利操作：
- 在Binance做空BTC/USDT：结算时收取0.01%资金费
- 在OKX做多BTC/USDT：结算时收取0.025%资金费
- 单次结算总利润：0.01% + 0.025% = 0.035%
- 24小时标准化利润：0.035% × (24/8) = 0.105%

**示例2：不同结算周期**

假设ETH/USDT交易对：
- Bybit资金费率：+0.02%（每8小时结算）
- Bitget资金费率：-0.01%（每4小时结算）

套利操作：
- 在Bybit做空ETH/USDT：每8小时收取0.02%资金费
- 在Bitget做多ETH/USDT：每4小时收取0.01%资金费（8小时内收取两次）
- 8小时周期内总利润：0.02% + (0.01% × 2) = 0.04%
- 24小时标准化利润：0.04% × (24/8) = 0.12%

**风险提示**：
- 资金费率套利虽然可以获得稳定收益，但需要考虑交易手续费和价格波动风险
- 建议使用配对对冲头寸，维持delta中性，降低价格波动风险
- 资金费率可能随市场情况变化，需要定期检查并调整策略

## 安装与部署

### 前提条件
- 安装 Docker 和 Docker Compose
- Node.js 16+ (本地开发)
- NPM 7+ (本地开发)

### 一键部署（推荐）

使用提供的脚本一键部署前后端服务：

```bash
# 添加执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

部署成功后可通过以下地址访问：
- 前端UI和后端API: http://localhost:3100
- API接口: http://localhost:3100/api

### 手动部署

也可以使用Docker Compose手动部署：

```bash
# 构建和启动所有服务
docker-compose up -d --build

# 仅启动后端
docker-compose up -d server

# 仅启动前端
docker-compose up -d frontend
```

### 本地开发

分别启动后端和前端服务：

```bash
# 后端服务
npm install
npm run dev  # 使用nodemon启动

# 前端服务
cd front
npm install
npm run dev
```

## API文档

详细的API文档请参考 [服务器API文档](server/README.md)。

主要端点包括：
- `GET /api/opportunities` - 获取所有套利机会，每个机会包含fundingProfit字段
- `GET /api/opportunities/:symbol` - 获取特定交易对的套利机会
- `GET /api/status` - 获取系统状态和资金费率信息
- `GET /api/kline/:exchange/:symbol` - 获取K线图数据

### fundingProfit 字段说明

在API响应和函数返回值中，每个套利机会对象都包含了 `fundingProfit` 字段，该字段包含以下属性：

```javascript
"fundingProfit": {
  "rawDiff": 0.0000706118012741, // 资金费率差值的绝对值（原始小数格式）
  "rawProfit": 0.0000706118012741, // 资金费率套利利润（原始小数格式，与rawDiff相同）
  "profitPerPeriod": "0.0071" // 每期利润百分比（格式化为百分比字符串，四位小数）
}
```

此字段通过计算两个交易所间的资金费率差值绝对值得出，用于评估资金费率套利的潜在收益。

### 函数API说明

项目中提供了以下内部函数API，可直接在代码中调用，无需发起HTTP请求：

#### getTopFundingProfitOpportunities

此函数返回按照资费套利利润排序的前5个交易机会。

**导入方式**：
```javascript
const { getTopFundingProfitOpportunities } = require('./server/services/arbitrageService');
```

**参数**：无需参数

**返回值**：
```javascript
{
  success: true,
  data: {
    opportunities: [
      // 按资费套利利润排序的前5个交易机会数据，
      // 每个对象的格式与API返回的opportunities数组中的对象格式一致
    ],
    lastUpdate: "2023-06-20T15:16:04.123Z", // 最后更新时间
    count: 5 // 返回的机会数量
  }
}
```

**排序逻辑**：
- 函数内部使用`fundingProfit.rawProfit`字段进行降序排序
- 只返回排名前5的记录

**使用场景**：
- 直接在代码中获取资费套利利润最高的几个机会，无需重复调用API和在前端进行排序
- 提高应用性能，减少不必要的数据传输

## 部署到Coolify

本项目支持在Coolify平台上部署：

1. 在Coolify中创建新应用
2. 指向此仓库地址
3. 选择`docker-compose.yml`文件作为部署配置
4. 设置环境变量
5. 部署应用

## 环境变量

### 后端环境变量
- `PORT` - 服务器端口（默认3100）
- `NODE_ENV` - 环境模式（development/production）
- `CORS_ORIGIN` - CORS源配置

### 前端环境变量
- `NEXT_PUBLIC_API_URL` - API地址（默认http://localhost:3100/api）
- `NEXT_PUBLIC_UPDATE_INTERVAL` - 数据刷新间隔（毫秒）

## 项目维护

### 日志查看
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f server
docker-compose logs -f frontend
```

### 更新部署
```bash
# 拉取最新代码并重新部署
git pull
./deploy.sh
```

## 注意事项

- 确保Docker和Docker Compose已正确安装
- 前端和后端服务需使用不同端口
- 生产环境部署需配置正确的API URL
- 请定期检查CCXT库更新以支持最新的交易所API