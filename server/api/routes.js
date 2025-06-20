const express = require('express');
const router = express.Router();
const { 
    getLatestOpportunities, 
    getOpportunitiesBySymbol,
    getOpportunitiesByPair,
    fetchKlineData 
} = require('../services/arbitrageService');

// 注意：更具体的路由必须放在前面，否则会被不太具体的路由规则捕获

// 获取特定交易所对的机会
router.get('/opportunities/pair/:pair', (req, res) => {
    const pair = req.params.pair;
    const result = getOpportunitiesByPair(pair);
    res.json(result);
});

// 获取特定交易对的机会
router.get('/opportunities/:symbol', (req, res) => {
    const symbol = req.params.symbol;
    const result = getOpportunitiesBySymbol(symbol);
    res.json(result);
});

// 获取所有交易机会
router.get('/opportunities', (req, res) => {
    // 直接返回getLatestOpportunities的结果，因为它已经是标准格式
    const result = getLatestOpportunities();
    res.json(result);
});

// 获取状态信息
router.get('/status', (req, res) => {
    const result = getLatestOpportunities();
    const { getFundingMaps } = require('../services/fundingService');
    const { bitgetFundingMap } = getFundingMaps();
    
    res.json({
        "success": true,
        "data": {
            "lastUpdate": result.data.lastUpdate,
            "totalOpportunities": result.data.opportunities.length,
            "isRunning": true,
            // "bybitFundingMap": bybitFundingMap,
            "bitgetFundingMap": bitgetFundingMap,
            // "okxFundingMap": okxFundingMap,
            // "binanceFundingMap": binanceFundingMap
        }
    });
});

// K线数据接口
router.get('/kline', async (req, res) => {
    try {
        const { 
            exchange = 'binance',
            symbol = 'BTC/USDT', 
            timeframe = '1m', 
            limit = 1000 
        } = req.query;
        
        const klineData = await fetchKlineData(exchange, symbol, timeframe, limit);

        res.json({
            success: true,
            data: klineData
        });
    } catch (error) {
        console.error('Error fetching kline data:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;