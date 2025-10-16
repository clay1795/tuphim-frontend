import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextSimple';
import { Link } from 'react-router-dom';

const UserHistory = () => {
  const { user, getHistory, removeFromHistory } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const result = await getHistory();
      if (result.success) {
        setHistory(result.data.history || []);
      } else {
        setMessage(result.message || 'Không thể tải lịch sử xem');
      }
    } catch (error) {
      setMessage('Có lỗi xảy ra khi tải lịch sử xem');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromHistory = async (movieId) => {
    try {
      const result = await removeFromHistory(movieId);
      if (result.success) {
        setHistory(prev => prev.filter(item => item.movieId !== movieId));
        setMessage('Đã xóa khỏi lịch sử xem');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.message || 'Không thể xóa');
      }
    } catch (error) {
      setMessage('Có lỗi xảy ra khi xóa');
    }
  };

  const formatWatchTime = (watchedAt) => {
    const now = new Date();
    const watchTime = new Date(watchedAt);
    const diffInHours = Math.floor((now - watchTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Vừa xem';
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ngày trước`;
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
        <span className="text-gray-400">{history.length} phim</span>
      </div>

      {message && (
        <div className="mb-6 p-3 rounded bg-red-600 text-white">
          {message}
        </div>
      )}

        {message && (
          <div className={`mb-6 p-3 rounded ${
            message.includes('xóa') 
              ? 'bg-red-600 text-white' 
              : 'bg-blue-600 text-white'
          }`}>
            {message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Đang tải lịch sử xem...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📺</div>
            <h3 className="text-xl font-semibold mb-2">Chưa có lịch sử xem</h3>
            <p className="text-gray-400 mb-6">Bạn chưa xem phim nào</p>
            <Link 
              to="/" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Khám phá phim
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div key={item.movieId || index} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
                <div className="flex items-center space-x-4">
                  {/* Movie Poster */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-20 rounded-lg overflow-hidden">
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
                    </div>
                  </div>

                  {/* Movie Info */}
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/phim/${item.movieSlug || item.movieId}`}
                      className="block group"
                    >
                      <h3 className="text-lg font-semibold group-hover:text-blue-400 transition-colors mb-1">
                        {item.movieName}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2">
                        {formatWatchTime(item.watchedAt)}
                      </p>
                      {item.progress && item.progress > 0 && (
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${item.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400">{Math.round(item.progress)}%</span>
                        </div>
                      )}
                    </Link>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex-shrink-0 flex space-x-2">
                    <Link
                      to={`/phim/${item.movieSlug || item.movieId}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      {item.progress && item.progress > 0 ? 'Tiếp tục xem' : 'Xem lại'}
                    </Link>
                    <button
                      onClick={() => handleRemoveFromHistory(item.movieId)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                      title="Xóa khỏi lịch sử"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHistory;



