import React from 'react';
import SyncManager from '../components/SyncManager';

const SyncPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🎬 TupPhim Sync Management
            </h1>
            <p className="text-gray-400 text-lg">
              Quản lý đồng bộ dữ liệu phim từ KKPhim.com
            </p>
          </div>

          <SyncManager />
        </div>
      </div>
    </div>
  );
};

export default SyncPage;
