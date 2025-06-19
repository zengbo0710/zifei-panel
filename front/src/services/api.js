import axios from 'axios';

// 使用环境变量获取API基础URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// API服务类，与后端服务集成
const ApiService = {
  // 获取所有套利机会
  getOpportunities: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/opportunities`);
      return response.data;
    } catch (error) {
      console.error('获取套利机会失败:', error);
      throw error;
    }
  },
  
  // 获取特定交易对的套利机会
  getOpportunitiesBySymbol: async (symbol) => {
    try {
      // 对符号进行URL编码，避免特殊字符问题
      const encodedSymbol = encodeURIComponent(symbol);
      const response = await axios.get(`${API_BASE_URL}/opportunities/${encodedSymbol}`);
      return response.data;
    } catch (error) {
      console.error(`获取交易对 ${symbol} 的套利机会失败:`, error);
      throw error;
    }
  },
  
  // 获取特定交易所组合的套利机会
  getOpportunitiesByPair: async (exchangePair) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/opportunities/pair/${exchangePair}`);
      return response.data;
    } catch (error) {
      console.error(`获取交易所组合 ${exchangePair} 的套利机会失败:`, error);
      throw error;
    }
  },
  
  // 获取系统状态，包括资金费率信息
  getStatus: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/status`);
      return response.data;
    } catch (error) {
      console.error('获取系统状态失败:', error);
      throw error;
    }
  }
};

export default ApiService;
