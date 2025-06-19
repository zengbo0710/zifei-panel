# 套利面板前端

## 项目概述

该项目是套利交易机会监控面板的前端部分，用于显示不同交易所间的套利机会、价格差异和资金费率信息。前端基于Next.js开发，采用响应式设计，支持桌面端和移动端访问。

## 技术栈

- **Framework**: Next.js 14.x
- **UI库**: Tailwind CSS 3.x
- **HTTP Client**: Axios
- **日期处理**: date-fns
- **UI组件**: React Select, React Icons

## 项目结构

```
front/
├── public/                # 静态资源文件夹
├── src/
│   ├── components/        # React组件
│   │   ├── FilterBar.jsx  # 筛选器组件
│   │   ├── OpportunityCard.jsx # 套利机会卡片组件
│   │   └── PriceSpreadDetails.jsx # 价差详情组件
│   ├── pages/             # Next.js页面
│   │   ├── _app.js        # 应用入口
│   │   ├── index.js       # 主页面
│   ├── services/          # 服务层
│   │   └── api.js         # API服务
│   ├── styles/            # 样式文件
│   │   └── globals.css    # 全局样式
│   └── tests/             # 测试文件
│       ├── api.test.js    # API测试
│       └── runTests.js    # 测试运行器
├── .env.local             # 本地环境变量
├── .env.example           # 环境变量示例
├── package.json           # 项目依赖
├── tailwind.config.js     # Tailwind配置
└── postcss.config.js      # PostCSS配置
```

## 功能特性

1. **实时数据展示**：显示来自后端API的套利机会数据
2. **自动刷新**：定期自动刷新数据（默认30秒）
3. **响应式设计**：适配桌面、平板和移动设备
4. **数据筛选**：支持按交易所和交易对筛选
5. **分页功能**：支持大量数据的分页浏览
6. **详细信息展示**：显示价差详情、资金费率和下次费率时间

## 环境变量

项目使用`.env.local`文件配置环境变量：

- `NEXT_PUBLIC_API_URL`: API基础URL（默认: http://localhost:3000/api）
- `NEXT_PUBLIC_UPDATE_INTERVAL`: 数据刷新间隔（毫秒，默认: 30000）

## 安装与运行

### 开发环境

```bash
# 安装依赖
cd front
npm install

# 启动开发服务器
npm run dev
```

### 生产环境

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

## API集成

前端与后端API集成，主要使用以下端点：

1. `/api/opportunities` - 获取所有套利机会
2. `/api/opportunities/:symbol` - 获取特定交易对的套利机会
3. `/api/opportunities/pair/:pair` - 获取特定交易所组合的套利机会
4. `/api/status` - 获取系统状态，包括资金费率信息

## 测试

```bash
# 运行API集成测试
node src/tests/runTests.js
```

## Docker部署

项目根目录包含`Dockerfile`和`docker-compose.yml`文件，支持Docker容器化部署：

```bash
# 使用Docker Compose运行
docker-compose up -d
```

## Coolify部署说明

项目支持在Coolify平台上部署，步骤如下：

1. 在Coolify中创建新应用
2. 配置Git仓库源
3. 选择Dockerfile部署方式
4. 配置环境变量（参考.env.example）
5. 设置部署触发器（如Git推送自动部署）
6. 启动构建和部署流程

## 注意事项

- 确保后端服务已启动并配置正确的API URL
- 生产环境部署需配置正确的API基础URL
- 响应式设计优化适配各种设备尺寸