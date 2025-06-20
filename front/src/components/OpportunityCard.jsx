import React, { useState } from 'react';
import { format } from 'date-fns';
import PriceSpreadDetails from './PriceSpreadDetails';

const OpportunityCard = ({ opportunity }) => {
  // 状态管理
  const [showDetails, setShowDetails] = useState(false);
  
  // 处理交易方向和颜色 - 优先使用基于资金费率的最优方向，如果不存在则使用基于价格的方向
  const isLongAShortB = opportunity.optimalFundingDirection ? 
    opportunity.optimalFundingDirection === "LASB" : 
    opportunity.opportunity === "LASB";
  
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
  
  // 获取资金费率套利利润数据
  // 如果后端已提供fundingProfit数据就使用后端数据，否则使用兼容性处理（防止老版本API）
  const fundingProfit = opportunity.fundingProfit || {
    rawDiff: Math.abs((opportunity['A-FUNDINGRATE'] || 0) - (opportunity['B-FUNDINGRATE'] || 0)),
    profitPerPeriod: (Math.abs((opportunity['A-FUNDINGRATE'] || 0) - (opportunity['B-FUNDINGRATE'] || 0)) * 100).toFixed(4)
  };

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
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium mr-2">
                    做多{opportunity.exchangeA}
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                    做空{opportunity.exchangeB}
                  </span>
                </>
              ) : (
                <>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium mr-2">
                    做空{opportunity.exchangeA}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    做多{opportunity.exchangeB}
                  </span>
                </>
              )}
            </div>
            
            {/* 资金费率套利利润收益率 */}
            <div className="mt-2">
              <span className="text-sm text-secondary font-medium">资费套利利润：</span>
              <span className="text-lg font-bold text-primary ml-1">
                {fundingProfit.profitPerPeriod}%
              </span>
              <div className="text-xs text-gray-500 mt-1">
                (按照上方交易方向操作可获得最优资金费率收益)
              </div>
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
        
        {/* 价差收益 */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-sm text-secondary font-medium">价差收益</span>
          <div className="mt-1">
            <p className="text-sm">
              <span className="font-medium">收益率:</span> 
              <span className="text-primary font-medium ml-1">{(opportunity.opportunityValue * 100).toFixed(4)}%</span>
            </p>
          </div>
        </div>
        
        {/* 下次资金费率时间 - 只要有数据就显示，不再要求两个交易所时间相同 */}
        <div className="mt-3">
          <span className="text-sm text-secondary">下次资金费率时间</span>
          <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <div className="mb-2 sm:mb-0">
              <p className="text-sm">
                <span className="font-medium">{opportunity.exchangeA}:</span> 
                <span className="text-xs sm:text-sm">
                  {opportunity['A-FUNDINGTIME'] ? formatFundingTime(opportunity['A-FUNDINGTIME']) : "暂无数据"}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm">
                <span className="font-medium">{opportunity.exchangeB}:</span> 
                <span className="text-xs sm:text-sm">
                  {opportunity['B-FUNDINGTIME'] ? formatFundingTime(opportunity['B-FUNDINGTIME']) : "暂无数据"}
                </span>
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
