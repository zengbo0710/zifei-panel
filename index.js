const ccxt = require('ccxt');
const express = require('express');
const cors = require('cors');
const axios = require('axios'); // 添加axios依赖

const app = express();
const port = 3000;

// 设置静态文件目录
app.use(express.static('public'));

// 渲染index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// 配置CORS选项
const corsOptions = {
    origin: '*', // 允许所有域名访问，生产环境建议设置为具体的域名
    methods: ['GET', 'POST', 'OPTIONS'], // 允许的HTTP方法
    allowedHeaders: ['Content-Type', 'Authorization'], // 允许的请求头
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'], // 允许客户端访问的响应头
    credentials: true, // 允许发送cookies
    maxAge: 86400 // 预检请求的缓存时间（秒）
};

// 启用CORS
app.use(cors(corsOptions));

// 支持的交易所列表和ID映射
const supportedExchanges = {
    // 标准ID映射
    'binance': ccxt.binance,
    'okx': ccxt.okx,
    'bitget': ccxt.bitget,
    'gateio': ccxt.gateio,
    'bybit': ccxt.bybit,
    // 别名映射
    'binanceus': ccxt.binanceus,
    'binanceusdm': ccxt.binanceusdm,
    'binancecoinm': ccxt.binancecoinm,
    'okex': ccxt.okx, // OKX的旧名称
    'gate': ccxt.gateio, // Gate.io的别名
    'huobi': ccxt.huobi,
    'kucoin': ccxt.kucoin,
    'mexc': ccxt.mexc,
    'phemex': ccxt.phemex
};

// 标准交易所ID列表（不包含别名）
const standardExchangeIds = [
    'binance',
    'okx',
    'bitget',
    'gateio',
    'bybit',
    'huobi',
    'kucoin',
    'mexc',
    'phemex'
];

// 创建交易所实例的工厂函数
const createExchange = (exchangeId) => {
    const normalizedId = exchangeId.toLowerCase();
    if (!supportedExchanges[normalizedId]) {
        throw new Error(`Unsupported exchange: ${exchangeId}. Supported exchanges: ${standardExchangeIds.join(', ')}`);
    }
    return new supportedExchanges[normalizedId]({
        'options':{'defaultType':'swap','enableRateLimit': true,
    },
    });
};

// 统一交易对格式
const normalizeSymbol = (symbol, exchange) => {
    if (exchange.toLowerCase() === 'bybit') {
        // 处理 Bybit 的格式 BTC/USD:USDT -> BTC/USDT
        return symbol.replace('/USD:USDT', '/USDT');
    } else if (exchange.toLowerCase() === 'okx') {
        // 处理 OKX 的格式 BTC-USDT-SWAP -> BTC/USDT
        return symbol.replace('-SWAP', '').replace('-', '/');
    } else if (exchange.toLowerCase() === 'bitget') {
        // 处理 Bitget 的格式 BTC-USDT-SWAP -> BTC/USDT
        return symbol.replace('-SWAP', '').replace('-', '/');
    } else {
        // 其他交易所保持原样
        return symbol;
    }
};

