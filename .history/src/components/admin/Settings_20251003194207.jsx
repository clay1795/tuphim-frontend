import { useState, useEffect } from 'react';
import { 
  CogIcon,
  GlobeAltIcon,
  BellIcon,
  ShieldCheckIcon,
  PhotoIcon,
  ServerIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Movie Trailer',
      siteDescription: 'Trang web xem phim trực tuyến chất lượng cao',
      siteUrl: 'https://movie-trailer.com',
      adminEmail: 'admin@movie-trailer.com',
      timezone: 'Asia/Ho_Chi_Minh',
      language: 'vi'
    },
    appearance: {
      theme: 'dark',
      primaryColor: '#dc2626',
      logoUrl: '/src/assets/logos/logo.jpg',
      faviconUrl: '/favicon.ico'
    },
    notifications: {
      emailNotifications: true,
      newUserNotification: true,
      newMovieNotification: true,
      systemAlerts: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8
    },
    api: {
      tmdbApiKey: '',
      youtubeApiKey: '',
      maxUploadSize: 100,
      allowedFormats: ['mp4', 'avi', 'mkv', 'mov']
    }
  });

  const tabs = [
    { id: 'general', name: 'Cài đặt chung', icon: CogIcon },
    { id: 'appearance', name: 'Giao diện', icon: PhotoIcon },
    { id: 'notifications', name: 'Thông báo', icon: BellIcon },
    { id: 'security', name: 'Bảo mật', icon: ShieldCheckIcon },
    { id: 'api', name: 'API & Tích hợp', icon: ServerIcon }
  ];

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    // Lưu cài đặt - trong thực tế sẽ gọi API
    console.log('Saving settings:', settings);
    alert('Cài đặt đã được lưu thành công!');
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên trang web *
          </label>
          <input
            type="text"
            value={settings.general.siteName}
            onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL trang web *
          </label>
          <input
            type="url"
            value={settings.general.siteUrl}
            onChange={(e) => handleInputChange('general', 'siteUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mô tả trang web
        </label>
        <textarea
          value={settings.general.siteDescription}
          onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email quản trị
          </label>
          <input
            type="email"
            value={settings.general.adminEmail}
            onChange={(e) => handleInputChange('general', 'adminEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Múi giờ
          </label>
          <select
            value={settings.general.timezone}
            onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chủ đề
          </label>
          <select
            value={settings.appearance.theme}
            onChange={(e) => handleInputChange('appearance', 'theme', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="dark">Tối</option>
            <option value="light">Sáng</option>
            <option value="auto">Tự động</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Màu chủ đạo
          </label>
          <input
            type="color"
            value={settings.appearance.primaryColor}
            onChange={(e) => handleInputChange('appearance', 'primaryColor', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL Logo
          </label>
          <input
            type="url"
            value={settings.appearance.logoUrl}
            onChange={(e) => handleInputChange('appearance', 'logoUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL Favicon
          </label>
          <input
            type="url"
            value={settings.appearance.faviconUrl}
            onChange={(e) => handleInputChange('appearance', 'faviconUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Thông báo qua email</h3>
            <p className="text-sm text-gray-500">Gửi thông báo qua email</p>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications.emailNotifications}
            onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Thông báo người dùng mới</h3>
            <p className="text-sm text-gray-500">Thông báo khi có người dùng đăng ký mới</p>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications.newUserNotification}
            onChange={(e) => handleInputChange('notifications', 'newUserNotification', e.target.checked)}
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Thông báo phim mới</h3>
            <p className="text-sm text-gray-500">Thông báo khi có phim mới được tải lên</p>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications.newMovieNotification}
            onChange={(e) => handleInputChange('notifications', 'newMovieNotification', e.target.checked)}
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Cảnh báo hệ thống</h3>
            <p className="text-sm text-gray-500">Nhận cảnh báo về các vấn đề hệ thống</p>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications.systemAlerts}
            onChange={(e) => handleInputChange('notifications', 'systemAlerts', e.target.checked)}
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Xác thực 2 yếu tố</h3>
            <p className="text-sm text-gray-500">Bật xác thực 2 yếu tố cho tài khoản admin</p>
          </div>
          <input
            type="checkbox"
            checked={settings.security.twoFactorAuth}
            onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thời gian hết hạn phiên (phút)
          </label>
          <input
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
            min="5"
            max="480"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số lần đăng nhập thất bại tối đa
          </label>
          <input
            type="number"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
            min="3"
            max="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Độ dài mật khẩu tối thiểu
          </label>
          <input
            type="number"
            value={settings.security.passwordMinLength}
            onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
            min="6"
            max="20"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            TMDB API Key
          </label>
          <input
            type="password"
            value={settings.api.tmdbApiKey}
            onChange={(e) => handleInputChange('api', 'tmdbApiKey', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            YouTube API Key
          </label>
          <input
            type="password"
            value={settings.api.youtubeApiKey}
            onChange={(e) => handleInputChange('api', 'youtubeApiKey', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kích thước tải lên tối đa (MB)
        </label>
        <input
          type="number"
          value={settings.api.maxUploadSize}
          onChange={(e) => handleInputChange('api', 'maxUploadSize', parseInt(e.target.value))}
          min="10"
          max="1000"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Định dạng file được phép (phân cách bằng dấu phẩy)
        </label>
        <input
          type="text"
          value={settings.api.allowedFormats.join(', ')}
          onChange={(e) => handleInputChange('api', 'allowedFormats', e.target.value.split(',').map(f => f.trim()))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'api':
        return renderApiSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
        <p className="text-gray-600">Quản lý cài đặt và cấu hình của trang web</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.name}
              </h2>
            </div>
            
            {renderTabContent()}
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Lưu cài đặt
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
