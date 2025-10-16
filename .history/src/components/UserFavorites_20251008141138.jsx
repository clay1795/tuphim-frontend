import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContextSimple';
import { Link } from 'react-router-dom';

const UserFavorites = () => {
  const { user, getFavorites, removeFromFavorites } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

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
      <div className="mb-6">
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
          
          <div className="grid grid-cols-4 gap-6">
          {currentFavorites.map((item, index) => (
            <div key={item.movieId || index} className="group relative">
              <div className="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-650 transition-colors">
                {/* Movie Poster */}
                <div className="aspect-[2/3] relative group">
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
                  
                  {/* Heart Icon */}
                  <div className="absolute top-2 left-2">
                    <div className="bg-red-600 text-white p-1 rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveFromFavorites(item.movieId);
                    }}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-100 transition-opacity z-10"
                    title="Xóa khỏi yêu thích"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <Link
                      to={`/phim/${item.movieSlug || item.movieId}`}
                      className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Movie Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                    {item.movieName}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Thêm vào: {new Date(item.addedAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        </>
      )}

      {/* Pagination */}
      {favorites.length > itemsPerPage && (
        <div className="flex justify-center items-center space-x-1 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-sm rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Trước
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-2 py-1 text-sm rounded transition-colors ${
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
            className="px-2 py-1 text-sm rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sau →
          </button>
        </div>
      )}
    </>
  );
};

export default UserFavorites;



