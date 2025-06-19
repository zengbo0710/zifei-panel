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

  // 当前选中的排序选项
  const currentSortOption = sortOptions.find(option => option.value === sortType) || sortOptions[0];

  return (
    <div className="bg-white shadow-sm border border-border rounded-md p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
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
