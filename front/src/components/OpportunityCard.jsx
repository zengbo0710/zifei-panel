import React, { useState } from 'react';
import { format } from 'date-fns';
import PriceSpreadDetails from './PriceSpreadDetails';

const OpportunityCard = ({ opportunity }) => {
  // 状态管理
  const [showDetails, setShowDetails] = useState(false);
  
  // 处理交易方向和颜色
  const isLongAShortB = opportunity.opportunity === "LASB";
  
  // 格式化日期
  const formatFundingTime = (timestamp) => {
    if (!timestamp) return '未知';
    return format(new Date(timestamp), 'dd/MM/yyyy, HH:mm:ss');
  };
  
  // 格式化资金费率，添加符号和颜色
  const formatFundingRate = (rate) => {
    if (rate === undefined || rate === null) return '-';
    
    // 转换为百分比并保留4位小数
    const percentage = (rate * 100).toFixed(4) + '%';
    
    // 根据正负返回不同颜色的文本
    if (rate > 0) {
      return <span className="text-success">{percentage}</span>;
    } else if (rate < 0) {
      return <span className="text-danger">{percentage}</span>;
    }
    return <span>{percentage}</span>;
  };
  
  // 计算资金费率套利利润百分比
  const calculateFundingProfit = () => {
    const fundingRateA = opportunity['A-FUNDINGRATE'] || 0;
    const fundingRateB = opportunity['B-FUNDINGRATE'] || 0;
    
    // 计算资金费率差值的绝对值
    const fundingRateDiff = Math.abs(fundingRateA - fundingRateB);
    
    // 考虑资金费率周期差异进行标准化
    const periodA = opportunity['A-FUNDINGPERIOD'] || 8; // 默认8小时
    const periodB = opportunity['B-FUNDINGPERIOD'] || 8; // 默认8小时
    
    // 将两个交易所的资金费率标准化到同一周期（24小时）
    const normalizedRateA = (fundingRateA * 24) / periodA;
    const normalizedRateB = (fundingRateB * 24) / periodB;
    
    // 计算标准化后的资金费率差值（24小时周期的差值）
    const normalizedDiff = Math.abs(normalizedRateA - normalizedRateB);
    
    // 返回每个周期的利润和24小时标准化利润
    return {
      rawDiff: fundingRateDiff,
      normalizedDiff: normalizedDiff,
      // 单位为百分比
      profitPerPeriod: (fundingRateDiff * 100).toFixed(4) + '%',
      profitPer24h: (normalizedDiff * 100).toFixed(4) + '%'
    };
  };
  
  // 获取资金费率利润数据
  const fundingProfit = calculateFundingProfit();

  return (
    <div className="bg-white border border-border rounded-md overflow-hidden mb-4">
      {/* 卡片头部 - 交易对名称 */}
      <div className="bg-gray-50 px-4 py-3 border-b border-border">
        <h3 className="text-lg font-medium">{opportunity.symbol}</h3>
      </div>
      
      {/* 卡片内容 */}
      <div className="p-4">
        {/* 交易所组合和套利方向 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <span className="text-sm text-secondary">交易所组合</span>
            <div className="mt-1">
              <div className="flex items-center">
                <span className="font-medium">A: {opportunity.exchangeA}</span>
              </div>
              <div className="flex items-center mt-1">
                <span className="font-medium">B: {opportunity.exchangeB}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-secondary">价差方向</span>
            <div className="mt-1 flex items-center">
              {isLongAShortB ? (
                <>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium mr-2">
                    做空{opportunity.exchangeA}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    做多{opportunity.exchangeB}
                  </span>
                </>
              ) : (
                <>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium mr-2">
                    做多{opportunity.exchangeA}
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                    做空{opportunity.exchangeB}
                  </span>
                </>
              )}
            </div>
            
            {/* 差价百分比 */}
            <div className="mt-2">
              <span className="text-lg font-bold text-primary">
                {(opportunity.opportunityValue * 100).toFixed(4)}%
              </span>
            </div>
          </div>
        </div>
        
        {/* 价格信息 */}
        <div className="mb-4">
          <span className="text-sm text-secondary">价格</span>
          <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <div>
              <p className="text-sm">
                <span className="font-medium">{opportunity.exchangeA}:</span> 最新 {opportunity['A-LAST']}
              </p>
              <p className="text-sm mt-1">买/卖: {opportunity['A-BID']}/{opportunity['A-ASK']}</p>
            </div>
            <div>
              <p className="text-sm">
                <span className="font-medium">{opportunity.exchangeB}:</span> 最新 {opportunity['B-LAST']}
              </p>
              <p className="text-sm mt-1">买/卖: {opportunity['B-BID']}/{opportunity['B-ASK']}</p>
            </div>
          </div>
        </div>
        
        {/* 资金费率信息 */}
        <div>
          <span className="text-sm text-secondary">资金费率</span>
          <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <div className="mb-2 sm:mb-0">
              <p className="text-sm">
                <span className="font-medium">{opportunity.exchangeA}:</span> {formatFundingRate(opportunity['A-FUNDINGRATE'])} 
                {opportunity['A-FUNDINGPERIOD'] && ` (${opportunity['A-FUNDINGPERIOD']}h)`}
              </p>
            </div>
            <div>
              <p className="text-sm">
                <span className="font-medium">{opportunity.exchangeB}:</span> {formatFundingRate(opportunity['B-FUNDINGRATE'])} 
                {opportunity['B-FUNDINGPERIOD'] && ` (${opportunity['B-FUNDINGPERIOD']}h)`}
              </p>
            </div>
          </div>
        </div>
        
        {/* 资金费率套利利润 */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-sm text-secondary font-medium">资金费率套利利润</span>
          <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <div className="mb-2 sm:mb-0">
              <p className="text-sm">
                <span className="font-medium">每次结算:</span> 
                <span className="text-primary font-medium ml-1">{fundingProfit.profitPerPeriod}</span>
              </p>
            </div>
            <div>
              <p className="text-sm">
                <span className="font-medium">24小时收益:</span> 
                <span className="text-primary font-medium ml-1">{fundingProfit.profitPer24h}</span>
              </p>
            </div>
          </div>
        </div>
        
        {/* 下次资金费率时间 */}
        <div className="mt-3">
          <span className="text-sm text-secondary">下次资金费率时间</span>
          <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <div className="mb-2 sm:mb-0">
              <p className="text-sm">
                <span className="font-medium">{opportunity.exchangeA}:</span> <span className="text-xs sm:text-sm">{formatFundingTime(opportunity['A-FUNDINGTIME'])}</span>
              </p>
            </div>
            <div>
              <p className="text-sm">
                <span className="font-medium">{opportunity.exchangeB}:</span> <span className="text-xs sm:text-sm">{formatFundingTime(opportunity['B-FUNDINGTIME'])}</span>
              </p>
            </div>
          </div>
        </div>
        
        {/* 显示价差详情 */}
        {showDetails && <PriceSpreadDetails opportunity={opportunity} />}
        
        {/* 详细按钮 */}
        <div className="mt-4 flex justify-end">
          <button 
            onClick={() => setShowDetails(!showDetails)} 
            className="bg-primary hover:bg-primary/90 text-white px-4 py-1 rounded-md text-sm"
          >
            {showDetails ? '收起详情' : '价差详情'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;
