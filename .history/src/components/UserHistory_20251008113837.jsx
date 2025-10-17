import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContextSimple';
import { Link } from 'react-router-dom';

const UserHistory = () => {
  const { user, getHistory, removeFromHistory } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user, loadHistory]);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getHistory();
      if (result.success) {
        setHistory(result.data.history || result.data || []);
      } else {
        setMessage(result.message || 'Không thể tải lịch sử xem');
      }
    } catch (error) {
      console.error('Load history error:', error);
      setMessage('Có lỗi xảy ra khi tải lịch sử xem');
    } finally {
      setLoading(false);
    }
  }, [getHistory]);

  const handleRemoveFromHistory = async (movieId) => {
    try {
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
      }
    } catch (error) {
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
      if (!watchedAt) return 'Không xác định';
      
      const now = new Date();
      const watchTime = new Date(watchedAt);
      
      if (isNaN(watchTime.getTime())) return 'Không xác định';
      
      const diffInHours = Math.floor((now - watchTime) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        return 'Vừa xem';
      } else if (diffInHours < 24) {
        return `${diffInHours} giờ trước`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} ngày trước`;
      }
    } catch (error) {
      console.error('formatWatchTime error:', error);
      return 'Không xác định';
    }
  };

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
    <>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Xem tiếp</h2>
        <span className="text-gray-400">{history.length} phim • Trang {currentPage}/{Math.max(1, totalPages)}</span>
      </div>

      {message && (
        <div className="mb-6 p-3 rounded bg-red-600 text-white">
          {message}
        </div>
      )}


      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải lịch sử xem...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📺</div>
          <h3 className="text-xl font-semibold mb-2">Chưa có lịch sử xem</h3>
          <p className="text-gray-400 mb-6">Bạn chưa xem phim nào</p>
          <Link 
            to="/" 
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Khám phá phim
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-4">
          {currentHistory.map((item, index) => (
            <div key={item.movieId || index} className="group relative">
              <div className="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-650 transition-colors">
                {/* Movie Poster */}
                <div className="aspect-[3/4] relative">
                  <Link to={`/phim/${item.movieSlug || item.movieId}`}>
                    <img
                      src={item.poster_url || item.thumb_url || '/src/assets/temp-1.jpeg'}
                      alt={item.movieName}
                      className="w-full h-full object-cover object-center"
                      style={{ objectPosition: 'center center' }}
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
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-100 transition-opacity z-10"
                    title="Xóa khỏi lịch sử"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>

                {/* Movie Info */}
                <div className="p-3">
                  <Link to={`/phim/${item.movieSlug || item.movieId}`}>
                    <h3 className="font-semibold text-sm group-hover:text-yellow-400 transition-colors mb-1 line-clamp-2">
                      {item.movieName}
                    </h3>
                    <p className="text-xs text-gray-400 mb-2">
                      {formatWatchTime(item.watchedAt)}
                    </p>
                    {item.progress && item.progress > 0 && (
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-600 rounded-full h-1">
                          <div 
                            className="bg-yellow-400 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">{Math.round(item.progress)}%</span>
                      </div>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {history.length > itemsPerPage && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Trước
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                page === currentPage
                  ? 'bg-yellow-500 text-black font-semibold'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sau →
          </button>
        </div>
      )}
    </>
  );
};

export default UserHistory;



