import React from 'react';

/**
 * 加载指示器组件
 * 在数据加载过程中显示旋转动画
 */
const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  // 确定尺寸类名
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.medium;
  
  return (
    <div className="flex justify-center items-center">
      <svg 
        className={`text-primary loading-spinner ${sizeClass} ${className}`} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

export default LoadingSpinner;