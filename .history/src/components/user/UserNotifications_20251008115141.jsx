const UserNotifications = () => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Thông báo</h1>
        <p className="text-gray-400">Quản lý thông báo và cài đặt nhận thông báo</p>
      </div>

      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-700 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Chưa có thông báo</h3>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">Bạn chưa có thông báo nào. Chức năng thông báo sẽ được cập nhật trong phiên bản tiếp theo!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
          <div className="bg-gray-700 rounded-lg p-6">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Thông báo phim mới</h4>
            <p className="text-gray-400 text-sm">Nhận thông báo khi có phim mới được thêm vào</p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-6">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Phim yêu thích</h4>
            <p className="text-gray-400 text-sm">Thông báo khi phim trong danh sách yêu thích được cập nhật</p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-6">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Đánh giá & Bình luận</h4>
            <p className="text-gray-400 text-sm">Thông báo về bình luận và đánh giá phim</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserNotifications;
