const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./api/routes');
const { main } = require('./services/arbitrageService');
const fs = require('fs');
const { 
    fetchBybitFundingInfo, 
    fetchBitgetFundingInfo, 
    fetchOKXFundingInfo, 
    fetchBinanceFundingInfo 
} = require('./services/fundingService');

const app = express();
const port = process.env.PORT || 3000;

// 配置CORS选项 - 简化为允许所有来源，方便本地开发和Docker部署
const corsOptions = {
    origin: '*', // 允许所有域名访问，简化本地和Docker环境配置
    methods: ['GET', 'POST', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400
};

// 启用CORS
app.use(cors(corsOptions));

// 启用JSON中间件
app.use(express.json());

// 注册API路由
app.use('/api', apiRoutes);

// 设置静态文件服务
console.log('配置静态文件服务...');

// 为前端构建文件提供静态服务
const frontendDistPath = path.join(__dirname, '../front/.next');
if (fs.existsSync(frontendDistPath)) {
    console.log('提供Next.js静态文件服务...');
    app.use('/_next', express.static(frontendDistPath));
    app.use(express.static(path.join(__dirname, '../front/public')));
}

// 同时提供公共静态文件
app.use(express.static(path.join(__dirname, '../public')));

// 处理前端路由
app.get('/', (req, res) => {
    // 检查是否有静态index.html
    const staticIndexPath = path.join(__dirname, '../public/index.html');
    if (fs.existsSync(staticIndexPath)) {
        return res.sendFile(staticIndexPath);
    }
    
    // 如果有Next.js前端构建，返回状态页面
    const nextIndexPath = path.join(__dirname, '../front/.next/server/pages/index.html');
    if (fs.existsSync(nextIndexPath)) {
        return res.sendFile(nextIndexPath);
    }
    
    // 如果两者都没有，显示API服务信息页面
    res.send(`
        <html>
            <head>
                <title>套利机会监控面板 API</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                    h1 { color: #333; }
                    .container { max-width: 800px; margin: 0 auto; }
                    .api-link { background: #f4f4f4; padding: 10px; border-radius: 4px; display: inline-block; margin: 5px 0; }
                    .status { color: green; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>套利机会监控面板 API</h1>
                    <p class="status">✓ API服务运行正常</p>
                    <p>您可以通过以下端点访问API:</p>
                    <p class="api-link">GET /api/opportunities - 获取所有套利机会</p>
                    <p class="api-link">GET /api/opportunities/:symbol - 获取指定币种的套利机会</p>
                    <p class="api-link">GET /api/status - 获取服务状态</p>
                </div>
            </body>
        </html>
    `);
});

// 启动Express服务器
app.listen(port, () => {
    console.log(`API server is running on http://localhost:${port}`);
});

// 每5秒运行一次主函数
setInterval(() => {
    main().catch(error => {
        console.error("Error in main interval:", error);
    });
}, 5000);

// 每1分钟更新一次所有交易所的资金费率信息
setInterval(fetchBybitFundingInfo, 60000);
setInterval(() => {
    main().then(({ opportunities }) => {
        fetchBitgetFundingInfo(opportunities);
        fetchOKXFundingInfo(opportunities);
    }).catch(error => {
        console.error("Error updating Bitget and OKX funding rates:", error);
    });
}, 60000);
setInterval(fetchBinanceFundingInfo, 60000);

// 立即运行
main().then(({ opportunities }) => {
    // main 执行完成后立即获取 Bitget 和 OKX 的资金费率信息
    fetchBitgetFundingInfo(opportunities);
    fetchOKXFundingInfo(opportunities);
}).catch(error => {
    console.error("Error in initial main execution:", error);
});

// 立即获取其他交易所的资金费率信息
fetchBybitFundingInfo();
fetchBinanceFundingInfo();