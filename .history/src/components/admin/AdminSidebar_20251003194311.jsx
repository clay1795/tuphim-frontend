import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  FilmIcon, 
  UsersIcon, 
  TagIcon,
  ChartBarIcon,
  CogIcon,
  LogoutIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

const AdminSidebar = ({ isOpen, onToggle, onLogout }) => {
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: HomeIcon,
    },
    {
      name: 'Quản lý phim',
      path: '/admin/movies',
      icon: FilmIcon,
    },
    {
      name: 'Quản lý người dùng',
      path: '/admin/users',
      icon: UsersIcon,
    },
    {
      name: 'Danh mục',
      path: '/admin/categories',
      icon: TagIcon,
    },
    {
      name: 'Thống kê',
      path: '/admin/analytics',
      icon: ChartBarIcon,
    },
    {
      name: 'Cài đặt',
      path: '/admin/settings',
      icon: CogIcon,
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } lg:translate-x-0`}>
        
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <FilmIcon className="h-8 w-8 text-red-500" />
            <span className="text-xl font-bold">Admin Panel</span>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-full p-3 border-t border-gray-700">
          <button 
            onClick={onLogout}
            className="flex items-center space-x-3 w-full px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200"
          >
            <LogoutIcon className="h-5 w-5" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
