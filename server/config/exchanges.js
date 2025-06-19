const ccxt = require('ccxt');

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

const createExchange = (exchangeId) => {
    const normalizedId = exchangeId.toLowerCase();
    if (!supportedExchanges[normalizedId]) {
        throw new Error(`Unsupported exchange: ${exchangeId}. Supported exchanges: ${standardExchangeIds.join(', ')}`);
    }
    return new supportedExchanges[normalizedId]({
        'options': {
            'defaultType': 'swap',
            'enableRateLimit': true,
        },
    });
};

module.exports = {
    standardExchangeIds,
    supportedExchanges,
    createExchange
};