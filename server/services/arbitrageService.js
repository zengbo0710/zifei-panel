const axios = require('axios');
const ccxt = require('ccxt');
const { createExchange } = require('../config/exchanges');
const { getFundingMaps } = require('./fundingService');

// 存储最新的交易机会和更新时间
let latestOpportunities = [];
let lastUpdateTime = null;

// 计算资金费率套利利润和最优交易方向
function calculateFundingProfit(fundingRateA, fundingRateB) {
    // 使用默认值0，确保计算不会出错
    const rateA = fundingRateA || 0;
    const rateB = fundingRateB || 0;
    
    // 计算资金费率差值的绝对值
    const fundingRateDiff = Math.abs(rateA - rateB);
    
    // 确定基于资金费率的最优交易方向
    // 资金费率套利逻辑：
    // - 正资金费率：做多方支付给做空方
    // - 负资金费率：做空方支付给做多方
    // 因此，我们希望：
    // - 在费率较低（或更负）的交易所做多（收取资金费）
    // - 在费率较高（或更正）的交易所做空（支付较少资金费或收取更多）
    const optimalDirection = rateA > rateB ? "SALB" : "LASB"; // 如果A费率大于B，则做空A做多B更有利
    
    // 返回资金费率套利利润数据，确保与API文档一致
    return {
        rawDiff: fundingRateDiff,
        // 原始值（小数）
        rawProfit: fundingRateDiff,
        // 格式化为百分比字符串（前端显示用）
        profitPerPeriod: (fundingRateDiff * 100).toFixed(4),
        // 基于资金费率的最优交易方向
        optimalDirection: optimalDirection
    };
}

// 创建交易对支持映射
let symbolMap = {};

// 筛选规则函数
function filterOpportunity(opportunity, okxTickers, bybitTickers, binanceTickers, bitgetTickers) {
    // 只对 Bitget 进行筛选
    if (opportunity.exchanges.includes('BITGET')) {
        // 获取 Bitget 的交易量
        const bitgetVolume = bitgetTickers[opportunity.symbol]?.volume || 0;
        
        // 获取 Bitget 的资金费率（根据是 A 还是 B 交易所选择正确的字段）
        const bitgetFundingRate = opportunity.exchanges[0] === 'BITGET' ? 
            Math.abs(opportunity['A-FUNDINGRATE']) : 
            Math.abs(opportunity['B-FUNDINGRATE']);
          
        // 交易量必须大于等于 100 万且资金费率绝对值大于等于 0.2%
        if (bitgetVolume < 1000000 || bitgetFundingRate < 0.001) {
            return false;
        }
    }

    return true;
}

// 获取最新的交易机会数据
const getLatestOpportunities = () => {
    // 确保返回格式与HTTP API完全一致
    return {
        success: true,
        data: {
            opportunities: latestOpportunities,
            lastUpdate: lastUpdateTime,
            count: latestOpportunities.length
        }
    };
};

// 获取按资费套利利润排序的前5个交易机会
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
    
    // 确保返回格式与API文档完全一致
    return {
        success: true,
        data: {
            opportunities: topOpportunities,
            lastUpdate: lastUpdateTime,
            count: topOpportunities.length
        }
    };
};

// 获取特定交易对的套利机会
const getOpportunitiesBySymbol = (symbol) => {
    if (!symbol) {
        return {
            success: false,
            error: '交易对参数不能为空'
        };
    }
    
    // 转换为大写以确保匹配
    const upperSymbol = symbol.toUpperCase();
    
    // 过滤出特定交易对的机会
    const filteredOpportunities = latestOpportunities.filter(opp => opp.symbol === upperSymbol);
    
    // 确保返回格式与API文档完全一致
    return {
        success: true,
        data: {
            opportunities: filteredOpportunities,
            lastUpdate: lastUpdateTime,
            count: filteredOpportunities.length
        }
    };
};

// 获取特定交易所对组合的套利机会
const getOpportunitiesByPair = (pair) => {
    if (!pair) {
        return {
            success: false,
            error: '交易所对参数不能为空'
        };
    }
    
    // 转换为大写以确保匹配
    const upperPair = pair.toUpperCase();
    
    // 过滤出特定交易所对的机会
    const filteredOpportunities = latestOpportunities.filter(opp => {
        // 检查格式为 "EXCHANGEA-EXCHANGEB" 的交易所组合
        const oppPair = `${opp.exchangeA}-${opp.exchangeB}`;
        return oppPair === upperPair;
    });
    
    // 确保返回格式与API文档完全一致
    return {
        success: true,
        data: {
            opportunities: filteredOpportunities,
            lastUpdate: lastUpdateTime,
            count: filteredOpportunities.length
        }
    };
};

