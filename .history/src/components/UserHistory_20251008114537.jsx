import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextSimple';
import { Link } from 'react-router-dom';

const UserHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      // Simulate loading with empty data for now
      setHistory([]);
      
    } catch (error) {
      console.error('Load history error:', error);
      setMessage('Có lỗi xảy ra khi tải lịch sử xem');
      setHistory([]);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Xem tiếp</h2>
        <span className="text-gray-400">{history.length} phim</span>
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
        <div className="text-center py-12">
          <div className="text-gray-400 mb-6">
            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <h3 className="text-xl font-semibold mb-2">Chưa có lịch sử xem</h3>
            <p className="text-gray-500">Bạn chưa xem phim nào. Hãy khám phá và xem phim để tạo lịch sử!</p>
          </div>
          <Link
            to="/"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Khám phá phim
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-4">
          {history.map((item, index) => (
            <div key={item.movieId || index} className="group relative">
              <div className="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-650 transition-colors">
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
                </div>
                <div className="p-3">
                  <Link to={`/phim/${item.movieSlug || item.movieId}`}>
                    <h3 className="font-semibold text-sm group-hover:text-yellow-400 transition-colors mb-1 line-clamp-2">
                      {item.movieName}
                    </h3>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserHistory;
