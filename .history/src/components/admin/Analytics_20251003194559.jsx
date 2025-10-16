import { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  EyeIcon,
  UsersIcon,
  FilmIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalUsers: 0,
    totalMovies: 0,
    avgWatchTime: 0,
    topMovies: [],
    userGrowth: [],
    viewTrends: []
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    // Mock data - trong thực tế sẽ gọi API
    setAnalytics({
      totalViews: 125430,
      totalUsers: 8563,
      totalMovies: 1247,
      avgWatchTime: 45.2,
      topMovies: [
        { id: 1, name: 'Avengers: Endgame', views: 125430, growth: 12 },
        { id: 2, name: 'Spider-Man: No Way Home', views: 98765, growth: 8 },
        { id: 3, name: 'The Batman', views: 87654, growth: 15 },
        { id: 4, name: 'Top Gun: Maverick', views: 76543, growth: -2 },
        { id: 5, name: 'Black Widow', views: 65432, growth: 5 }
      ],
      userGrowth: [
        { date: '2024-01-14', users: 120 },
        { date: '2024-01-15', users: 135 },
        { date: '2024-01-16', users: 142 },
        { date: '2024-01-17', users: 158 },
        { date: '2024-01-18', users: 167 },
        { date: '2024-01-19', users: 189 },
        { date: '2024-01-20', users: 203 }
      ],
      viewTrends: [
        { date: '2024-01-14', views: 18543 },
        { date: '2024-01-15', views: 19234 },
        { date: '2024-01-16', views: 20123 },
        { date: '2024-01-17', views: 21567 },
        { date: '2024-01-18', views: 22345 },
        { date: '2024-01-19', views: 23456 },
        { date: '2024-01-20', views: 24123 }
      ]
    });
  };

  const timeRangeOptions = [
    { value: '7d', label: '7 ngày qua' },
    { value: '30d', label: '30 ngày qua' },
    { value: '90d', label: '90 ngày qua' },
    { value: '1y', label: '1 năm qua' }
  ];

  const stats = [
    {
      title: 'Tổng lượt xem',
      value: analytics.totalViews.toLocaleString(),
      icon: EyeIcon,
      color: 'bg-blue-500',
      change: '+12.5%',
      changeType: 'increase'
    },
    {
      title: 'Người dùng hoạt động',
      value: analytics.totalUsers.toLocaleString(),
      icon: UsersIcon,
      color: 'bg-green-500',
      change: '+8.2%',
      changeType: 'increase'
    },
    {
      title: 'Tổng số phim',
      value: analytics.totalMovies.toLocaleString(),
      icon: FilmIcon,
      color: 'bg-purple-500',
      change: '+3.1%',
      changeType: 'increase'
    },
    {
      title: 'Thời gian xem trung bình',
      value: `${analytics.avgWatchTime} phút`,
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      change: '+2.3%',
      changeType: 'increase'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thống kê & Phân tích</h1>
          <p className="text-gray-600">Theo dõi hiệu suất và xu hướng của trang web</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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
              <span className="text-sm text-gray-500 ml-1">so với kỳ trước</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Movies */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top phim xem nhiều nhất</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.topMovies.map((movie, index) => (
                <div key={movie.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-red-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{movie.name}</p>
                      <p className="text-sm text-gray-500">
                        {movie.views.toLocaleString()} lượt xem
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {movie.growth > 0 ? (
                      <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      movie.growth > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {movie.growth > 0 ? '+' : ''}{movie.growth}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Tăng trưởng người dùng</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {analytics.userGrowth.map((data, index) => (
                <div key={data.date} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {new Date(data.date).toLocaleDateString('vi-VN')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(data.users / Math.max(...analytics.userGrowth.map(d => d.users))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {data.users}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* View Trends */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Xu hướng lượt xem</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {analytics.viewTrends.map((data, index) => (
              <div key={data.date} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {new Date(data.date).toLocaleDateString('vi-VN')}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-48 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full"
                      style={{ width: `${(data.views / Math.max(...analytics.viewTrends.map(d => d.views))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16 text-right">
                    {data.views.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
