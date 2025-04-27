const ccxt = require('ccxt');
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3001; // 使用3001端口避免与其他服务冲突

// 启用CORS和JSON中间件
app.use(cors());
app.use(express.json());

// 存储最新的交易机会
let latestOpportunities = [];
let lastUpdateTime = null;
// 创建交易对支持映射
let symbolMap = {};


async function main() {
    // 创建交易所实例
    const okx = new ccxt.okx();
    const bitget = new ccxt.bitget();
    const bybit = new ccxt.bybit();
    const binance = new ccxt.binance();

    try {
        // 加载市场数据
        await Promise.all([okx.loadMarkets(), bitget.loadMarkets(), bybit.loadMarkets(), binance.loadMarkets()]);

        // 获取所有交易对的ticker数据
        const [okxTickers, bitgetTickers, bybitTickers, binanceTickers] = await Promise.all([
            okx.fetchTickers(undefined, { 'type': 'swap' }),
            bitget.fetchTickers(undefined, { 'type': 'swap' }),
            bybit.fetchTickers(undefined, { 'category': 'linear' }),
            binance.fetchTickers(undefined, { 'type': 'future' })
        ]);

        // 获取Binance的资金费率数据
        const binanceFundingResponse = await axios.get('https://fapi.binance.com/fapi/v1/premiumIndex');
        const binanceFundingData = {};
        for (const item of binanceFundingResponse.data) {
            const symbol = item.symbol.replace('USDT', '/USDT:USDT');
            binanceFundingData[symbol] = {
                fundingRate: parseFloat(item.lastFundingRate),
                fundingTime: parseInt(item.nextFundingTime),
                fundingRateInterval: 8 // Binance的资金费率间隔固定为8小时
            };
        }

        // 过滤掉超过12小时未更新的币种
        const currentTime = Date.now();
        const twelveHoursInMs = 12 * 60 * 60 * 1000;
        const filteredBinanceTickers = {};

        for (const [symbol, ticker] of Object.entries(binanceTickers)) {
            if (ticker.timestamp && (currentTime - ticker.timestamp) <= twelveHoursInMs) {
                filteredBinanceTickers[symbol] = ticker;
                // 使用last价格作为ask和bid
                filteredBinanceTickers[symbol].ask = ticker.last;
                filteredBinanceTickers[symbol].bid = ticker.last;
                // 添加资金费率相关信息
                if (binanceFundingData[symbol]) {
                    filteredBinanceTickers[symbol].fundingRate = binanceFundingData[symbol].fundingRate;
                    filteredBinanceTickers[symbol].fundingTime = binanceFundingData[symbol].fundingTime;
                    filteredBinanceTickers[symbol].fundingRateInterval = binanceFundingData[symbol].fundingRateInterval;
                }
            }
        }

        // 清空之前的映射
        symbolMap = {};

        // 添加各个交易所的交易对支持情况
        for (const symbol in okxTickers) {
            if (!symbolMap[symbol]) {
                symbolMap[symbol] = {
                    okx: false,
                    bitget: false,
                    bybit: false,
                    binance: false,
                    tickers: {}
                };
            }
            symbolMap[symbol].okx = true;
            symbolMap[symbol].tickers.okx = okxTickers[symbol];
        }

        for (const symbol in bitgetTickers) {
            if (!symbolMap[symbol]) {
                symbolMap[symbol] = {
                    okx: false,
                    bitget: false,
                    bybit: false,
                    binance: false,
                    tickers: {}
                };
            }
            symbolMap[symbol].bitget = true;
            symbolMap[symbol].tickers.bitget = bitgetTickers[symbol];
        }

        for (const symbol in bybitTickers) {
            if (!symbolMap[symbol]) {
                symbolMap[symbol] = {
                    okx: false,
                    bitget: false,
                    bybit: false,
                    binance: false,
                    tickers: {}
                };
            }
            symbolMap[symbol].bybit = true;
            symbolMap[symbol].tickers.bybit = bybitTickers[symbol];
        }

        for (const symbol in filteredBinanceTickers) {
            if (!symbolMap[symbol]) {
                symbolMap[symbol] = {
                    okx: false,
                    bitget: false,
                    bybit: false,
                    binance: false,
                    tickers: {}
                };
            }
            symbolMap[symbol].binance = true;
            symbolMap[symbol].tickers.binance = filteredBinanceTickers[symbol];
        }

        // 存储所有机会
        const opportunities = [];

        // 检查价差的函数
        function checkSpread(symbol, exchangeATicker, exchangeBTicker, exchangeAPair, exchangeBPair) {
            // 确保价格有效
            if (!exchangeATicker.last || !exchangeBTicker.last) return;

            // LASB = Long A Short B = A-ASK/B-BID
            const LASB = exchangeATicker.ask / exchangeBTicker.bid;
            // SALB = Short A Long B = A-BID/B-ASK
            const SALB = exchangeATicker.bid / exchangeBTicker.ask;

            if (LASB < 0.998 || SALB > 1.002) {
                const opportunity = LASB < 0.998 ? "LASB" : "SALB";
                const opportunityValue = opportunity === "LASB" ? Math.abs(1 - LASB) : Math.abs(1 - SALB);

                // 将交易所名称替换为A和B
                const pairName = `${exchangeAPair === 'BINANCE' ? 'A' : exchangeAPair}-${exchangeBPair === 'BINANCE' ? 'A' : 'B'}`;
                
                const opportunityObj = {
                    "pair": pairName,
                    "symbol": symbol,
                    "A-ASK": exchangeAPair === 'BINANCE' ? exchangeATicker.ask : exchangeBTicker.ask,
                    "A-BID": exchangeAPair === 'BINANCE' ? exchangeATicker.bid : exchangeBTicker.bid,
                    "A-LAST": exchangeAPair === 'BINANCE' ? exchangeATicker.last : exchangeBTicker.last,
                    "B-ASK": exchangeAPair === 'BINANCE' ? exchangeBTicker.ask : exchangeATicker.ask,
                    "B-BID": exchangeAPair === 'BINANCE' ? exchangeBTicker.bid : exchangeATicker.bid,
                    "B-LAST": exchangeAPair === 'BINANCE' ? exchangeBTicker.last : exchangeATicker.last,
                    "LASB": LASB,
                    "SALB": SALB,
                    "timestamp": new Date().toISOString(),
                    "opportunity": opportunity,
                    "opportunityValue": opportunityValue
                };

                // 添加资金费率相关信息
                if (exchangeAPair === 'BINANCE') {
                    opportunityObj["A-FUNDINGRATE"] = exchangeATicker.fundingRate || 0;
                    opportunityObj["A-FUNDINGTIME"] = exchangeATicker.fundingTime || 0;
                    opportunityObj["A-FUNDINGPERIOD"] = exchangeATicker.fundingRateInterval || 8;
                } else if (exchangeBPair === 'BINANCE') {
                    opportunityObj["A-FUNDINGRATE"] = exchangeBTicker.fundingRate || 0;
                    opportunityObj["A-FUNDINGTIME"] = exchangeBTicker.fundingTime || 0;
                    opportunityObj["A-FUNDINGPERIOD"] = exchangeBTicker.fundingRateInterval || 8;
                }

                opportunities.push(opportunityObj);
            }
        }

        // 遍历所有交易对，检查支持的交易所组合
        for (const symbol in symbolMap) {
            const support = symbolMap[symbol];
            const tickers = support.tickers;

            // Binance vs others
            if (support.binance) {
                if (support.okx) {
                    checkSpread(symbol, tickers.binance, tickers.okx, "BINANCE", "OKX");
                }
                if (support.bitget) {
                    checkSpread(symbol, tickers.binance, tickers.bitget, "BINANCE", "BITGET");
                }
                if (support.bybit) {
                    checkSpread(symbol, tickers.binance, tickers.bybit, "BINANCE", "BYBIT");
                }
            }

            // OKX vs others
            if (support.okx) {
                if (support.bitget) {
                    checkSpread(symbol, tickers.okx, tickers.bitget, "OKX", "BITGET");
                }
                if (support.bybit) {
                    checkSpread(symbol, tickers.okx, tickers.bybit, "OKX", "BYBIT");
                }
            }

            // BYBIT vs BITGET
            if (support.bybit && support.bitget) {
                checkSpread(symbol, tickers.bybit, tickers.bitget, "BYBIT", "BITGET");
            }
        }

        // 按照价差绝对值倒序排序
        opportunities.sort((a, b) => b.opportunityValue - a.opportunityValue);
        
        // 更新最新的交易机会和更新时间
        latestOpportunities = opportunities;
        lastUpdateTime = new Date().toISOString();

        // 输出到控制台
        if (opportunities.length > 0) {
            console.log("\nFound opportunities (sorted by spread):");
            opportunities.forEach(opportunity => {
                console.log(JSON.stringify(opportunity, null, 2));
            });
            console.log(`\nTotal opportunities found: ${opportunities.length}`);
            console.log(`Active Binance pairs: ${Object.keys(filteredBinanceTickers).length}`);
        } else {
            console.log("\nNo opportunities found.");
        }

        console.log("\nCheck completed at:", lastUpdateTime);
        console.log("----------------------------------------");

    } catch (error) {
        console.error("Error:", error);
    }
}

// API路由

// 获取所有交易机会
app.get('/api/opportunities', (req, res) => {
    res.json({
        "success": true,
        "data": {
            "opportunities": latestOpportunities,
            "lastUpdate": lastUpdateTime,
            "count": latestOpportunities.length,
        }
    });
});

// 获取特定交易对的机会
app.get('/api/opportunities/:symbol', (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const filteredOpportunities = latestOpportunities.filter(opp => opp.symbol === symbol);
    
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
app.get('/api/opportunities/pair/:pair', (req, res) => {
    const pair = req.params.pair.toUpperCase();
    const filteredOpportunities = latestOpportunities.filter(opp => opp.pair === pair);
    
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
app.get('/api/status', (req, res) => {
    res.json({
        "success": true,
        "data": {
            "lastUpdate": lastUpdateTime,
            "totalOpportunities": latestOpportunities.length,
            "isRunning": true
        }
    });
});

// 启动Express服务器
app.listen(port, () => {
    console.log(`API server is running on http://localhost:${port}`);
});

// 每5秒运行一次主函数
setInterval(main, 5000);
main(); // 立即运行一次