// 主处理函数
async function main() {
    // 创建交易所实例
    const bitget = new ccxt.bitget();
    const okx = new ccxt.okx();
    const bybit = new ccxt.bybit();
    const binance = new ccxt.binance();

    try {
        // 先加载 Bitget 的市场数据和 ticker
        await bitget.loadMarkets();
        
        // 直接使用网络请求获取Bitget数据，包含资金费率
        const bitgetResponse = await axios.get('https://api.bitget.com/api/v2/mix/market/tickers', {
            params: {
                productType: 'USDT-FUTURES'
            }
        });
        
        // 处理 Bitget 数据
        const bitgetTickers = {};
        const { bitgetFundingMap } = getFundingMaps();
        
        if (bitgetResponse.data.code === '00000' && bitgetResponse.data.data) {
            for (const item of bitgetResponse.data.data) {
                const baseSymbol = item.symbol.replace('USDT', '');
                const symbol = `${baseSymbol}/USDT:USDT`;
                
                // 直接添加到 bitgetTickers，不进行筛选
                bitgetTickers[symbol] = {
                    symbol: symbol,
                    last: parseFloat(item.lastPr),
                    bid: parseFloat(item.bidPr),
                    ask: parseFloat(item.askPr),
                    high: parseFloat(item.high24h),
                    low: parseFloat(item.low24h),
                    volume: parseFloat(item.usdtVolume),
                    timestamp: parseInt(item.ts)
                };
                
                // 更新全局的 bitgetFundingMap，只设置资金费率
                if (!bitgetFundingMap[symbol]) {
                    bitgetFundingMap[symbol] = {
                        fundingRate: parseFloat(item.fundingRate),
                        fundingTime: 0,
                        fundingInterval: 0
                    };
                } else {
                    // 只更新资金费率，保留其他字段的现有值
                    bitgetFundingMap[symbol].fundingRate = parseFloat(item.fundingRate);
                }
            }
        }

        // 加载其他交易所的市场数据
        await Promise.all([okx.loadMarkets(), bybit.loadMarkets(), binance.loadMarkets()]);

        // 获取其他交易所的ticker数据
        const [okxTickers, bybitTickers, binanceTickers] = await Promise.all([
            okx.fetchTickers(undefined, { 'type': 'swap' }),
            bybit.fetchTickers(undefined, { 'category': 'linear' }),
            binance.fetchTickers(undefined, { 'type': 'future' })
        ]);

        // 过滤掉超过12小时未更新的币种
        const currentTime = Date.now();
        const twelveHoursInMs = 12 * 60 * 60 * 1000;
        const filteredBinanceTickers = {};

        for (const [symbol, ticker] of Object.entries(binanceTickers)) {
            if (ticker.timestamp && (currentTime - ticker.timestamp) <= twelveHoursInMs) {
                filteredBinanceTickers[symbol] = ticker;
                filteredBinanceTickers[symbol].ask = ticker.last;
                filteredBinanceTickers[symbol].bid = ticker.last;
            }
        }

        // 清空之前的映射
        symbolMap = {};

        // 添加所有通过筛选的 Bitget 交易对
        for (const symbol in bitgetTickers) {
            symbolMap[symbol] = {
                okx: false,
                bitget: true,
                bybit: false,
                binance: false,
                tickers: {
                    bitget: bitgetTickers[symbol]
                }
            };
        }

        // 只为已有的 Bitget 交易对添加其他交易所的支持情况
        for (const symbol in symbolMap) {
            // 添加 OKX 支持
            if (okxTickers[symbol]) {
                symbolMap[symbol].okx = true;
                symbolMap[symbol].tickers.okx = okxTickers[symbol];
            }

            // 添加 Bybit 支持
            if (bybitTickers[symbol]) {
                symbolMap[symbol].bybit = true;
                symbolMap[symbol].tickers.bybit = bybitTickers[symbol];
            }

            // 添加 Binance 支持
            if (filteredBinanceTickers[symbol]) {
                symbolMap[symbol].binance = true;
                symbolMap[symbol].tickers.binance = filteredBinanceTickers[symbol];
            }
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

            // 获取资金费率
            let fundingRateA = 0;
            let fundingRateB = 0;

            const { bybitFundingMap, bitgetFundingMap, okxFundingMap, binanceFundingMap } = getFundingMaps();

            if (exchangeAPair === 'BITGET' && bitgetFundingMap[symbol]) {
                fundingRateA = bitgetFundingMap[symbol].fundingRate;
            } else if (exchangeAPair === 'BYBIT' && bybitFundingMap[symbol]) {
                fundingRateA = bybitFundingMap[symbol].fundingRate || 0;
            } else if (exchangeAPair === 'OKX' && okxFundingMap[symbol]) {
                fundingRateA = okxFundingMap[symbol].fundingRate || 0;
            } else if (exchangeAPair === 'BINANCE' && binanceFundingMap[symbol]) {
                fundingRateA = binanceFundingMap[symbol].fundingRate || 0;
            }

            if (exchangeBPair === 'BITGET' && bitgetFundingMap[symbol]) {
                fundingRateB = bitgetFundingMap[symbol].fundingRate;
            } else if (exchangeBPair === 'BYBIT' && bybitFundingMap[symbol]) {
                fundingRateB = bybitFundingMap[symbol].fundingRate || 0;
            } else if (exchangeBPair === 'OKX' && okxFundingMap[symbol]) {
                fundingRateB = okxFundingMap[symbol].fundingRate || 0;
            } else if (exchangeBPair === 'BINANCE' && binanceFundingMap[symbol]) {
                fundingRateB = binanceFundingMap[symbol].fundingRate || 0;
            }

            // 方向判断修正
            let opportunityType = null;
            let opportunityValue = null;
            if (exchangeATicker.ask < exchangeBTicker.bid) {
                opportunityType = "LASB";
                opportunityValue = Math.abs(1 - LASB);
            } else if (exchangeATicker.bid > exchangeBTicker.ask) {
                opportunityType = "SALB";
                opportunityValue = Math.abs(1 - SALB);
            } else {
                // 没有套利空间
                return;
            }

            const opportunity = {
                symbol: symbol,
                exchanges: [exchangeAPair, exchangeBPair],
                'A-FUNDINGRATE': fundingRateA,
                'B-FUNDINGRATE': fundingRateB,
                LASB: LASB,
                SALB: SALB
            };

            // 使用筛选函数
            if (filterOpportunity(opportunity, okxTickers, bybitTickers, binanceTickers, bitgetTickers)) {
                // 计算资金费率套利利润和最优交易方向
                const fundingProfitData = calculateFundingProfit(fundingRateA, fundingRateB);
                
                const opportunityObj = {
                    "pair": "A-B",
                    "exchangeA": exchangeAPair,
                    "exchangeB": exchangeBPair,
                    "symbol": symbol,
                    "A-ASK": exchangeATicker.ask,
                    "A-BID": exchangeATicker.bid,
                    "A-LAST": exchangeATicker.last,
                    "B-ASK": exchangeBTicker.ask,
                    "B-BID": exchangeBTicker.bid,
                    "B-LAST": exchangeBTicker.last,
                    "LASB": LASB,
                    "SALB": SALB,
                    "timestamp": new Date().toISOString(),
                    "opportunity": opportunityType,          // 基于价格的机会类型（保留原有字段不变）
                    "opportunityValue": opportunityValue,
                    // 默认添加所有FUNDING字段
                    "A-FUNDINGRATE": fundingRateA,
                    "A-FUNDINGTIME": undefined,
                    "A-FUNDINGPERIOD": undefined,
                    "B-FUNDINGRATE": fundingRateB,
                    "B-FUNDINGTIME": undefined,
                    "B-FUNDINGPERIOD": undefined,
                    // 添加资金费率套利利润计算结果
                    "fundingProfit": fundingProfitData,
                    // 添加基于资金费率的最优交易方向
                    "optimalFundingDirection": fundingProfitData.optimalDirection
                };

                // 添加各交易所资金费率信息
                if (exchangeAPair === 'BYBIT' && bybitFundingMap[symbol]) {
                    opportunityObj["A-FUNDINGRATE"] = bybitFundingMap[symbol].fundingRate;
                    opportunityObj["A-FUNDINGTIME"] = bybitFundingMap[symbol].fundingTime;
                    opportunityObj["A-FUNDINGPERIOD"] = bybitFundingMap[symbol].fundingInterval;
                }
                if (exchangeBPair === 'BYBIT' && bybitFundingMap[symbol]) {
                    opportunityObj["B-FUNDINGRATE"] = bybitFundingMap[symbol].fundingRate;
                    opportunityObj["B-FUNDINGTIME"] = bybitFundingMap[symbol].fundingTime;
                    opportunityObj["B-FUNDINGPERIOD"] = bybitFundingMap[symbol].fundingInterval;
                }

                if (exchangeAPair === 'BITGET' && bitgetFundingMap[symbol]) {
                    opportunityObj["A-FUNDINGRATE"] = bitgetFundingMap[symbol].fundingRate;
                    opportunityObj["A-FUNDINGTIME"] = bitgetFundingMap[symbol].fundingTime;
                    opportunityObj["A-FUNDINGPERIOD"] = bitgetFundingMap[symbol].fundingInterval;
                }
                if (exchangeBPair === 'BITGET' && bitgetFundingMap[symbol]) {
                    opportunityObj["B-FUNDINGRATE"] = bitgetFundingMap[symbol].fundingRate;
                    opportunityObj["B-FUNDINGTIME"] = bitgetFundingMap[symbol].fundingTime;
                    opportunityObj["B-FUNDINGPERIOD"] = bitgetFundingMap[symbol].fundingInterval;
                }

                if (exchangeAPair === 'OKX' && okxFundingMap[symbol]) {
                    opportunityObj["A-FUNDINGRATE"] = okxFundingMap[symbol].fundingRate;
                    opportunityObj["A-FUNDINGTIME"] = okxFundingMap[symbol].fundingTime;
                    opportunityObj["A-FUNDINGPERIOD"] = okxFundingMap[symbol].fundingInterval;
                }
                if (exchangeBPair === 'OKX' && okxFundingMap[symbol]) {
                    opportunityObj["B-FUNDINGRATE"] = okxFundingMap[symbol].fundingRate;
                    opportunityObj["B-FUNDINGTIME"] = okxFundingMap[symbol].fundingTime;
                    opportunityObj["B-FUNDINGPERIOD"] = okxFundingMap[symbol].fundingInterval;
                }

                if (exchangeAPair === 'BINANCE' && binanceFundingMap[symbol]) {
                    opportunityObj["A-FUNDINGRATE"] = binanceFundingMap[symbol].fundingRate;
                    opportunityObj["A-FUNDINGTIME"] = binanceFundingMap[symbol].fundingTime;
                    opportunityObj["A-FUNDINGPERIOD"] = binanceFundingMap[symbol].fundingInterval;
                }
                if (exchangeBPair === 'BINANCE' && binanceFundingMap[symbol]) {
                    opportunityObj["B-FUNDINGRATE"] = binanceFundingMap[symbol].fundingRate;
                    opportunityObj["B-FUNDINGTIME"] = binanceFundingMap[symbol].fundingTime;
                    opportunityObj["B-FUNDINGPERIOD"] = binanceFundingMap[symbol].fundingInterval;
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

        // 按照价差绝对值倒序排序（默认排序）
        opportunities.sort((a, b) => b.opportunityValue - a.opportunityValue);
        
        // 更新最新的交易机会和更新时间
        latestOpportunities = opportunities;
        lastUpdateTime = new Date().toISOString();

        // 输出到控制台
        if (opportunities.length > 0) {
            console.log("\nFound opportunities (sorted by spread):");

            console.log(`\nTotal opportunities found: ${opportunities.length}`);
            console.log(`Active Binance pairs: ${Object.keys(filteredBinanceTickers).length}`);
            console.log(`Bitget pairs with high funding rate: ${Object.keys(bitgetTickers).length}`);
        } else {
            console.log("\nNo opportunities found.");
        }

        console.log("\nCheck completed at:", lastUpdateTime);
        console.log("----------------------------------------");

        // 返回最新的交易机会
        return { opportunities: latestOpportunities, lastUpdateTime };

    } catch (error) {
        console.error("Error:", error);
        return { opportunities: [], lastUpdateTime: null, error: error.message };
    }
}

// K线数据获取函数
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

module.exports = {
    main,
    getLatestOpportunities,
    getTopFundingProfitOpportunities,
    getOpportunitiesBySymbol,
    getOpportunitiesByPair,
    fetchKlineData
};