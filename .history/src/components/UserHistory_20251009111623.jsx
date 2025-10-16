import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContextSimple';

const UserHistory = () => {
  const { user, getHistory, removeFromHistory } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18; // 6 columns x 3 rows to match other tabs

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getHistory();
      if (result.success) {
        // Sắp xếp theo thời gian xem (mới nhất lên đầu)
        const sortedHistory = (result.data.history || []).sort((a, b) => {
          const timeA = new Date(a.watchedAt || a.createdAt || 0);
          const timeB = new Date(b.watchedAt || b.createdAt || 0);
          return timeB - timeA; // Mới nhất lên đầu
        });
        setHistory(sortedHistory);
      } else {
        setMessage(result.message || 'Không thể tải lịch sử xem');
      }
    } catch (error) {
      setMessage('Có lỗi xảy ra khi tải lịch sử xem');
    } finally {
      setLoading(false);
    }
  }, [getHistory]);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user, loadHistory]);

  const handleRemoveFromHistory = async (movieId) => {
    try {
      setMessage('Đang xóa...');
      const result = await removeFromHistory(movieId);
      
      if (result.success) {
        setHistory(prev => prev.filter(item => item.movieId !== movieId));
        setMessage('Đã xóa khỏi lịch sử xem');
        setTimeout(() => setMessage(''), 3000);
        
        // Reset to page 1 if current page becomes empty
        const newHistory = history.filter(item => item.movieId !== movieId);
        const totalPages = Math.ceil(newHistory.length / itemsPerPage);
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
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHistory = history.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatWatchTime = (watchedAt) => {
    try {
      if (!watchedAt) return 'Vừa xem';
      const date = new Date(watchedAt);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Vừa xem';
      if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
      return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    } catch (error) {
      return 'Vừa xem';
    }
  };

  const getProgressPercentage = () => {
    // Mock progress - in real app, this would come from the API
    return Math.floor(Math.random() * 80) + 10; // 10-90%
  };

  // Removed formatDuration as it's not used in the updated UI

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-400">Bạn cần đăng nhập để xem lịch sử xem</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">Danh sách xem tiếp</h1>
      </div>

      {message && (
        <div className="mb-6 p-3 rounded bg-red-600 text-white">
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          <span className="ml-3 text-gray-400">Đang tải...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="bg-gray-800 rounded-lg p-8 w-[90%] max-w-md text-center">
            <h3 className="text-lg font-medium text-white mb-2">Chưa có lịch sử xem</h3>
            <p className="text-gray-400 text-sm">Hãy khám phá và xem phim để tạo lịch sử xem của riêng bạn!</p>
          </div>
        </div>
      ) : (
        <>
          {/* Pagination Info */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-400 text-xs">
              Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, history.length)} trong tổng số {history.length} phim
            </div>
            <div className="text-gray-400 text-xs">
              Trang {currentPage}/{Math.max(1, Math.ceil(history.length / itemsPerPage))}
            </div>
          </div>
          
          {/* Movie Grid - 6 columns to match other tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {currentHistory.map((item, index) => {
              const progress = getProgressPercentage(item);
              return (
                <div key={item.movieId || index} className="bg-[#16181f] rounded-xl overflow-hidden shadow-md">
                  <div className="relative">
                    <Link to={`/phim/${item.movieSlug || item.slug || item.movieId}`}>
                      <img
                        src={item.poster_url || item.thumb_url || item.banner_url || '/src/assets/temp-1.jpeg'}
                        alt={item.movieName}
                        className="w-full aspect-[2/3] object-cover hover:opacity-90 transition-opacity"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.style.background = 'linear-gradient(135deg, #374151 0%, #4b5563 100%)';
                        }}
                      />
                    </Link>
                    
                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveFromHistory(item.movieId);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Badges */}
                    <div className="absolute bottom-0 left-0 right-0 flex flex-wrap gap-1 p-2">
                      <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded">PĐ</span>
                      <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">TM</span>
                    </div>
                  </div>
                  
                  {/* Movie Info */}
                  <div className="p-3">
                    <h3 className="text-base font-semibold truncate mb-1 text-white">
                      {item.movieName || 'Tên phim'}
                    </h3>
                    {item.originalName && item.originalName !== item.movieName && (
                      <p className="text-sm text-gray-400 truncate italic">
                        {item.originalName}
                      </p>
                    )}
                    {!item.originalName && (
                      <p className="text-xs text-gray-500 truncate italic">
                        Tên tiếng Anh chưa có
                      </p>
                    )}
                    <p className="text-gray-500 text-xs">
                      {formatWatchTime(item.watchedAt)}
                    </p>
                  </div>
                </div>
              );
            })}
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
    </div>
  );
};

export default UserHistory;