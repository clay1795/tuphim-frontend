import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextSimple';
import { Link, useLocation, Outlet } from 'react-router-dom';

const UserLayout = () => {
  const { user, getUserStats } = useAuth();
  const location = useLocation();
  const [, setStats] = useState(null);
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0d1017] text-white">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] bg-[#11151a] border-r border-[#1e2229] flex flex-col z-50 hidden lg:flex">
        <div className="flex-1 pt-20 sm:pt-24 md:pt-28 lg:pt-32 px-3 sm:px-4 md:px-5 lg:px-6">
          <h2 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6">Quản lý tài khoản</h2>
              
          <nav className="flex flex-col space-y-6">
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
              <span className="ml-2">Xem sau</span>
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
        <div className="border-t border-[#1f2430] pt-3 text-sm px-6 pb-6">
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

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#11151a] border-t border-[#1e2229] z-40">
        <nav className="flex justify-around py-2">
          <Link
            to="/user/favorite"
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200 ${
              activeTab === 'favorites' ? "text-yellow-400" : "text-gray-400"
            }`}
          >
            <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Yêu thích</span>
          </Link>
          
          <Link
            to="/user/playlist"
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200 ${
              activeTab === 'watchlist' ? "text-yellow-400" : "text-gray-400"
            }`}
          >
            <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Xem sau</span>
          </Link>
          
          <Link
            to="/user/xem-tiep"
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200 ${
              activeTab === 'continue' ? "text-yellow-400" : "text-gray-400"
            }`}
          >
            <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Xem tiếp</span>
          </Link>
          
          <Link
            to="/user/profile"
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200 ${
              activeTab === 'account' ? "text-yellow-400" : "text-gray-400"
            }`}
          >
            <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Tài khoản</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <main className="lg:ml-[220px] flex-1 h-screen overflow-y-auto p-2 sm:p-4 md:p-6 lg:p-8 pb-16 lg:pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
