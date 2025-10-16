import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextSimple';

const UserProfile = () => {
  const { user, updateProfile, getUserStats } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    username: '',
    email: '',
    preferences: {
      favoriteGenres: [],
      settings: {
        theme: 'dark',
        language: 'vi'
      }
    }
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        preferences: user.preferences || {
          favoriteGenres: [],
          settings: {
            theme: 'dark',
            language: 'vi'
          }
        }
      });
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      const result = await getUserStats();
      if (result.success) {
        setStats(result.data.stats);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await updateProfile(profile);
      if (result.success) {
        setMessage('Cập nhật profile thành công!');
      } else {
        setMessage(result.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      setMessage('Có lỗi xảy ra khi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-400">Bạn cần đăng nhập để xem profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Thông tin cá nhân</h2>
              
              {message && (
                <div className={`mb-4 p-3 rounded ${
                  message.includes('thành công') 
                    ? 'bg-green-600 text-white' 
                    : 'bg-red-600 text-white'
                }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Họ và tên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tên đăng nhập</label>
                  <input
                    type="text"
                    name="username"
                    value={profile.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-600 rounded-lg cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Chủ đề</label>
                  <select
                    name="preferences.settings.theme"
                    value={profile.preferences.settings.theme}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="dark">Tối</option>
                    <option value="light">Sáng</option>
                    <option value="auto">Tự động</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ngôn ngữ</label>
                  <select
                    name="preferences.settings.language"
                    value={profile.preferences.settings.language}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Đang cập nhật...' : 'Cập nhật Profile'}
                </button>
              </form>
            </div>
          </div>

          {/* User Stats */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Thống kê</h2>
              
              {stats ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Danh sách xem sau</span>
                    <span className="font-semibold">{stats.watchlistCount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Yêu thích</span>
                    <span className="font-semibold">{stats.favoritesCount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Đã xem</span>
                    <span className="font-semibold">{stats.watchHistoryCount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Thành viên</span>
                    <span className="font-semibold">{stats.accountAge} ngày</span>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400">
                      Tham gia: {new Date(stats.memberSince).toLocaleDateString('vi-VN')}
                    </p>
                    {stats.lastLogin && (
                      <p className="text-sm text-gray-400">
                        Đăng nhập cuối: {new Date(stats.lastLogin).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p>Đang tải thống kê...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;


