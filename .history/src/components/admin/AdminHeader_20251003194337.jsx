import { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Bars3Icon, 
  BellIcon, 
  UserCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const AdminHeader = ({ onMenuClick, user }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <BellIcon className="h-6 w-6" />
          <span className="absolute top-1 right-1 block h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <UserCircleIcon className="h-8 w-8 text-gray-500" />
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium">{user?.username || 'Admin User'}</p>
              <p className="text-xs text-gray-500">{user?.role || 'admin'}</p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Hồ sơ cá nhân
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Cài đặt
              </a>
              <hr className="my-1" />
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Đăng xuất
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
