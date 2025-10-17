import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import ThemeToggle from "./ThemeToggle";
import AuthModal from "./AuthModal";
import { useAuth } from "../context/AuthContextSimple";

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
  const { user, logout, isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHomePage, setIsHomePage] = useState(true);
  const [logoImage, setLogoImage] = useState("https://www.rophim.mx/images/logo.svg");
  const [logoText] = useState("PhimBro");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  // Cleanup scroll lock on unmount
  useEffect(() => {
    return () => {
      // Restore scroll position on unmount
      const scrollY = document.body.getAttribute('data-scroll-y');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY));
      }
      
      document.body.removeAttribute('data-scroll-y');
    };
  }, []);

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
  const openAuthModal = (e) => {
    e.preventDefault(); // Prevent default behavior
    
    // Capture scroll position BEFORE setting modal state
    const scrollY = window.scrollY;
    console.log('Header: Capturing scroll position:', scrollY);
    
    // Store scroll position immediately
    document.body.setAttribute('data-scroll-y', scrollY);
    
    // Lock scroll immediately with smooth transition
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.transition = 'none'; // Disable transition during lock
    
    console.log('Header: Locked scroll at position:', scrollY);
    
    // Use requestAnimationFrame to ensure DOM is ready before showing modal
    requestAnimationFrame(() => {
      setShowAuthModal(true);
    });
  };

  const closeAuthModal = () => {
    // Get stored scroll position
    const scrollY = document.body.getAttribute('data-scroll-y');
    console.log('Header: Restoring scroll position:', scrollY);
    
    // Restore body styles
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    document.body.style.transition = ''; // Re-enable transitions
    
    // Restore scroll position
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY));
      console.log('Header: Restored to position:', scrollY);
    }
    
    // Clean up data attribute
    document.body.removeAttribute('data-scroll-y');
    
    // Then close modal
    setShowAuthModal(false);
  };

  // Logo được cấu hình trực tiếp trong state ở trên
  // Để thay đổi logo, chỉnh sửa giá trị logoImage trong useState


  const handleSearch = () => {
    if (search.trim()) {
      // Navigate to browse page with keyword
      navigate(`/duyet-tim?keyword=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Mapping from display names to slugs
  const categoryMapping = {
    'Hành Động': 'hanh-dong',
    'Viễn Tưởng': 'vien-tuong',
    'Bí Ẩn': 'bi-an',
    'Tâm Lý': 'tam-ly',
    'Âm Nhạc': 'am-nhac',
    'Hài Hước': 'hai-huoc',
    'Khoa Học': 'khoa-hoc',
    'Kinh Điển': 'kinh-dien',
    'Cổ Trang': 'co-trang',
    'Kinh Dị': 'kinh-di',
    'Phim 18+': 'phim-18',
    'Thể Thao': 'the-thao',
    'Gia Đình': 'gia-dinh',
    'Hình Sự': 'hinh-su',
    'Thần Thoại': 'than-thoai',
    'Chiến Tranh': 'chien-tranh',
    'Tài Liệu': 'tai-lieu',
    'Tình Cảm': 'tinh-cam',
    'Phiêu Lưu': 'phieu-luu',
    'Học Đường': 'hoc-duong',
    'Võ Thuật': 'vo-thuat',
    'Chính Kịch': 'chinh-kich'
  };

  const countryMapping = {
    'Trung Quốc': 'trung-quoc',
    'Pháp': 'phap',
    'Mexico': 'mexico',
    'Đan Mạch': 'dan-mach',
    'Hàn Quốc': 'han-quoc',
    'Canada': 'canada',
    'Ba Lan': 'ba-lan',
    'UAE': 'uae',
    'Nhật Bản': 'nhat-ban',
    'Thổ Nhĩ Kỳ': 'tho-nhi-ky',
    'Brazil': 'brazil',
    'Nam Phi': 'nam-phi',
    'Thái Lan': 'thai-lan',
    'Đức': 'duc',
    'Thụy Điển': 'thuy-dien',
    'Thụy Sĩ': 'thuy-si',
    'Âu Mỹ': 'au-my',
    'Tây Ban Nha': 'tay-ban-nha',
    'Malaysia': 'malaysia',
    'Châu Phi': 'chau-phi',
    'Đài Loan': 'dai-loan',
    'Nga': 'nga',
    'Ý': 'y',
    'Việt Nam': 'viet-nam',
    'Hồng Kông': 'hong-kong',
    'Hà Lan': 'ha-lan',
    'Philippines': 'philippines',
    'Ukraina': 'ukraina',
    'Ấn Độ': 'an-do',
    'Indonesia': 'indonesia',
    'Bồ Đào Nha': 'bo-dao-nha',
    'Ả Rập Xê Út': 'a-rap-xe-ut',
    'Anh': 'anh',
    'Úc': 'uc',
    'Na Uy': 'na-uy',
    'Quốc Gia Khác': 'quoc-gia-khac'
  };

  const handleCategoryChange = (category) => {
    const slug = categoryMapping[category] || category.toLowerCase().replace(/\s+/g, '-');
    navigate(`/duyet-tim?category=${encodeURIComponent(slug)}`);
  };

  const handleCountryChange = (country) => {
    const slug = countryMapping[country] || country.toLowerCase().replace(/\s+/g, '-');
    navigate(`/duyet-tim?country=${encodeURIComponent(slug)}`);
  };

  const handleYearChange = (year) => {
    navigate(`/duyet-tim?year=${year}`);
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
    <div className={`sticky top-0 z-[9999] transition-all duration-300 ${
      shouldShowBackground 
        ? 'bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/30 shadow-md' 
        : 'bg-transparent'
    }`}>
      {/* Header Content - No background overlay */}
      <div className="relative z-10">
      {/* Main Header */}
      <div className="px-2 sm:px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo + Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
            {/* Logo */}
            <Link to="/" className="flex items-center" onClick={handleLogoClick}>
              <Logo logoImage={logoImage} logoText={logoText} onImageError={handleLogoError} />
            </Link>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 text-white hover:text-yellow-400 transition-colors touch-target"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Navigation Menu */}
            <nav className="hidden lg:flex items-center space-x-4">
              <Link 
                to="/duyet-tim" 
                className="text-white hover:text-yellow-400 transition-colors duration-300 font-medium text-sm"
              >
                Duyệt Tìm
              </Link>

              <Link 
                to="/duyet-tim?type=series" 
                className="text-white hover:text-yellow-400 transition-colors duration-300 font-medium text-sm"
              >
                Phim Bộ
              </Link>

              <Link 
                to="/duyet-tim?type=single" 
                className="text-white hover:text-yellow-400 transition-colors duration-300 font-medium text-sm"
              >
                Phim Lẻ
              </Link>

              <Link 
                to="/duyet-tim?type=tvshows" 
                className="text-white hover:text-yellow-400 transition-colors duration-300 font-medium text-sm"
              >
                TV Shows
              </Link>

              <Link 
                to="/duyet-tim?type=hoathinh" 
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

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700 shadow-xl z-50">
            <div className="px-4 py-4 space-y-2">
              <Link 
                to="/duyet-tim" 
                className="block text-white hover:text-yellow-400 transition-colors duration-300 font-medium py-2 px-3 rounded-lg hover:bg-gray-800"
                onClick={() => setShowMobileMenu(false)}
              >
                Duyệt Tìm
              </Link>
              
              <Link 
                to="/duyet-tim?type=series" 
                className="block text-white hover:text-yellow-400 transition-colors duration-300 font-medium py-2 px-3 rounded-lg hover:bg-gray-800"
                onClick={() => setShowMobileMenu(false)}
              >
                Phim Bộ
              </Link>
              
              <Link 
                to="/duyet-tim?type=single" 
                className="block text-white hover:text-yellow-400 transition-colors duration-300 font-medium py-2 px-3 rounded-lg hover:bg-gray-800"
                onClick={() => setShowMobileMenu(false)}
              >
                Phim Lẻ
              </Link>
              
              <Link 
                to="/duyet-tim?type=tvshows" 
                className="block text-white hover:text-yellow-400 transition-colors duration-300 font-medium py-2 px-3 rounded-lg hover:bg-gray-800"
                onClick={() => setShowMobileMenu(false)}
              >
                TV Shows
              </Link>
              
              <Link 
                to="/duyet-tim?type=hoathinh" 
                className="block text-white hover:text-yellow-400 transition-colors duration-300 font-medium py-2 px-3 rounded-lg hover:bg-gray-800"
                onClick={() => setShowMobileMenu(false)}
              >
                Hoạt Hình
              </Link>
            </div>
          </div>
        )}
      </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-2 sm:mx-4 lg:mx-6">
            <div className="relative group flex">
        <input
          type="text"
                placeholder="Tìm kiếm phim..."
                className="w-full px-2 sm:px-3 py-2 pl-8 sm:pl-10 pr-10 sm:pr-12 bg-gray-800/50 border border-gray-700 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300 backdrop-blur-sm text-xs sm:text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-400 transition-colors duration-300">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={handleSearch}
                className="px-2 sm:px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-r-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                title="Tìm kiếm"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              /* User Menu */
              <div className="relative user-menu-container">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-1 sm:space-x-2 text-white hover:text-yellow-400 transition-colors duration-300 group"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">{user.fullName || user.username}</div>
                    <div className="text-xs text-gray-400">
                      {isAdmin() ? 'Quản trị viên' : 'Thành viên'}
                    </div>
                  </div>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
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
                        <Link
                          to="/sync"
                          className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors duration-200"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                            </svg>
                            <span>Sync Manager</span>
                          </div>
                        </Link>
                        <div className="border-t border-gray-700 my-1"></div>
                      </>
                    )}
                    <Link
                      to="/user/profile"
                      className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors duration-200"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        <span>Tài khoản</span>
                      </div>
                    </Link>
                    <Link
                      to="/user/playlist"
                      className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors duration-200"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span>Xem sau</span>
                      </div>
                    </Link>
                    <Link
                      to="/user/favorite"
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
                    <Link
                      to="/user/xem-tiep"
                      className="block px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors duration-200"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                        </svg>
                        <span>Xem tiếp</span>
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
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={closeAuthModal} 
      />
    </div>
  );
};

// Header component không cần PropTypes vì không nhận props từ parent

export default Header;