// 获取所有交易所的永续合约交易对数据
app.get('/api/all-swap-tickers', async (req, res) => {
    try {
        const results = {};
        const errors = {};

        // 并行获取所有交易所的数据，只使用标准ID
        await Promise.all(standardExchangeIds.map(async (exchangeId) => {
            try {
                const exchange = createExchange(exchangeId);
                
                // 加载市场数据
                // await exchange.loadMarkets();
                
                // 获取所有永续合约的ticker数据
                const tickers = await exchange.fetchTickers(undefined, { subType: 'linear' });
                
                // 处理并返回数据
                const swapTickers = {};
                for (const [symbol, ticker] of Object.entries(tickers)) {
                    swapTickers[symbol] = {
                        symbol: symbol,
                        last: ticker.last,
                        bid: ticker.bid,
                        ask: ticker.ask,
                        high: ticker.high,
                        low: ticker.low,
                        volume: ticker.quoteVolume,
                        timestamp: ticker.timestamp
                    };
                }
                
                results[exchangeId] = swapTickers;
            } catch (error) {
                errors[exchangeId] = error.message;
            }
        }));

        res.json({
            success: true,
            data: results,
            errors: errors
        });
    } catch (error) {
        console.error('Error fetching all swap tickers:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// K线数据接口
app.get('/api/kline', async (req, res) => {
    try {
        const { 
            exchange = 'binance',
            symbol = 'BTC/USDT', 
            timeframe = '1m', 
            limit = 100 
        } = req.query;
        
        // 创建交易所实例
        const exchangeInstance = createExchange(exchange);
        
        // 获取K线数据
        const ohlcv = await exchangeInstance.fetchOHLCV(symbol, timeframe, undefined, limit);
        
        // 格式化数据
        const klineData = ohlcv.map(item => ({
            timestamp: item[0],
            open: item[1],
            high: item[2],
            low: item[3],
            close: item[4],
            volume: item[5]
        }));

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

// 买卖盘数据接口
app.get('/api/orderbook', async (req, res) => {
    try {
        const { 
            exchange = 'binance',
            symbol = 'BTC/USDT',
            limit = 20 // 默认返回20档深度
        } = req.query;
        
        // 创建交易所实例
        const exchangeInstance = createExchange(exchange);
        
        // 获取订单簿数据
        const orderbook = await exchangeInstance.fetchOrderBook(symbol, limit);
        
        // 格式化数据
        const orderbookData = {
            timestamp: orderbook.timestamp,
            datetime: orderbook.datetime,
            nonce: orderbook.nonce,
            bids: orderbook.bids.map(bid => ({
                price: bid[0],
                amount: bid[1]
            })),
            asks: orderbook.asks.map(ask => ({
                price: ask[0],
                amount: ask[1]
            }))
        };

        res.json({
            success: true,
            data: orderbookData
        });
    } catch (error) {
        console.error('Error fetching orderbook data:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取单个交易所的永续合约交易对数据
app.get('/api/swap-tickers', async (req, res) => {
    try {
        const { exchange = 'binance' } = req.query;
        
        const exchangeInstance = createExchange(exchange);
        
        // 加载市场数据
        await exchangeInstance.loadMarkets();
        
        // 获取永续合约的ticker数据
        let tickers;
        if (exchange.toLowerCase() === 'bitget') {
            // 直接使用网络请求获取Bitget数据
            const response = await axios.get('https://api.bitget.com/api/v2/mix/market/tickers', {
                params: {
                    productType: 'USDT-FUTURES'
                }
            });
            
            // 处理Bitget返回的数据
            tickers = {};
            for (const item of response.data.data) {
                // 将BTCUSDT转换为BTC/USDT:USDT
                const baseSymbol = item.symbol.replace('USDT', '');
                const symbol = `${baseSymbol}/USDT:USDT`;
                tickers[symbol] = {
                    symbol: symbol,
                    last: parseFloat(item.lastPr),
                    bid: parseFloat(item.bidPr),
                    ask: parseFloat(item.askPr),
                    high: parseFloat(item.high24h),
                    low: parseFloat(item.low24h),
                    volume: parseFloat(item.usdtVolume),
                    timestamp: parseInt(item.ts),
                    fundingRate: parseFloat(item.fundingRate)
                };
            }
        } else if (exchange.toLowerCase() === 'bybit') {
            // 获取交易对信息
            const instrumentsResponse = await axios.get('https://api.bybit.com/v5/market/instruments-info', {
                params: {
                    category: 'linear'
                }
            });

            // 创建symbol到fundingInterval的映射
            const fundingIntervals = {};
            if (instrumentsResponse.data.retCode === 0 && instrumentsResponse.data.result.list) {
                for (const item of instrumentsResponse.data.result.list) {
                    fundingIntervals[item.symbol] = parseInt(item.fundingInterval);
                }
            }

            // 获取ticker数据
            const response = await axios.get('https://api.bybit.com/v5/market/tickers', {
                params: {
                    category: 'linear'
                }
            });
            
            // 处理Bybit返回的数据
            tickers = {};
            for (const item of response.data.result.list) {
                // 将BTCUSD转换为BTC/USD:USDT
                const baseSymbol = item.symbol.replace('USDT', '');
                const symbol = `${baseSymbol}/USDT:USDT`;
                tickers[symbol] = {
                    symbol: symbol,
                    last: parseFloat(item.lastPrice),
                    bid: parseFloat(item.bid1Price),
                    ask: parseFloat(item.ask1Price),
                    high: parseFloat(item.highPrice24h),
                    low: parseFloat(item.lowPrice24h),
                    volume: parseFloat(item.turnover24h),
                    timestamp: response.data.time,
                    fundingRate: parseFloat(item.fundingRate),
                    fundingTime: parseInt(item.nextFundingTime),
                    fundingRateInterval: Math.floor(fundingIntervals[item.symbol] / 60) // 转换为小时
                };
            }
        } else if (exchange.toLowerCase() === 'binance') {
            // 获取ticker数据
            tickers = await exchangeInstance.fetchTickers(undefined, { subType: 'linear' });
            
            // 获取资金费率数据
            const fundingResponse = await axios.get('https://fapi.binance.com/fapi/v1/premiumIndex');
            const fundingData = {};
            for (const item of fundingResponse.data) {
                const symbol = item.symbol.replace('USDT', '/USDT:USDT');
                fundingData[symbol] = {
                    fundingRate: parseFloat(item.lastFundingRate),
                    fundingTime: item.nextFundingTime
                };
            }

            // 获取资金费率间隔数据
            const fundingInfoResponse = await axios.get('https://fapi.binance.com/fapi/v1/fundingInfo');
            const fundingIntervals = {};
            for (const item of fundingInfoResponse.data) {
                const symbol = item.symbol.replace('USDT', '/USDT:USDT');
                fundingIntervals[symbol] = parseInt(item.fundingIntervalHours);
            }
            
            // 处理CCXT返回的数据，添加fundingRate和fundingTime字段
            for (const [symbol, ticker] of Object.entries(tickers)) {
                tickers[symbol] = {
                    symbol: symbol,
                    last: ticker.last,
                    bid: ticker.bid,
                    ask: ticker.ask,
                    high: ticker.high,
                    low: ticker.low,
                    volume: ticker.quoteVolume,
                    timestamp: ticker.timestamp,
                    fundingRate: fundingData[symbol]?.fundingRate || 0,
                    fundingTime: fundingData[symbol]?.fundingTime || 0,
                    fundingRateInterval: fundingIntervals[symbol] || 8 // 默认值为8小时
                };
            }
        } else {
            // 其他交易所使用CCXT
            tickers = await exchangeInstance.fetchTickers(undefined, { subType: 'linear' });
            
            // 处理CCXT返回的数据，添加fundingRate字段
            for (const [symbol, ticker] of Object.entries(tickers)) {
                tickers[symbol] = {
                    symbol: symbol,
                    last: ticker.last,
                    bid: ticker.bid,
                    ask: ticker.ask,
                    high: ticker.high,
                    low: ticker.low,
                    volume: ticker.quoteVolume,
                    timestamp: ticker.timestamp,
                    fundingRate: 0,
                    fundingTime: 0
                };
            }
        }

        res.json({
            success: true,
            data: tickers
        });
    } catch (error) {
        console.error(`Error fetching swap tickers for ${req.query.exchange}:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 资费查询接口
app.get('/api/funding-rates', async (req, res) => {
    try {
        const { 
            exchange = 'binance'
        } = req.query;
        
        const exchangeInstance = createExchange(exchange);
        
        // 加载市场数据
        await exchangeInstance.loadMarkets();
        
        // 获取资费数据
        let fundingRates;
        if (exchange.toLowerCase() === 'bitget') {
            // Bitget需要指定type参数
            fundingRates = await exchangeInstance.fetchFundingRates(undefined, { type: 'swap' });
        } else if (exchange.toLowerCase() === 'okx') {
            // OKX需要指定instType参数
            fundingRates = await exchangeInstance.fetchFundingRates(undefined, { instType: 'SWAP' });
        } else {
            // 其他交易所使用默认参数
            fundingRates = await exchangeInstance.fetchFundingRates();
        }
        
        // 处理并返回数据
        const formattedRates = {};
        for (const [symbol, rate] of Object.entries(fundingRates)) {
            formattedRates[symbol] = {
                symbol: symbol,
                timestamp: rate.timestamp,
                datetime: rate.datetime,
                fundingRate: rate.fundingRate,
                nextFundingTime: rate.nextFundingTime
            };
        }

        res.json({
            success: true,
            data: formattedRates
        });
    } catch (error) {
        console.error(`Error fetching funding rates for ${req.query.exchange}:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取Bitget多个交易对的资金费率数据
app.get('/api/bitget-funding-rates', async (req, res) => {
    try {
        const { symbols = '' } = req.query;
        if (!symbols) {
            return res.status(400).json({
                success: false,
                error: 'Symbols parameter is required'
            });
        }

        const symbolList = symbols.split(',');
        const results = {};

        // 并行请求所有交易对的资金费率数据
        await Promise.all(symbolList.map(async (symbol) => {
            try {
                // 将 BTC/USD:USDT 转换为 BTCUSDT
                const bitgetSymbol = symbol.replace('/USDT:USDT', 'USDT');
                const response = await axios.get('https://api.bitget.com/api/v2/mix/market/current-fund-rate', {
                    params: {
                        symbol: bitgetSymbol,
                        productType: 'usdt-futures'
                    }
                });

                if (response.data.code === '00000' && response.data.data && response.data.data.length > 0) {
                    const data = response.data.data[0];
                    results[symbol] = {
                        symbol: symbol,
                        fundingRate: parseFloat(data.fundingRate),
                        fundingTime: parseInt(data.nextUpdate),
                        fundingRateInterval: parseInt(data.fundingRateInterval),
                        minFundingRate: parseFloat(data.minFundingRate),
                        maxFundingRate: parseFloat(data.maxFundingRate)
                    };
                }
            } catch (error) {
                console.error(`Error fetching funding rate for ${symbol}:`, error);
            }
        }));

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Error fetching Bitget funding rates:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取OKX多个交易对的资金费率数据
app.get('/api/okx-funding-rates', async (req, res) => {
    try {
        const { symbols = '' } = req.query;
        if (!symbols) {
            return res.status(400).json({
                success: false,
                error: 'Symbols parameter is required'
            });
        }

        const symbolList = symbols.split(',');
        const results = {};

        // 并行请求所有交易对的资金费率数据
        await Promise.all(symbolList.map(async (symbol) => {
            try {
                // 将 BTC/USD:USDT 转换为 BTC-USDT-SWAP
                const okxSymbol = symbol.replace('/USDT:USDT', '-USDT-SWAP');
                const response = await axios.get('https://www.okx.com/api/v5/public/funding-rate', {
                    params: {
                        instId: okxSymbol
                    }
                });

                if (response.data.code === '0' && response.data.data && response.data.data.length > 0) {
                    const data = response.data.data[0];
                    const fundingTime = parseInt(data.fundingTime);
                    const nextFundingTime = parseInt(data.nextFundingTime);
                    const fundingRateInterval = Math.floor((nextFundingTime - fundingTime) / 1000 / 60 / 60); // 转换为小时

                    results[symbol] = {
                        symbol: symbol,
                        fundingRate: parseFloat(data.fundingRate),
                        fundingTime: fundingTime,
                        fundingRateInterval: fundingRateInterval,
                        minFundingRate: parseFloat(data.minFundingRate),
                        maxFundingRate: parseFloat(data.maxFundingRate)
                    };
                }
            } catch (error) {
                console.error(`Error fetching funding rate for ${symbol}:`, error);
            }
        }));

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Error fetching OKX funding rates:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
}); 