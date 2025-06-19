const axios = require('axios');

// 存储各交易所资金费率信息
let bybitFundingMap = {};
let bitgetFundingMap = {};
let okxFundingMap = {};
let binanceFundingMap = {};

// 导出资金费率映射，用于其他模块访问
const getFundingMaps = () => ({
    bybitFundingMap,
    bitgetFundingMap,
    okxFundingMap,
    binanceFundingMap
});

// 获取Bybit资金费率信息的函数
async function fetchBybitFundingInfo() {
    try {
        // 获取交易对信息
        const instrumentsResponse = await axios.get('https://api.bybit.com/v5/market/instruments-info', {
            params: {
                category: 'linear',
                limit: 1000,
            }
        });

        // 获取当前资金费率信息
        const response = await axios.get('https://api.bybit.com/v5/market/tickers', {
            params: {
                category: 'linear'
            }
        });

        if (response.data.retCode === 0 && response.data.result.list) {
            for (const item of response.data.result.list) {
                // 将BTCUSDT转换为BTC/USDT:USDT格式
                const baseSymbol = item.symbol.replace('USDT', '/USDT:USDT');
                const symbol = `${baseSymbol}`;

                // 从instruments信息中获取fundingInterval
                const instrumentInfo = instrumentsResponse.data.result.list.find(
                    inst => inst.symbol === item.symbol
                );
                bybitFundingMap[symbol] = {
                    fundingRate: parseFloat(item.fundingRate),
                    fundingTime: parseInt(item.nextFundingTime),
                    fundingInterval: instrumentInfo ? (parseInt(instrumentInfo.fundingInterval) / 60) : 0 // 转换为小时，默认0
                };
            }
        }

        console.log(`Updated Bybit funding rates at ${new Date().toISOString()}`);
        console.log(`Total symbols with funding info: ${Object.keys(bybitFundingMap).length}`);
    } catch (error) {
        console.error('Error fetching Bybit funding rates:', error);
    }
}

// 获取Bitget资金费率信息的函数
async function fetchBitgetFundingInfo(latestOpportunities = []) {
    try {
        // 获取当前有套利机会的Bitget交易对
        const bitgetSymbols = new Set();
        for (const opportunity of latestOpportunities) {
            if (opportunity.exchangeA === 'BITGET' || opportunity.exchangeB === 'BITGET') {
                bitgetSymbols.add(opportunity.symbol);
            }
        }

        if (bitgetSymbols.size === 0) {
            console.log('No Bitget opportunities found, skipping funding rate update');
            return;
        }

        // 并行请求所有交易对的资金费率数据
        await Promise.all(Array.from(bitgetSymbols).map(async (symbol) => {
            try {
                // 转换符号格式 BTC/USDT:USDT -> BTCUSDT
                const paramsSymbol = symbol.split('/')[0] + 'USDT';

                // 获取具体交易对的资金费率信息
                const response = await axios.get('https://api.bitget.com/api/v2/mix/market/current-fund-rate', {
                    params: {
                        symbol: paramsSymbol,
                        productType: 'usdt-futures'
                    }
                });
                
                if (response.data.code === '00000' && response.data.data) {
                    const fundingData = response.data.data[0];
                    bitgetFundingMap[symbol] = {
                        fundingRate: parseFloat(fundingData.fundingRate) || 0,
                        fundingTime: parseInt(fundingData.nextUpdate) || 0,
                        fundingInterval: parseInt(fundingData.fundingRateInterval)  
                    };
                } 
            } catch (error) {
                console.error(`Error fetching funding rate for ${symbol}:`, error.response ? error.response.data : error.message);
            }
        }));

        console.log(`Updated Bitget funding rates at ${new Date().toISOString()}`);
        console.log(`Total symbols with funding info: ${Object.keys(bitgetFundingMap).length}`);

    } catch (error) {
        console.error('Error in fetchBitgetFundingInfo:', error);
    }
}

// 获取OKX资金费率信息的函数
async function fetchOKXFundingInfo(latestOpportunities = []) {
    try {
        // 获取当前有套利机会的OKX交易对
        const okxSymbols = new Set();
        for (const opportunity of latestOpportunities) {
            if (opportunity.exchangeA === 'OKX' || opportunity.exchangeB === 'OKX') {
                okxSymbols.add(opportunity.symbol);
            }
        }

        if (okxSymbols.size === 0) {
            console.log('No OKX opportunities found, skipping funding rate update');
            return;
        }

        // 并行请求所有交易对的资金费率数据
        await Promise.all(Array.from(okxSymbols).map(async (symbol) => {
            try {
                // 将 BTC/USDT:USDT 转换为 BTC-USDT-SWAP
                const okxSymbol = symbol.split('/')[0] + '-USDT-SWAP';

                const response = await axios.get('https://www.okx.com/api/v5/public/funding-rate', {
                    params: {
                        instId: okxSymbol
                    }
                });

                if (response.data.code === '0' && response.data.data && response.data.data.length > 0) {
                    const data = response.data.data[0];
                    const fundingTime = parseInt(data.fundingTime);
                    const nextFundingTime = parseInt(data.nextFundingTime);
                    const fundingInterval = Math.floor((nextFundingTime - fundingTime) / 1000 / 60 / 60); // 转换为小时

                    okxFundingMap[symbol] = {
                        fundingRate: parseFloat(data.fundingRate),
                        fundingTime: fundingTime,
                        fundingInterval: fundingInterval
                    };
                }
            } catch (error) {
                console.error(`Error fetching funding rate for ${symbol}:`, error.response ? error.response.data : error.message);
            }
        }));

        console.log(`Updated OKX funding rates at ${new Date().toISOString()}`);
        console.log(`Total symbols with funding info: ${Object.keys(okxFundingMap).length}`);

    } catch (error) {
        console.error('Error in fetchOKXFundingInfo:', error);
    }
}

// 获取Binance资金费率信息的函数
async function fetchBinanceFundingInfo() {
    try {
        // 获取资金费率数据
        const fundingResponse = await axios.get('https://fapi.binance.com/fapi/v1/premiumIndex');
        
        // 获取资金费率间隔数据
        const fundingInfoResponse = await axios.get('https://fapi.binance.com/fapi/v1/fundingInfo');

        // 处理资金费率数据
        for (const item of fundingResponse.data) {
            const symbol = item.symbol.replace('USDT', '/USDT:USDT');
            
            // 查找对应的fundingInterval
            const fundingInfo = fundingInfoResponse.data.find(info => info.symbol === item.symbol);
            const fundingInterval = fundingInfo ? parseInt(fundingInfo.fundingIntervalHours) : 8;

            binanceFundingMap[symbol] = {
                fundingRate: parseFloat(item.lastFundingRate),
                fundingTime: item.nextFundingTime,
                fundingInterval: fundingInterval
            };
        }

        console.log(`Updated Binance funding rates at ${new Date().toISOString()}`);
        console.log(`Total Binance symbols with funding info: ${Object.keys(binanceFundingMap).length}`);

    } catch (error) {
        console.error('Error fetching Binance funding rates:', error);
    }
}

module.exports = {
    fetchBybitFundingInfo,
    fetchBitgetFundingInfo,
    fetchOKXFundingInfo,
    fetchBinanceFundingInfo,
    getFundingMaps
};