import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextSimple';
import { Link, useLocation, Outlet } from 'react-router-dom';

const UserLayout = () => {
  const { user, getUserStats } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine active tab based on URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/user/profile') return 'account';
    if (path === '/user/thong-bao') return 'notifications';
    if (path === '/user/favorite') return 'favorites';
    if (path === '/user/playlist') return 'watchlist';
    if (path === '/user/xem-tiep') return 'continue';
    return 'account';
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const userStats = await getUserStats();
        setStats(userStats);
      } catch (error) {
        console.error('Error loading user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadStats();
    }
  }, [user, getUserStats]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl mb-4">Vui lòng đăng nhập để xem thông tin cá nhân</h2>
          <p className="text-gray-400">Bạn cần đăng nhập để truy cập trang này</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-2xl p-6 sticky top-8">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-white mb-1">Quản lý tài khoản</h3>
                <div className="w-6 h-0.5 bg-yellow-400"></div>
              </div>
              
              <nav className="space-y-2">
                <Link
                  to="/user/favorite"
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                    activeTab === 'favorites' ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span>Yêu thích</span>
                </Link>

                <Link
                  to="/user/playlist"
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'watchlist' ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Danh sách</span>
                </Link>

                <Link
                  to="/user/xem-tiep"
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'continue' ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span>Xem tiếp</span>
                </Link>

                <Link
                  to="/user/thong-bao"
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'notifications' ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  <span>Thông báo</span>
                </Link>

                <Link
                  to="/user/profile"
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'account' ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span>Tài khoản</span>
                </Link>
              </nav>

              {/* User Summary */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <img 
                      src={user.avatar || `https://i.pravatar.cc/150?img=${user._id?.slice(-2) || 1}`}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-1">
                      <div className="text-white font-medium text-sm">{user.fullName || user.username || 'Người dùng'}</div>
                      <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-gray-400 text-xs">{user.email}</div>
                  </div>
                </div>
                <button className="w-full flex items-center justify-center space-x-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  <span>Thoát</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-2xl p-8">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
