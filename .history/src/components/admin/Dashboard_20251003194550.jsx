import { useState, useEffect } from 'react';
import { 
  FilmIcon, 
  UsersIcon, 
  EyeIcon, 
  HeartIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalUsers: 0,
    totalViews: 0,
    totalFavorites: 0,
    todayViews: 0,
    todayUploads: 0
  });

  const [recentMovies, setRecentMovies] = useState([]);

  useEffect(() => {
    // Mock data - trong thực tế sẽ gọi API
    setStats({
      totalMovies: 1247,
      totalUsers: 8563,
      totalViews: 125430,
      totalFavorites: 8934,
      todayViews: 2341,
      todayUploads: 12
    });

    setRecentMovies([
      {
        id: 1,
        title: 'Avengers: Endgame',
        views: 125430,
        uploadDate: '2024-01-15',
        status: 'active'
      },
      {
        id: 2,
        title: 'Spider-Man: No Way Home',
        views: 98765,
        uploadDate: '2024-01-14',
        status: 'active'
      },
      {
        id: 3,
        title: 'The Batman',
        views: 87654,
        uploadDate: '2024-01-13',
        status: 'pending'
      }
    ]);
  }, []);

  const statCards = [
    {
      title: 'Tổng số phim',
      value: stats.totalMovies.toLocaleString(),
      icon: FilmIcon,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Người dùng',
      value: stats.totalUsers.toLocaleString(),
      icon: UsersIcon,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Lượt xem',
      value: stats.totalViews.toLocaleString(),
      icon: EyeIcon,
      color: 'bg-purple-500',
      change: '+23%',
      changeType: 'increase'
    },
    {
      title: 'Yêu thích',
      value: stats.totalFavorites.toLocaleString(),
      icon: HeartIcon,
      color: 'bg-red-500',
      change: '+5%',
      changeType: 'increase'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Tổng quan về hoạt động của trang web</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === 'increase' ? (
                <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">so với tháng trước</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Movies */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Phim mới nhất</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentMovies.map((movie) => (
                <div key={movie.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{movie.title}</p>
                    <p className="text-sm text-gray-500">
                      {movie.views.toLocaleString()} lượt xem
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      movie.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {movie.status === 'active' ? 'Đang hoạt động' : 'Chờ duyệt'}
                    </span>
                    <span className="text-sm text-gray-500">{movie.uploadDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Thống kê hôm nay</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Lượt xem hôm nay</p>
                  <p className="text-sm text-gray-500">Tổng lượt xem trong ngày</p>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.todayViews.toLocaleString()}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Phim mới hôm nay</p>
                  <p className="text-sm text-gray-500">Số phim được tải lên</p>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.todayUploads}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
