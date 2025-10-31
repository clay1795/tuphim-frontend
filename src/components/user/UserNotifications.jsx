const UserNotifications = () => {
  return (
    <>
      {/* Header */}
      <div className="mb-6 pl-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Thông báo</h1>
          <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">Đã đọc</span>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-2">
          <button className="px-6 py-2 bg-yellow-500 text-black rounded-full text-sm font-medium">
            Phim
          </button>
          <button className="px-6 py-2 bg-gray-700 text-gray-300 rounded-full text-sm font-medium hover:bg-gray-600">
            Cộng đồng
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-gray-800 rounded-lg p-8 w-[90%] max-w-md text-center">
          <h3 className="text-lg font-medium text-white mb-2">Không có thông báo nào</h3>
          <p className="text-gray-400 text-sm">Bạn sẽ nhận được thông báo khi có cập nhật mới</p>
        </div>
      </div>
    </>
  );
};

export default UserNotifications;
