const express = require('express');
const router = express.Router();
const { getLatestOpportunities, fetchKlineData } = require('../services/arbitrageService');

// 获取所有交易机会
router.get('/opportunities', (req, res) => {
    const { opportunities, lastUpdateTime } = getLatestOpportunities();
    res.json({
        "success": true,
        "data": {
            "opportunities": opportunities,
            "lastUpdate": lastUpdateTime,
            "count": opportunities.length,
        }
    });
});

// 获取特定交易对的机会
router.get('/opportunities/:symbol', (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const { opportunities, lastUpdateTime } = getLatestOpportunities();
    const filteredOpportunities = opportunities.filter(opp => opp.symbol === symbol);
    
    res.json({
        "success": true,
        "data": {
            "opportunities": filteredOpportunities,
            "lastUpdate": lastUpdateTime,
            "count": filteredOpportunities.length
        }
    });
});

// 获取特定交易所对的机会
router.get('/opportunities/pair/:pair', (req, res) => {
    const pair = req.params.pair.toUpperCase();
    const { opportunities, lastUpdateTime } = getLatestOpportunities();
    const filteredOpportunities = opportunities.filter(opp => opp.pair === pair);
    
    res.json({
        "success": true,
        "data": {
            "opportunities": filteredOpportunities,
            "lastUpdate": lastUpdateTime,
            "count": filteredOpportunities.length
        }
    });
});

// 获取状态信息
router.get('/status', (req, res) => {
    const { opportunities, lastUpdateTime } = getLatestOpportunities();
    const { getFundingMaps } = require('../services/fundingService');
    const { bitgetFundingMap } = getFundingMaps();
    
    res.json({
        "success": true,
        "data": {
            "lastUpdate": lastUpdateTime,
            "totalOpportunities": opportunities.length,
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