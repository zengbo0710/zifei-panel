import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import FilterBar from '../components/FilterBar';
import OpportunityCard from '../components/OpportunityCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ApiService from '../services/api';
import { format } from 'date-fns';

export default function Home() {
  // 状态管理
  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState('');
  
  // 筛选条件状态
  const [exchangeA, setExchangeA] = useState(null);
  const [exchangeB, setExchangeB] = useState(null);
  // 获取上次使用的排序选项(如果存在)，否则默认为每期资费套利利润
  const [sortType, setSortType] = useState(() => {
    // 客户端渲染时从localStorage读取保存的排序选项
    if (typeof window !== 'undefined') {
      const savedSortType = localStorage.getItem('preferredSortType');
      return savedSortType || 'funding-profit-period';
    }
    return 'funding-profit-period'; // 默认按每期资费套利利润排序
  });
  
  // 获取上次使用的刷新时间间隔(如果存在)，否则默认为7秒
  const [refreshInterval, setRefreshInterval] = useState(() => {
    // 客户端渲染时从localStorage读取保存的刷新时间间隔
    if (typeof window !== 'undefined') {
      const savedInterval = localStorage.getItem('preferredRefreshInterval');
      return savedInterval ? Number(savedInterval) : 7000;
    }
    return 7000; // 默认7秒刷新一次
  });
  
  // 自定义处理刷新间隔变更的函数
  const handleRefreshIntervalChange = (value) => {
    console.log('首页设置刷新间隔:', value);
    // 确保值是数字类型
    const numValue = Number(value);
    setRefreshInterval(numValue);
    // 保存到localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredRefreshInterval', numValue.toString());
    }
  };
  
  // 页面控制状态
  const [page, setPage] = useState(1);
  const itemsPerPage = 15; // 每页显示15个卡片
  
  // 获取套利机会数据
  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getOpportunities();
      
      if (response && response.success) {
        setOpportunities(response.data.opportunities);
        setLastUpdate(format(new Date(response.data.lastUpdate), 'dd/MM/yyyy, HH:mm:ss'));
      } else {
        setError('获取套利机会数据失败');
      }
    } catch (err) {
      setError('API请求错误: ' + (err.message || '未知错误'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // 首次加载和定期刷新 - 响应refreshInterval变化
  useEffect(() => {
    // 首次加载数据
    fetchOpportunities();
    
    console.log(`设置刷新间隔: ${refreshInterval}ms`);
    
    // 设置自动刷新 - 使用用户选择的refreshInterval
    const intervalTimer = setInterval(() => {
      fetchOpportunities();
    }, refreshInterval);
    
    // 清理定时器
    return () => clearInterval(intervalTimer);
  }, [refreshInterval]); // 依赖于refreshInterval，当其变化时重新设置定时器
  
  // 保存排序选择到localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredSortType', sortType);
    }
  }, [sortType]);
  
  // 保存刷新时间间隔到localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredRefreshInterval', refreshInterval.toString());
    }
  }, [refreshInterval]);

  // 筛选和排序数据
  useEffect(() => {
    let filtered = [...opportunities];
    
    // 按交易所A筛选
    if (exchangeA) {
      filtered = filtered.filter(item => item.exchangeA === exchangeA.value);
    }
    
    // 按交易所B筛选
    if (exchangeB) {
      filtered = filtered.filter(item => item.exchangeB === exchangeB.value);
    }
    
    // 已移除按交易对筛选
    
    // 应用排序逻辑
    if (sortType === 'price-diff') {
      // 按价差绝对值排序（从大到小）
      filtered.sort((a, b) => {
        // 确保使用数值比较
        const aValue = parseFloat(a.opportunityValue) || 0;
        const bValue = parseFloat(b.opportunityValue) || 0;
        return bValue - aValue;
      });
    } else if (sortType === 'funding-abs') {
      // 按资费绝对值排序（从大到小）
      filtered.sort((a, b) => {
        try {
          // 转换为数值并计算资费率绝对值之和
          const aRateA = parseFloat(a['A-FUNDINGRATE']) || 0;
          const aRateB = parseFloat(a['B-FUNDINGRATE']) || 0;
          const aFundingAbs = Math.abs(aRateA) + Math.abs(aRateB);
          
          const bRateA = parseFloat(b['A-FUNDINGRATE']) || 0;
          const bRateB = parseFloat(b['B-FUNDINGRATE']) || 0;
          const bFundingAbs = Math.abs(bRateA) + Math.abs(bRateB);
          
          return bFundingAbs - aFundingAbs;
        } catch (err) {
          console.error("资费绝对值排序出错:", err);
          return 0;
        }
      });
    } else if (sortType === 'funding-diff') {
      // 按资费差值排序（从大到小）
      filtered.sort((a, b) => {
        try {
          // 转换为数值并计算差值
          const aRateA = parseFloat(a['A-FUNDINGRATE']) || 0;
          const aRateB = parseFloat(a['B-FUNDINGRATE']) || 0;
          const aFundingDiff = Math.abs(aRateA - aRateB);
          
          const bRateA = parseFloat(b['A-FUNDINGRATE']) || 0;
          const bRateB = parseFloat(b['B-FUNDINGRATE']) || 0;
          const bFundingDiff = Math.abs(bRateA - bRateB);
          
          return bFundingDiff - aFundingDiff;
        } catch (err) {
          console.error("资费差值排序出错:", err);
          return 0;
        }
      });
    } else if (sortType === 'funding-profit-period') {
      try {
        // 创建一个单独的排序函数，确保强类型比较
        const getFundingDiff = (item) => {
          // 严格处理资金费率，确保是数值类型
          let rateA = 0, rateB = 0;
          
          // 处理各种可能的格式：字符串、数字、百分比、null、undefined
          if (typeof item['A-FUNDINGRATE'] === 'string') {
            rateA = parseFloat(item['A-FUNDINGRATE'].replace('%', '')) || 0;
          } else if (typeof item['A-FUNDINGRATE'] === 'number') {
            rateA = item['A-FUNDINGRATE'];
          }
          
          if (typeof item['B-FUNDINGRATE'] === 'string') {
            rateB = parseFloat(item['B-FUNDINGRATE'].replace('%', '')) || 0;
          } else if (typeof item['B-FUNDINGRATE'] === 'number') {
            rateB = item['B-FUNDINGRATE'];
          }
          
          // 计算绝对差值并返回
          return Math.abs(rateA - rateB);
        };
        
        // 创建临时存储用于比较的数组
        const itemsWithDiff = filtered.map(item => ({
          ...item,
          _fundingDiff: getFundingDiff(item)
        }));
        
        // 输出数据集大小
        console.log(`开始资金费率套利利润排序，数据项数：${itemsWithDiff.length}`);
        
        // 按资金费率差值排序
        itemsWithDiff.sort((a, b) => {
          if (a._fundingDiff > b._fundingDiff) return -1;
          if (a._fundingDiff < b._fundingDiff) return 1;
          return 0;
        });
        
        // 输出排序前20项用于验证，查看按百分比从大到小是否正确
        console.log("排序后前20项资金费率套利利润:");
        for (let i = 0; i < Math.min(20, itemsWithDiff.length); i++) {
          const item = itemsWithDiff[i];
          console.log(`${i+1}. ${item.symbol}: ${(item._fundingDiff*100).toFixed(4)}%`);
        }
        
        // 修正UI显示，确保正确反映排序结果
        filtered = itemsWithDiff;
      } catch (err) {
        console.error("资金费率套利利润排序出错:", err);
      }
    // 移除24小时资金费率套利利润排序逻辑，按用户要求仅保留当前周期排序
    } else if (sortType === 'symbol') {
      // 按交易对名称字母排序
      filtered.sort((a, b) => a.symbol.localeCompare(b.symbol));
    }
    
    setFilteredOpportunities(filtered);
    // 重置页码
    setPage(1);
  }, [opportunities, exchangeA, exchangeB, sortType]);
  
  // 计算当前页显示的套利机会
  const currentOpportunities = filteredOpportunities.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  // 计算总页数
  const totalPages = Math.ceil(filteredOpportunities.length / itemsPerPage);

  return (
    <div className="min-h-screen py-8">
      <Head>
        <title>套利机会面板</title>
        <meta name="description" content="实时显示各交易所间的套利机会" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container-custom">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">套利机会面板</h1>
          <p className="text-secondary">实时监控不同交易所间的套利价差和资金费率</p>
        </div>
        
        {/* 筛选栏 */}
        <FilterBar
          exchangeA={exchangeA}
          setExchangeA={setExchangeA}
          exchangeB={exchangeB}
          setExchangeB={setExchangeB}
          sortType={sortType}
          setSortType={setSortType}
          refreshInterval={refreshInterval}
          setRefreshInterval={handleRefreshIntervalChange}
          lastUpdate={lastUpdate}
        />
        
        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {/* 加载状态 */}
        {loading && opportunities.length === 0 && (
          <div className="py-12">
            <LoadingSpinner size="large" />
            <p className="text-center text-secondary mt-4">正在加载套利机会数据...</p>
          </div>
        )}
        
        {/* 无数据提示 */}
        {!loading && filteredOpportunities.length === 0 && (
          <div className="bg-gray-50 border border-border rounded-md p-8 text-center">
            <p className="text-secondary">没有找到符合筛选条件的套利机会</p>
          </div>
        )}
        
        {/* 套利机会卡片列表 */}
        {!loading && filteredOpportunities.length > 0 && (
          <div>
            {/* 结果统计 */}
            <p className="mb-4 text-secondary text-sm">
              找到 {filteredOpportunities.length} 个套利机会，显示 {(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, filteredOpportunities.length)} 条
            </p>
            
            {/* 卡片列表 - 移动端一列，平板两列，桌面三列 */}
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {currentOpportunities.map((opportunity, index) => (
                <OpportunityCard key={index} opportunity={opportunity} />
              ))}
            </div>
            
            {/* 分页控制 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  {/* 上一页按钮 */}
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className={`px-3 py-1 rounded-md ${
                      page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-secondary'
                    }`}
                  >
                    上一页
                  </button>
                  
                  {/* 页码 */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // 计算显示哪些页码
                    let pageNum;
                    if (totalPages <= 5) {
                      // 少于5页，显示所有页码
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      // 当前页在前3页，显示1-5
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      // 当前页在后3页，显示最后5页
                      pageNum = totalPages - 4 + i;
                    } else {
                      // 当前页在中间，显示前后各2页
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md ${
                          pageNum === page ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200 text-secondary'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {/* 下一页按钮 */}
                  <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-secondary'
                    }`}
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* 页脚 */}
      <footer className="mt-12 py-6 border-t border-border">
        <div className="container-custom text-center text-secondary text-sm">
          &copy; {new Date().getFullYear()} 套利机会监控面板
        </div>
      </footer>
    </div>
  );
}
