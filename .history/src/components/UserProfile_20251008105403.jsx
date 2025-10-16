import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextSimple';
import { Link } from 'react-router-dom';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const { user, getUserStats, updateProfile, changePassword } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('account');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Profile update form
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    username: '',
    gender: 'male'
  });

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
      setProfileForm({
        fullName: user.fullName || '',
        username: user.username || '',
        gender: user.gender || 'male'
      });
    }
  }, [user, getUserStats]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const result = await updateProfile(profileForm);
      if (result.success) {
        setMessage('Cập nhật thông tin thành công!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.message || 'Có lỗi xảy ra');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Có lỗi xảy ra khi cập nhật thông tin');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('Mật khẩu xác nhận không khớp');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const result = await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      
      if (result.success) {
        setMessage('Đổi mật khẩu thành công!');
        setShowChangePassword(false);
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.message || 'Có lỗi xảy ra');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Có lỗi xảy ra khi đổi mật khẩu');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleAvatarSelect = async (avatarUrl) => {
    try {
      const result = await updateProfile({ avatar: avatarUrl });
      if (result.success) {
        setSelectedAvatar(avatarUrl);
        setShowAvatarModal(false);
        setMessage('Cập nhật avatar thành công!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Có lỗi xảy ra khi cập nhật avatar');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Avatar gallery data
  const avatarCategories = {
    anime: [
      'https://i.pravatar.cc/150?img=1',
      'https://i.pravatar.cc/150?img=2',
      'https://i.pravatar.cc/150?img=3',
      'https://i.pravatar.cc/150?img=4',
      'https://i.pravatar.cc/150?img=5',
      'https://i.pravatar.cc/150?img=6',
      'https://i.pravatar.cc/150?img=7',
      'https://i.pravatar.cc/150?img=8',
      'https://i.pravatar.cc/150?img=9',
      'https://i.pravatar.cc/150?img=10',
      'https://i.pravatar.cc/150?img=11',
      'https://i.pravatar.cc/150?img=12',
      'https://i.pravatar.cc/150?img=13',
      'https://i.pravatar.cc/150?img=14',
      'https://i.pravatar.cc/150?img=15',
      'https://i.pravatar.cc/150?img=16',
      'https://i.pravatar.cc/150?img=17',
      'https://i.pravatar.cc/150?img=18',
      'https://i.pravatar.cc/150?img=19',
      'https://i.pravatar.cc/150?img=20',
      'https://i.pravatar.cc/150?img=21',
      'https://i.pravatar.cc/150?img=22',
      'https://i.pravatar.cc/150?img=23',
      'https://i.pravatar.cc/150?img=24',
      'https://i.pravatar.cc/150?img=25',
      'https://i.pravatar.cc/150?img=26',
      'https://i.pravatar.cc/150?img=27',
      'https://i.pravatar.cc/150?img=28',
      'https://i.pravatar.cc/150?img=29',
      'https://i.pravatar.cc/150?img=30',
      'https://i.pravatar.cc/150?img=31',
      'https://i.pravatar.cc/150?img=32',
      'https://i.pravatar.cc/150?img=33',
      'https://i.pravatar.cc/150?img=34',
      'https://i.pravatar.cc/150?img=35',
      'https://i.pravatar.cc/150?img=36',
      'https://i.pravatar.cc/150?img=37',
      'https://i.pravatar.cc/150?img=38',
      'https://i.pravatar.cc/150?img=39',
      'https://i.pravatar.cc/150?img=40',
      'https://i.pravatar.cc/150?img=41',
      'https://i.pravatar.cc/150?img=42'
    ]
  };

  const [selectedCategory, setSelectedCategory] = useState('anime');

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
              <h3 className="text-lg font-semibold text-white mb-6">Quản lý tài khoản</h3>
              
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'favorites' ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span>Yêu thích</span>
                </button>

                <button
                  onClick={() => setActiveTab('watchlist')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'watchlist' ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Danh sách</span>
                </button>

                <button
                  onClick={() => setActiveTab('continue')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'continue' ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span>Xem tiếp</span>
                </button>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'notifications' ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  <span>Thông báo</span>
                </button>

                <button
                  onClick={() => setActiveTab('account')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'account' ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span>Tài khoản</span>
                </button>
              </nav>

              {/* User Summary */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                    <img 
                      src={user.avatar || selectedAvatar || `https://i.pravatar.cc/150?img=${user._id?.slice(-2) || 1}`}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-white font-medium">{user.fullName || user.username || 'Người dùng'}</div>
                    <div className="text-gray-400 text-sm">{user.email}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-2xl p-8">
              {activeTab === 'account' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Tài khoản</h2>
                  <p className="text-gray-400 mb-8">Cập nhật thông tin tài khoản</p>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Info */}
                    <div className="lg:col-span-2 space-y-6">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Tên hiển thị</label>
                        <input
                          type="text"
                          value={profileForm.fullName}
                          onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          placeholder="Nhập tên hiển thị"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Giới tính</label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="gender"
                              value="male"
                              checked={profileForm.gender === 'male'}
                              onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}
                              className="mr-2 text-yellow-400"
                            />
                            <span className="text-white">Nam</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="gender"
                              value="female"
                              checked={profileForm.gender === 'female'}
                              onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}
                              className="mr-2 text-yellow-400"
                            />
                            <span className="text-white">Nữ</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="gender"
                              value="other"
                              checked={profileForm.gender === 'other'}
                              onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}
                              className="mr-2 text-yellow-400"
                            />
                            <span className="text-white">Khác</span>
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={handleUpdateProfile}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                      >
                        Cập nhật
                      </button>

                      <div>
                        <button
                          onClick={() => setShowChangePassword(true)}
                          className="text-yellow-400 hover:text-yellow-300 text-sm underline"
                        >
                          Đổi mật khẩu, nhấn vào đây
                        </button>
                      </div>
                    </div>

                    {/* Avatar Section */}
                    <div className="lg:col-span-1">
                      <div className="text-center">
                        <div className="relative inline-block">
                          <img 
                            src={user.avatar || selectedAvatar || `https://i.pravatar.cc/150?img=${user._id?.slice(-2) || 1}`}
                            alt="Avatar"
                            className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-gray-600"
                          />
                          <button
                            onClick={() => setShowAvatarModal(true)}
                            className="absolute bottom-0 right-0 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full p-2 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-gray-400 text-sm mt-2">Ảnh có sẵn</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other tabs content would go here */}
              {activeTab !== 'account' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {activeTab === 'favorites' && 'Yêu thích'}
                    {activeTab === 'watchlist' && 'Danh sách'}
                    {activeTab === 'continue' && 'Xem tiếp'}
                    {activeTab === 'notifications' && 'Thông báo'}
                  </h2>
                  <p className="text-gray-400">Nội dung sẽ được thêm vào</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-white mb-6">Đổi mật khẩu</h3>
              
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Mật khẩu cũ</label>
                  <input
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-3 rounded-lg transition-colors duration-200"
                  >
                    Đổi mật khẩu
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors duration-200"
                  >
                    Đóng
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Avatar Selection Modal */}
        {showAvatarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Đổi ảnh đại diện</h3>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Category Tabs */}
              <div className="flex space-x-2 mb-6">
                <button
                  onClick={() => setSelectedCategory('anime')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === 'anime' 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Hoạt hình
                </button>
                <button
                  onClick={() => setSelectedCategory('korea')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === 'korea' 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Hàn Quốc
                </button>
                <button
                  onClick={() => setSelectedCategory('china')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === 'china' 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Trung Quốc
                </button>
                <button
                  onClick={() => setSelectedCategory('vietnam')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === 'vietnam' 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Việt Nam
                </button>
                <button
                  onClick={() => setSelectedCategory('europe')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === 'europe' 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Âu-Mỹ
                </button>
                <button
                  onClick={() => setSelectedCategory('meme')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === 'meme' 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Meme
                </button>
              </div>

              {/* Avatar Grid */}
              <div className="grid grid-cols-6 gap-4 max-h-96 overflow-y-auto">
                {avatarCategories[selectedCategory]?.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => handleAvatarSelect(avatar)}
                    className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedAvatar === avatar ? 'border-yellow-400 ring-2 ring-yellow-400' : 'border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <img 
                      src={avatar} 
                      alt={`Avatar ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors duration-200"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;