import React from 'react';
import Select from 'react-select';

// 交易所选择器组件
const ExchangeSelect = ({ label, value, onChange, options }) => {
  const customStyles = {
    control: (provided) => ({
      ...provided,
      border: '1px solid #e2e8f0',
      borderRadius: '0.375rem',
      boxShadow: 'none',
      '&:hover': {
        border: '1px solid #cbd5e1',
      },
      minHeight: '40px',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#94a3b8',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f1f5f9' : null,
      color: state.isSelected ? 'white' : '#1e293b',
      cursor: 'pointer',
      ':active': {
        backgroundColor: '#3b82f6',
        color: 'white',
      },
    }),
  };

  return (
    <div className="w-full">
      <Select
        styles={customStyles}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={label}
        isClearable
        isSearchable
        className="text-sm"
      />
    </div>
  );
};

// 筛选栏组件
const FilterBar = ({ 
  exchangeA, 
  setExchangeA, 
  exchangeB, 
  setExchangeB, 
  sortType,
  setSortType,
  refreshInterval,
  setRefreshInterval,
  lastUpdate
}) => {
  // 交易所选项
  const exchangeOptions = [
    { value: 'BINANCE', label: 'Binance' },
    { value: 'BYBIT', label: 'Bybit' },
    { value: 'OKX', label: 'OKX' },
    { value: 'BITGET', label: 'Bitget' },
  ];

  // 排序类型选项 - 移除24小时收益选项
  const sortOptions = [
    { value: 'funding-profit-period', label: '资费套利利润' },
    { value: 'price-diff', label: '价差绝对值' },
    { value: 'funding-abs', label: '资费绝对值' },
    { value: 'funding-diff', label: '资费差值' },
    { value: 'symbol', label: '交易对名称' },
  ];

  // 刷新时间选项
  const refreshOptions = [
    { value: 7000, label: '7秒' },
    { value: 15000, label: '15秒' },
    { value: 20000, label: '20秒' },
    { value: 30000, label: '30秒' },
    { value: 40000, label: '40秒' },
    { value: 50000, label: '50秒' },
    { value: 60000, label: '60秒' },
  ];

  // 当前选中的排序选项
  const currentSortOption = sortOptions.find(option => option.value === sortType) || sortOptions[0];
  
  // 当前选中的刷新时间选项 - 确保refreshInterval是数值类型
  const currentRefreshOption = refreshOptions.find(option => option.value === Number(refreshInterval)) || refreshOptions[0];
  
  // 调试输出
  console.log('刷新时间值:', refreshInterval, '类型:', typeof refreshInterval);
  console.log('当前选择的刷新选项:', currentRefreshOption);

  return (
    <div className="bg-white shadow-sm border border-border rounded-md p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        {/* 交易所A选择器 */}
        <div>
          <ExchangeSelect
            label="选择交易所A"
            value={exchangeA}
            onChange={setExchangeA}
            options={exchangeOptions}
          />
        </div>
        
        {/* 交易所B选择器 */}
        <div>
          <ExchangeSelect
            label="选择交易所B"
            value={exchangeB}
            onChange={setExchangeB}
            options={exchangeOptions}
          />
        </div>
        
        {/* 排序方式选择器 */}
        <div>
          <Select
            styles={{
              control: (provided) => ({
                ...provided,
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                boxShadow: 'none',
                '&:hover': {
                  border: '1px solid #cbd5e1',
                },
                minHeight: '40px',
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f1f5f9' : null,
                color: state.isSelected ? 'white' : '#1e293b',
                cursor: 'pointer',
                ':active': {
                  backgroundColor: '#3b82f6',
                  color: 'white',
                },
              }),
            }}
            value={currentSortOption}
            onChange={(option) => setSortType(option.value)}
            options={sortOptions}
            placeholder="排序方式"
            className="text-sm"
          />
        </div>
        
        {/* 刷新时间选择器 - 重构实现 */}
        <div>
          <div className="relative">
            <label className="block mb-1 text-xs text-gray-500">刷新时间间隔</label>
            <Select
              styles={{
                control: (provided) => ({
                  ...provided,
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                  boxShadow: 'none',
                  '&:hover': {
                    border: '1px solid #cbd5e1',
                  },
                  minHeight: '40px',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f1f5f9' : null,
                  color: state.isSelected ? 'white' : '#1e293b',
                  cursor: 'pointer',
                  ':active': {
                    backgroundColor: '#3b82f6',
                    color: 'white',
                  },
                }),
              }}
              value={currentRefreshOption}
              onChange={(option) => {
                console.log('刷新间隔变更:', option.value, option.label);
                setRefreshInterval(Number(option.value));
              }}
              options={refreshOptions}
              className="text-sm"
              menuPlacement="auto"
              isSearchable={false}
            />
            <div className="mt-1 text-xs text-gray-500">
              当前: {currentRefreshOption ? currentRefreshOption.label : '7秒'}
            </div>
          </div>
        </div>
        
        {/* 最后更新时间显示 */}
        <div className="relative">
          <div className="flex items-center border border-border rounded-md px-3 py-2 text-sm text-secondary">
            最后更新时间: {lastUpdate || '加载中...'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
