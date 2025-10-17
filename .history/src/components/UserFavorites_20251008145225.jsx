import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContextSimple';
import { Link } from 'react-router-dom';

const UserFavorites = () => {
  const { user, getFavorites, removeFromFavorites } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 4 columns x 3 rows

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getFavorites();
      if (result.success) {
        setFavorites(result.data.favorites || []);
      } else {
        setMessage(result.message || 'Không thể tải danh sách yêu thích');
      }
    } catch (error) {
      setMessage('Có lỗi xảy ra khi tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  }, [getFavorites]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user, loadFavorites]);

  const handleRemoveFromFavorites = async (movieId) => {
    try {
      setMessage('Đang xóa...');
      const result = await removeFromFavorites(movieId);
      
      if (result.success) {
        setFavorites(prev => prev.filter(item => item.movieId !== movieId));
        setMessage('Đã xóa khỏi danh sách yêu thích');
        setTimeout(() => setMessage(''), 3000);
        
        // Reset to page 1 if current page becomes empty
        const newFavorites = favorites.filter(item => item.movieId !== movieId);
        const totalPages = Math.ceil(newFavorites.length / itemsPerPage);
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
  const totalPages = Math.ceil(favorites.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFavorites = favorites.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-400">Bạn cần đăng nhập để xem danh sách yêu thích</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6 pl-2">
        <h1 className="text-2xl font-bold text-white mb-4">Yêu thích</h1>
        
        {/* Tabs */}
        <div className="flex space-x-2">
          <button className="w-20 h-8 bg-yellow-400 text-black rounded-2xl text-sm font-medium flex items-center justify-center">
            Phim
          </button>
          <button className="w-20 h-8 bg-gray-700 text-gray-300 rounded-2xl text-sm font-medium hover:bg-gray-600 flex items-center justify-center">
            Diễn viên
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-3 rounded bg-red-600 text-white">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải danh sách yêu thích...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="bg-gray-800 rounded-lg p-8 w-[90%] max-w-md text-center">
            <h3 className="text-lg font-medium text-white mb-2">Bạn chưa có phim yêu thích nào</h3>
            <p className="text-gray-400 text-sm">Hãy khám phá và thêm những bộ phim bạn thích!</p>
          </div>
        </div>
      ) : (
        <>
          {/* Pagination Info */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-400 text-xs">
              Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, favorites.length)} trong tổng số {favorites.length} phim
            </div>
            <div className="text-gray-400 text-xs">
              Trang {currentPage}/{totalPages}
            </div>
          </div>
          
          {/* Movie Grid - Responsive: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {currentFavorites.map((item, index) => (
              <div key={item.movieId || index} className="group cursor-pointer">
                {/* Movie Card */}
                <div className="w-full transform transition-transform duration-200 hover:scale-105">
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
                        handleRemoveFromFavorites(item.movieId);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition-all duration-200 shadow-lg"
                      title="Xóa khỏi yêu thích"
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
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Trước</span>
              </button>
              
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                
                return (
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
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors flex items-center space-x-1"
              >
                <span>Sau</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default UserFavorites;