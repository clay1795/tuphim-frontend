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
      <aside className="w-56 bg-[#11151a] text-white p-6 flex flex-col h-fit max-h-[calc(100vh-2rem)]">
        <div>
          <h2 className="font-bold text-xl mb-6">Quản lý tài khoản</h2>
              
          <nav className="flex flex-col space-y-2">
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

        {/* User Summary - Fixed at bottom */}
        <div className="border-t border-[#1f2430] pt-4 text-sm">
          <div className="flex items-center space-x-3 mb-3">
            <img
              src={user.avatar || `https://i.pravatar.cc/150?img=${user._id?.slice(-2) || 1}`}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{user.fullName || user.username || 'Người dùng'}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button className="w-full bg-transparent border border-gray-600 text-white hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors">
            Thoát
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
