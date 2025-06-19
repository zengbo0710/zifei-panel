import React from 'react';

const PriceSpreadDetails = ({ opportunity }) => {
  // 处理交易方向和颜色
  const isLASB = opportunity.opportunity === "LASB";
  
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">价差详情</h4>
      
      <div className="bg-gray-50 p-3 rounded-md">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h5 className="text-xs text-secondary mb-1">LASB (Long A Short B)</h5>
            <div className={`font-medium ${isLASB ? 'text-primary font-bold' : ''}`}>
              {(opportunity.LASB * 100).toFixed(4)}%
              {isLASB && <span className="ml-2 text-xs text-primary">(当前选择)</span>}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              A-ASK / B-BID = {opportunity['A-ASK']} / {opportunity['B-BID']}
            </p>
          </div>
          
          <div>
            <h5 className="text-xs text-secondary mb-1">SALB (Short A Long B)</h5>
            <div className={`font-medium ${!isLASB ? 'text-primary font-bold' : ''}`}>
              {(opportunity.SALB * 100).toFixed(4)}%
              {!isLASB && <span className="ml-2 text-xs text-primary">(当前选择)</span>}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              A-BID / B-ASK = {opportunity['A-BID']} / {opportunity['B-ASK']}
            </p>
          </div>
        </div>
      </div>
      
      {/* 资金费率分析 */}
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">资金费率分析</h4>
        
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h5 className="text-xs text-secondary mb-1">A方向周期资金成本</h5>
              <div className="font-medium">
                {opportunity['A-FUNDINGRATE'] && opportunity['A-FUNDINGPERIOD'] ? 
                  `${(opportunity['A-FUNDINGRATE'] * 24 / opportunity['A-FUNDINGPERIOD'] * 100).toFixed(4)}%/天` : 
                  '无数据'}
              </div>
            </div>
            
            <div>
              <h5 className="text-xs text-secondary mb-1">B方向周期资金成本</h5>
              <div className="font-medium">
                {opportunity['B-FUNDINGRATE'] && opportunity['B-FUNDINGPERIOD'] ? 
                  `${(opportunity['B-FUNDINGRATE'] * 24 / opportunity['B-FUNDINGPERIOD'] * 100).toFixed(4)}%/天` : 
                  '无数据'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceSpreadDetails;
