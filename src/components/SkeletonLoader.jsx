import React from 'react';
import LuxuryLoader from './LuxuryLoader';

const SkeletonLoader = ({ count = 8, className = "", type = "grid", size = 'md' }) => {
  return (
    <div className={`flex justify-center items-center py-12 ${className}`}>
      <LuxuryLoader size={size} text="Đang tải phim..." />
    </div>
  );
};

export default SkeletonLoader;
