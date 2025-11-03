import React from 'react';

const LuxuryLoader = ({ 
  size = 'md', 
  text = 'Đang tải dữ liệu...', 
  className = '',
  showText = true 
}) => {
  const sizeClasses = {
    sm: {
      spinner: 'luxury-spinner-sm',
      core: 'luxury-core-sm',
      text: 'luxury-text-sm'
    },
    md: {
      spinner: 'luxury-spinner',
      core: 'luxury-core',
      text: 'luxury-text'
    },
    lg: {
      spinner: 'luxury-spinner-lg',
      core: 'luxury-core-lg',
      text: 'luxury-text-lg'
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`luxury-loader ${className}`}>
      <div className={currentSize.spinner}>
        {/* Vòng ngoài */}
        <div className="luxury-ring luxury-ring-outer"></div>
        
        {/* Vòng trong */}
        <div className="luxury-ring luxury-ring-inner"></div>
        
        {/* Lõi sáng */}
        <div className={currentSize.core}></div>
      </div>
      
      {showText && (
        <div className={currentSize.text}>
          {text}
        </div>
      )}
    </div>
  );
};

export default LuxuryLoader;
