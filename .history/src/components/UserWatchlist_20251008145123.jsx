import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContextSimple';
import { Link } from 'react-router-dom';

const UserWatchlist = () => {
  const { user, getWatchlist, removeFromWatchlist } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const loadWatchlist = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getWatchlist();
      if (result.success) {
        setWatchlist(result.data.watchlist || []);
      } else {
        setMessage(result.message || 'Không thể tải danh sách xem sau');
      }
    } catch (error) {
      setMessage('Có lỗi xảy ra khi tải danh sách xem sau');
    } finally {
      setLoading(false);
    }
  }, [getWatchlist]);

  useEffect(() => {
    if (user) {
      loadWatchlist();
    }
  }, [user, loadWatchlist]);

  const handleRemoveFromWatchlist = async (movieId) => {
    try {
      setMessage('Đang xóa...');
      const result = await removeFromWatchlist(movieId);
      
      if (result.success) {
        setWatchlist(prev => prev.filter(item => item.movieId !== movieId));
        setMessage('Đã xóa khỏi danh sách xem sau');
        setTimeout(() => setMessage(''), 3000);
        
        // Reset to page 1 if current page becomes empty
        const newWatchlist = watchlist.filter(item => item.movieId !== movieId);
        const totalPages = Math.ceil(newWatchlist.length / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        }
      } else {
        setMessage(result.message || 'Không thể xóa');
        console.error('❌ Remove failed:', result);
      }
    } catch (error) {
      console.error('💥 Remove error:', error);
      setMessage('Có lỗi xảy ra khi xóa');
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(watchlist.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWatchlist = watchlist.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-400">Bạn cần đăng nhập để xem danh sách xem sau</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pl-2">
        <h1 className="text-2xl font-bold text-white">Danh sách</h1>
        <button className="w-24 h-8 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-md text-sm transition-colors">
          + Thêm mới
        </button>
      </div>

      {message && (
        <div className="mb-6 p-3 rounded bg-red-600 text-white">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải danh sách xem sau...</p>
        </div>
      ) : watchlist.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="bg-gray-800 rounded-lg p-8 w-[90%] max-w-md text-center">
            <h3 className="text-lg font-medium text-white mb-2">Bạn chưa có danh sách nào</h3>
            <p className="text-gray-400 text-sm">Hãy thêm những bộ phim bạn muốn xem sau!</p>
          </div>
        </div>
      ) : (
        <>
          {/* Pagination Info */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-400 text-xs">
              Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, watchlist.length)} trong tổng số {watchlist.length} phim
            </div>
            <div className="text-gray-400 text-xs">
              Trang {currentPage}/{totalPages}
            </div>
          </div>
          
          {/* Movie Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentWatchlist.map((item, index) => (
              <div key={item.movieId || index} className="group">
                {/* Movie Card */}
                <div className="w-full">
                  {/* Poster */}
                  <div className="aspect-[2/3] relative group mb-3">
                    <img
                      src={item.poster_url || item.thumb_url || '/src/assets/temp-1.jpeg'}
                      alt={item.movieName}
                      className="w-full h-full object-cover object-center rounded-md"
                      style={{ objectPosition: 'center center' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = 'linear-gradient(135deg, #374151 0%, #4b5563 100%)';
                      }}
                    />
                    
                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveFromWatchlist(item.movieId);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition-all duration-200 shadow-lg"
                      title="Xóa khỏi danh sách"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Badges */}
                    <div className="absolute bottom-2 left-2 flex space-x-1">
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">PĐ</span>
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">TM</span>
                    </div>
                  </div>

                  {/* Movie Info */}
                  <div className="space-y-1">
                    <h3 className="text-white font-bold text-base leading-tight line-clamp-2">
                      {item.movieName || 'Tên phim'}
                    </h3>
                    {item.originalName && item.originalName !== item.movieName && (
                      <p className="text-gray-400 text-sm line-clamp-1">
                        {item.originalName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
              >
                Trước
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-yellow-500 text-black font-medium'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default UserWatchlist;