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
    <div className="flex min-h-screen bg-[#0d1017] text-white">
      {/* Sidebar */}
      <aside className="w-56 bg-[#11151a] text-white p-6 flex flex-col justify-between min-h-screen">
        <div>
          <h2 className="font-bold text-xl mb-8">Quản lý tài khoản</h2>
              
          <nav className="flex flex-col space-y-3">
            <Link
              to="/user/favorite"
              className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                activeTab === 'favorites'
                  ? "bg-[#16181f] text-yellow-400"
                  : "hover:bg-[#16181f]/50"
              }`}
            >
              <span className="ml-2">Yêu thích</span>
            </Link>

            <Link
              to="/user/playlist"
              className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                activeTab === 'watchlist'
                  ? "bg-[#16181f] text-yellow-400"
                  : "hover:bg-[#16181f]/50"
              }`}
            >
              <span className="ml-2">Danh sách</span>
            </Link>

            <Link
              to="/user/xem-tiep"
              className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                activeTab === 'continue'
                  ? "bg-[#16181f] text-yellow-400"
                  : "hover:bg-[#16181f]/50"
              }`}
            >
              <span className="ml-2">Xem tiếp</span>
            </Link>

            <Link
              to="/user/profile"
              className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                activeTab === 'account'
                  ? "bg-[#16181f] text-yellow-400"
                  : "hover:bg-[#16181f]/50"
              }`}
            >
              <span className="ml-2">Tài khoản</span>
            </Link>
          </nav>
        </div>

              {/* User Summary */}
              <div className="mt-6 pt-4 border-t border-gray-600">
                <div className="flex flex-col items-center mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden mb-2">
                    <img 
                      src={user.avatar || `https://i.pravatar.cc/150?img=${user._id?.slice(-2) || 1}`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-white font-medium text-xs text-center">{user.fullName || user.username || 'Người dùng'}</div>
                  <div className="text-gray-400 text-xs text-center">{user.email}</div>
                </div>
                <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  <span>Thoát</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4 ml-72 pl-4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
