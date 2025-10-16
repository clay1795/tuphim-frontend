import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextSimple';
import { Link } from 'react-router-dom';

const UserWatchlist = () => {
  const { user, getWatchlist, removeFromWatchlist } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  useEffect(() => {
    if (user) {
      loadWatchlist();
    }
  }, [user]);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      const result = await getWatchlist();
      if (result.success) {
        setWatchlist(result.data.watchlist || []);
      } else {
        setMessage(result.message || 'Không thể tải danh sách');
      }
    } catch (error) {
      setMessage('Có lỗi xảy ra khi tải danh sách');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async (movieId) => {
    try {
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
      }
    } catch (error) {
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
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Xem sau</h2>
        <span className="text-gray-400">{watchlist.length} phim • Trang {currentPage}/{totalPages}</span>
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
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2">Danh sách xem sau trống</h3>
          <p className="text-gray-400 mb-6">Bạn chưa thêm phim nào vào danh sách xem sau</p>
          <Link 
            to="/" 
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Khám phá phim
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-4">
          {currentWatchlist.map((item, index) => (
            <div key={item.movieId || index} className="group relative">
              <div className="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-650 transition-colors">
                {/* Movie Poster */}
                <div className="aspect-[3/4] relative">
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
                  
                  {/* Bookmark Icon */}
                  <div className="absolute top-2 left-2">
                    <div className="bg-blue-600 text-white p-1 rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveFromWatchlist(item.movieId);
                    }}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-100 transition-opacity z-10"
                    title="Xóa khỏi danh sách"
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
      )}
    </>
  );
};

export default UserWatchlist;



