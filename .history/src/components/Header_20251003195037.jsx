import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

// Component Logo linh hoạt
const Logo = ({ logoImage, logoText = "PhimBro", onImageError }) => {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
    if (onImageError) {
      onImageError();
    }
  };

  return (
    <div className="relative min-w-[120px]">
      {logoImage && !imageError ? (
        // Logo từ ảnh upload
        <div className="relative">
          <img 
            src={logoImage} 
            alt="Logo" 
            className="max-h-16 w-auto rounded-lg shadow-lg"
            onError={handleImageError}
          />
        </div>
      ) : (
        // Logo text fallback với gradient
        <div className="text-3xl font-bold cursor-pointer min-w-[120px]">
          <span className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-pink-300 bg-clip-text text-transparent font-serif italic">
            {logoText}
          </span>
        </div>
      )}
    </div>
  );
};

// PropTypes cho Logo component
Logo.propTypes = {
  logoImage: PropTypes.string,
  logoText: PropTypes.string,
  onImageError: PropTypes.func,
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, register, logout, isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHomePage, setIsHomePage] = useState(true);
  const [logoImage, setLogoImage] = useState("https://www.rophim.mx/images/logo.svg");
  const [logoText] = useState("PhimBro");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [authForm, setAuthForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Check if we're on home page
  useEffect(() => {
    setIsHomePage(location.pathname === '/');
  }, [location.pathname]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50); // Show shadow after scrolling 50px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Function xử lý lỗi logo
  const handleLogoError = () => {
    setLogoImage(null); // Chuyển về logo text
  };

  // Function xử lý click logo
  const handleLogoClick = (e) => {
    if (location.pathname === '/') {
      // Nếu đang ở trang chủ, reload trang
      e.preventDefault();
      window.location.reload();
    }
    // Nếu không ở trang chủ, để Link component xử lý navigation bình thường
  };

  // Functions xử lý auth modal
  const openAuthModal = () => {
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthForm({
      displayName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setAuthForm({
      displayName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleAuthFormChange = (e) => {
    setAuthForm({
      ...authForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (isLogin) {
        // Handle login
        const result = await login({
          email: authForm.email,
          password: authForm.password
        });

        if (result.success) {
          closeAuthModal();
          
          // Redirect admin to admin panel
          if (result.redirectTo) {
            navigate(result.redirectTo);
          }
        } else {
          setAuthError(result.message);
        }
      } else {
        // Handle registration
        if (authForm.password !== authForm.confirmPassword) {
          setAuthError('Mật khẩu xác nhận không khớp');
          setAuthLoading(false);
          return;
        }

        const result = await register({
          email: authForm.email,
          password: authForm.password,
          displayName: authForm.displayName
        });

        if (result.success) {
          closeAuthModal();
        } else {
          setAuthError(result.message);
        }
      }
    } catch (error) {
      setAuthError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Logo được cấu hình trực tiếp trong state ở trên
  // Để thay đổi logo, chỉnh sửa giá trị logoImage trong useState


  const handleSearch = () => {
    if (search.trim()) {
      // Navigate to search page with keyword
      navigate(`/tim-kiem?keyword=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategoryChange = (category) => {
    navigate(`/tim-kiem?category=${encodeURIComponent(category)}`);
  };

  const handleCountryChange = (country) => {
    navigate(`/tim-kiem?country=${encodeURIComponent(country)}`);
  };

  const handleYearChange = (year) => {
    navigate(`/tim-kiem?year=${year}`);
  };

  // Helper function to render clickable items
  const renderClickableItem = (text, onClick, isActive = false) => (
    <div 
      className={`text-white hover:bg-gray-700 px-2 py-1 rounded-md transition-colors duration-200 cursor-pointer text-sm ${
        isActive ? 'bg-purple-600' : ''
      }`}
      onClick={onClick}
    >
      {text}
    </div>
  );

  // Determine if background should be shown
  const shouldShowBackground = isScrolled || !isHomePage;

  return (
    <div className={`sticky top-0 z-[100] transition-all duration-300 ${
      shouldShowBackground 
        ? 'bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/30 shadow-md' 
        : 'bg-transparent'
    }`}>
      {/* Header Content - No background overlay */}
      <div className="relative z-10">
      {/* Main Header */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo + Navigation */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <Link to="/" className="flex items-center" onClick={handleLogoClick}>
              <Logo logoImage={logoImage} logoText={logoText} onImageError={handleLogoError} />
            </Link>

            {/* Navigation Menu */}
            <nav className="hidden lg:flex items-center space-x-4">
              <Link 
                to="/tim-kiem" 
                className="text-white hover:text-yellow-400 transition-colors duration-300 font-medium text-sm"
              >
                Duyệt Tìm
              </Link>

              <Link 
                to="/tim-kiem?type=Phim Bộ" 
                className="text-white hover:text-yellow-400 transition-colors duration-300 font-medium text-sm"
              >
                Phim Bộ
              </Link>

              <Link 
                to="/tim-kiem?type=Phim Lẻ" 
                className="text-white hover:text-yellow-400 transition-colors duration-300 font-medium text-sm"
              >
                Phim Lẻ
              </Link>

              <Link 
                to="/tim-kiem?type=TV Shows" 
                className="text-white hover:text-yellow-400 transition-colors duration-300 font-medium text-sm"
              >
                TV Shows
              </Link>

              <Link 
                to="/tim-kiem?type=Hoạt Hình" 
                className="text-white hover:text-yellow-400 transition-colors duration-300 font-medium text-sm"
              >
                Hoạt Hình
              </Link>
              
              {/* Thể Loại Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-1 text-white hover:text-yellow-400 transition-colors duration-300 font-medium text-sm">
                  <span>Thể Loại</span>
                  <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </button>
            
            {/* Dropdown Content */}
            <div className="absolute top-full left-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999]">
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    {renderClickableItem('Hành Động', () => handleCategoryChange('Hành Động'), true)}
                    {renderClickableItem('Viễn Tưởng', () => handleCategoryChange('Viễn Tưởng'))}
                    {renderClickableItem('Bí Ẩn', () => handleCategoryChange('Bí Ẩn'))}
                    {renderClickableItem('Tâm Lý', () => handleCategoryChange('Tâm Lý'))}
                    {renderClickableItem('Âm Nhạc', () => handleCategoryChange('Âm Nhạc'))}
                    {renderClickableItem('Hài Hước', () => handleCategoryChange('Hài Hước'))}
                    {renderClickableItem('Khoa Học', () => handleCategoryChange('Khoa Học'))}
                    {renderClickableItem('Kinh Điển', () => handleCategoryChange('Kinh Điển'))}
                  </div>
                  
                  <div className="space-y-2">
                    {renderClickableItem('Cổ Trang', () => handleCategoryChange('Cổ Trang'))}
                    {renderClickableItem('Kinh Dị', () => handleCategoryChange('Kinh Dị'))}
                    {renderClickableItem('Phim 18+', () => handleCategoryChange('Phim 18+'))}
                    {renderClickableItem('Thể Thao', () => handleCategoryChange('Thể Thao'))}
                    {renderClickableItem('Gia Đình', () => handleCategoryChange('Gia Đình'))}
                    {renderClickableItem('Hình Sự', () => handleCategoryChange('Hình Sự'))}
                    {renderClickableItem('Thần Thoại', () => handleCategoryChange('Thần Thoại'))}
                  </div>
                  
                  <div className="space-y-2">
                    {renderClickableItem('Chiến Tranh', () => handleCategoryChange('Chiến Tranh'))}
                    {renderClickableItem('Tài Liệu', () => handleCategoryChange('Tài Liệu'))}
                    {renderClickableItem('Tình Cảm', () => handleCategoryChange('Tình Cảm'))}
                    {renderClickableItem('Phiêu Lưu', () => handleCategoryChange('Phiêu Lưu'))}
                    {renderClickableItem('Học Đường', () => handleCategoryChange('Học Đường'))}
                    {renderClickableItem('Võ Thuật', () => handleCategoryChange('Võ Thuật'))}
                    {renderClickableItem('Chính Kịch', () => handleCategoryChange('Chính Kịch'))}
                  </div>
                </div>
              </div>
            </div>
              </div>

              {/* Quốc Gia Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-1 text-white hover:text-yellow-400 transition-colors duration-300 font-medium text-sm">
                  <span>Quốc Gia</span>
                  <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </button>
            
            {/* Dropdown Content */}
            <div className="absolute top-full left-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999]">
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    {renderClickableItem('Trung Quốc', () => handleCountryChange('Trung Quốc'), true)}
                    {renderClickableItem('Pháp', () => handleCountryChange('Pháp'))}
                    {renderClickableItem('Mexico', () => handleCountryChange('Mexico'))}
                    {renderClickableItem('Đan Mạch', () => handleCountryChange('Đan Mạch'))}
                    {renderClickableItem('Hàn Quốc', () => handleCountryChange('Hàn Quốc'))}
                    {renderClickableItem('Canada', () => handleCountryChange('Canada'))}
                    {renderClickableItem('Ba Lan', () => handleCountryChange('Ba Lan'))}
                    {renderClickableItem('UAE', () => handleCountryChange('UAE'))}
                    {renderClickableItem('Nhật Bản', () => handleCountryChange('Nhật Bản'))}
                    {renderClickableItem('Thổ Nhĩ Kỳ', () => handleCountryChange('Thổ Nhĩ Kỳ'))}
                    {renderClickableItem('Brazil', () => handleCountryChange('Brazil'))}
                    {renderClickableItem('Nam Phi', () => handleCountryChange('Nam Phi'))}
                  </div>
                  
                  <div className="space-y-2">
                    {renderClickableItem('Thái Lan', () => handleCountryChange('Thái Lan'))}
                    {renderClickableItem('Đức', () => handleCountryChange('Đức'))}
                    {renderClickableItem('Thụy Điển', () => handleCountryChange('Thụy Điển'))}
                    {renderClickableItem('Thụy Sĩ', () => handleCountryChange('Thụy Sĩ'))}
                    {renderClickableItem('Âu Mỹ', () => handleCountryChange('Âu Mỹ'))}
                    {renderClickableItem('Tây Ban Nha', () => handleCountryChange('Tây Ban Nha'))}
                    {renderClickableItem('Malaysia', () => handleCountryChange('Malaysia'))}
                    {renderClickableItem('Châu Phi', () => handleCountryChange('Châu Phi'))}
                    {renderClickableItem('Đài Loan', () => handleCountryChange('Đài Loan'))}
                    {renderClickableItem('Nga', () => handleCountryChange('Nga'))}
                    {renderClickableItem('Ý', () => handleCountryChange('Ý'))}
                    {renderClickableItem('Việt Nam', () => handleCountryChange('Việt Nam'))}
                  </div>
                  
                  <div className="space-y-2">
                    {renderClickableItem('Hồng Kông', () => handleCountryChange('Hồng Kông'))}
                    {renderClickableItem('Hà Lan', () => handleCountryChange('Hà Lan'))}
                    {renderClickableItem('Philippines', () => handleCountryChange('Philippines'))}
                    {renderClickableItem('Ukraina', () => handleCountryChange('Ukraina'))}
                    {renderClickableItem('Ấn Độ', () => handleCountryChange('Ấn Độ'))}
                    {renderClickableItem('Indonesia', () => handleCountryChange('Indonesia'))}
                    {renderClickableItem('Bồ Đào Nha', () => handleCountryChange('Bồ Đào Nha'))}
                    {renderClickableItem('Ả Rập Xê Út', () => handleCountryChange('Ả Rập Xê Út'))}
                    {renderClickableItem('Anh', () => handleCountryChange('Anh'))}
                    {renderClickableItem('Úc', () => handleCountryChange('Úc'))}
                    {renderClickableItem('Na Uy', () => handleCountryChange('Na Uy'))}
                    {renderClickableItem('Quốc Gia Khác', () => handleCountryChange('Quốc Gia Khác'))}
                  </div>
                </div>
              </div>
            </div>
              </div>

              {/* Năm Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-1 text-white hover:text-yellow-400 transition-colors duration-300 font-medium text-sm">
                  <span>Năm</span>
                  <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </button>
            
            {/* Dropdown Content */}
            <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999]">
              <div className="p-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    {renderClickableItem('2026', () => handleYearChange('2026'), true)}
                    {renderClickableItem('2023', () => handleYearChange('2023'))}
                    {renderClickableItem('2020', () => handleYearChange('2020'))}
                    {renderClickableItem('2017', () => handleYearChange('2017'))}
                    {renderClickableItem('2014', () => handleYearChange('2014'))}
                    {renderClickableItem('2011', () => handleYearChange('2011'))}
                    {renderClickableItem('2008', () => handleYearChange('2008'))}
                    {renderClickableItem('2005', () => handleYearChange('2005'))}
                    {renderClickableItem('2002', () => handleYearChange('2002'))}
                  </div>
                  
                  <div className="space-y-2">
                    {renderClickableItem('2025', () => handleYearChange('2025'))}
                    {renderClickableItem('2022', () => handleYearChange('2022'))}
                    {renderClickableItem('2019', () => handleYearChange('2019'))}
                    {renderClickableItem('2016', () => handleYearChange('2016'))}
                    {renderClickableItem('2013', () => handleYearChange('2013'))}
                    {renderClickableItem('2010', () => handleYearChange('2010'))}
                    {renderClickableItem('2007', () => handleYearChange('2007'))}
                    {renderClickableItem('2004', () => handleYearChange('2004'))}
                    {renderClickableItem('2001', () => handleYearChange('2001'))}
                  </div>
                  
                  <div className="space-y-2">
                    {renderClickableItem('2024', () => handleYearChange('2024'))}
                    {renderClickableItem('2021', () => handleYearChange('2021'))}
                    {renderClickableItem('2018', () => handleYearChange('2018'))}
                    {renderClickableItem('2015', () => handleYearChange('2015'))}
                    {renderClickableItem('2012', () => handleYearChange('2012'))}
                    {renderClickableItem('2009', () => handleYearChange('2009'))}
                    {renderClickableItem('2006', () => handleYearChange('2006'))}
                    {renderClickableItem('2003', () => handleYearChange('2003'))}
                    {renderClickableItem('2000', () => handleYearChange('2000'))}
                  </div>
                </div>
              </div>
            </div>
              </div>
        </nav>
      </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-6">
            <div className="relative group">
        <input
          type="text"
                placeholder="Tìm kiếm phim, diễn viên"
                className="w-full px-3 py-2 pl-10 pr-4 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 backdrop-blur-sm text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-400 transition-colors duration-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {user ? (
              /* User Menu */
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-white hover:text-yellow-400 transition-colors duration-300 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">{user.fullName || user.username}</div>
                    <div className="text-xs text-gray-400">
                      {isAdmin() ? 'Quản trị viên' : 'Thành viên'}
                    </div>
                  </div>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-700 py-1 z-50">
                    {isAdmin() && (
                      <>
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors duration-200"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                            <span>Admin Panel</span>
                          </div>
                        </Link>
                        <div className="border-t border-gray-700 my-1"></div>
                      </>
                    )}
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors duration-200"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        <span>Hồ sơ cá nhân</span>
                      </div>
                    </Link>
                    <Link
                      to="/favorites"
                      className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors duration-200"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <span>Yêu thích</span>
                      </div>
                    </Link>
                    <div className="border-t border-gray-700 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                        </svg>
                        <span>Đăng xuất</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Login Button */
              <button 
                onClick={openAuthModal}
                className="flex items-center space-x-2 text-white hover:text-yellow-400 transition-colors duration-300 group"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <span className="text-sm font-medium">Thành viên</span>
              </button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeAuthModal}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-gray-900 rounded-lg shadow-2xl w-full max-w-md mx-4">
            {/* Close Button */}
            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="p-6 pb-4">
              <h2 className="text-2xl font-bold text-white mb-2">
                {isLogin ? 'Đăng nhập' : 'Tạo tài khoản mới'}
              </h2>
              <p className="text-gray-300 text-sm">
                {isLogin ? (
                  <>Nếu bạn chưa có tài khoản,{' '}
                    <button 
                      onClick={toggleAuthMode}
                      className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
                    >
                      đăng ký ngay
                    </button>
                  </>
                ) : (
                  <>Nếu bạn đã có tài khoản,{' '}
                    <button 
                      onClick={toggleAuthMode}
                      className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
                    >
                      đăng nhập
                    </button>
                  </>
                )}
              </p>
            </div>

            {/* Modal Body */}
            <div className="px-6 pb-6">
              {/* Error Message */}
              {authError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg text-sm">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {/* Display Name - chỉ hiển thị khi đăng ký */}
                {!isLogin && (
                  <div>
                    <input
                      type="text"
                      name="displayName"
                      placeholder="Tên hiển thị"
                      value={authForm.displayName}
                      onChange={handleAuthFormChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                      required={!isLogin}
                    />
                  </div>
                )}

                {/* Email */}
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={authForm.email}
                    onChange={handleAuthFormChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Mật khẩu"
                    value={authForm.password}
                    onChange={handleAuthFormChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {/* Confirm Password - chỉ hiển thị khi đăng ký */}
                {!isLogin && (
                  <div>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Nhập lại mật khẩu"
                      value={authForm.confirmPassword}
                      onChange={handleAuthFormChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                      required={!isLogin}
                    />
                  </div>
                )}


                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors duration-200"
                >
                  {authLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>{isLogin ? 'Đang đăng nhập...' : 'Đang đăng ký...'}</span>
                    </div>
                  ) : (
                    isLogin ? 'Đăng nhập' : 'Đăng ký'
                  )}
                </button>

                {/* Forgot Password - chỉ hiển thị khi đăng nhập */}
                {isLogin && (
                  <div className="text-center">
                    <button 
                      type="button"
                      className="text-white hover:text-yellow-400 transition-colors duration-200 text-sm"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                )}

                {/* Demo Accounts */}
                {isLogin && (
                  <div className="text-center space-y-2">
                    <div className="text-xs text-gray-400">
                      Tài khoản demo:
                    </div>
                    <div className="text-xs text-gray-300 space-y-1">
                      <div><strong>Admin:</strong> admin@example.com / admin123</div>
                      <div><strong>Member:</strong> member@example.com / member123</div>
                    </div>
                  </div>
                )}

                {/* Google Login */}
                <button
                  type="button"
                  className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Đăng nhập bằng Google</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Header component không cần PropTypes vì không nhận props từ parent

export default Header;