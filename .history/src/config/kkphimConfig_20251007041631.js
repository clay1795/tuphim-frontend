// KKPhim Configuration - Cấu hình tất cả domain và endpoints
// Tài liệu: https://kkphim1.com/tai-lieu-api

export const KKPHIM_CONFIG = {
  // Domains chính
  domains: {
    main: 'kkphim1.com',
    backup: 'kkphim.vip',
    api: 'phimapi.com',
    images: 'phimimg.com',
    player: 'player.phimapi.com'
  },

  // API Endpoints
  api: {
    base: 'https://phimapi.com',
    documentation: 'https://kkphim1.com/tai-lieu-api',
    
    // Phim mới cập nhật
    newMovies: {
      v1: '/danh-sach/phim-moi-cap-nhat',
      v2: '/danh-sach/phim-moi-cap-nhat-v2',
      v3: '/danh-sach/phim-moi-cap-nhat-v3'
    },
    
    // Chi tiết phim
    movieDetail: '/phim/{slug}',
    
    // TMDB
    tmdb: '/tmdb/{type}/{id}',
    
    // Danh sách tổng hợp
    moviesList: '/v1/api/danh-sach/{type_list}',
    
    // Tìm kiếm
    search: '/v1/api/tim-kiem',
    
    // Thể loại
    categories: '/the-loai',
    categoryDetail: '/v1/api/the-loai/{slug}',
    
    // Quốc gia
    countries: '/quoc-gia',
    countryDetail: '/v1/api/quoc-gia/{slug}',
    
    // Năm
    yearDetail: '/v1/api/nam/{year}',
    
    // Chuyển đổi ảnh
    imageConverter: '/image.php'
  },

  // Image endpoints
  images: {
    base: 'https://phimimg.com',
    webp: 'https://phimapi.com/image.php?url='
  },

  // Player endpoints
  player: {
    base: 'https://player.phimapi.com/player/?url='
  },

  // Rate limiting
  rateLimit: {
    requestsPerMinute: 100,
    cacheDuration: 5 * 60 * 1000, // 5 phút
    timeout: 15000 // 15 giây
  },

  // Movie types
  movieTypes: {
    'phim-bo': 'Phim Bộ',
    'phim-le': 'Phim Lẻ',
    'tv-shows': 'TV Shows',
    'hoat-hinh': 'Hoạt Hình',
    'phim-vietsub': 'Phim Vietsub',
    'phim-thuyet-minh': 'Phim Thuyết Minh',
    'phim-long-tieng': 'Phim Lồng Tiếng'
  },

  // Sort fields
  sortFields: {
    'modified_time': 'Thời gian cập nhật',
    '_id': 'ID phim',
    'year': 'Năm phát hành'
  },

  // Sort types
  sortTypes: {
    'desc': 'Giảm dần',
    'asc': 'Tăng dần'
  },

  // Languages
  languages: {
    'vietsub': 'Vietsub',
    'thuyet-minh': 'Thuyết Minh',
    'long-tieng': 'Lồng Tiếng'
  },

  // Years (1970 - current year)
  getAvailableYears: () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1970; year--) {
      years.push(year);
    }
    return years;
  },

  // Popular categories
  popularCategories: [
    'hanh-dong', 'tinh-cam', 'hai-huoc', 'kinh-di', 'vien-tuong',
    'the-thao', 'am-nhac', 'phieu-luu', 'chien-tranh', 'toi-pham',
    'bi-an', 'gia-dinh', 'tai-lieu', 'lich-su', 'hoat-hinh'
  ],

  // Popular countries
  popularCountries: [
    'viet-nam', 'trung-quoc', 'han-quoc', 'nhat-ban', 'my',
    'thai-lan', 'hong-kong', 'phap', 'duc', 'anh'
  ],

  // Utility functions
  utils: {
    // Build full API URL
    buildApiUrl: (endpoint, params = {}) => {
      let url = `${KKPHIM_CONFIG.api.base}${endpoint}`;
      
      // Replace path parameters
      Object.keys(params).forEach(key => {
        if (url.includes(`{${key}}`)) {
          url = url.replace(`{${key}}`, params[key]);
        }
      });
      
      return url;
    },

    // Build query parameters
    buildQueryParams: (params) => {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      return queryParams.toString();
    },

    // Get optimized image URL
    getOptimizedImageUrl: (imageUrl, size = 'original') => {
      if (!imageUrl) return '';
      
      // Nếu đã là URL từ phimimg.com, trả về nguyên
      if (imageUrl.includes('phimimg.com')) {
        return imageUrl;
      }
      
      // Nếu là URL từ KKPhim, chuyển đổi sang phimimg.com
      if (imageUrl.includes('kkphim') || imageUrl.includes('phimapi')) {
        return imageUrl.replace(/https?:\/\/[^\/]+/, KKPHIM_CONFIG.images.base);
      }
      
      return imageUrl;
    },

    // Get WebP image URL
    getWebpImageUrl: (imageUrl) => {
      if (!imageUrl) return '';
      return `${KKPHIM_CONFIG.images.webp}${encodeURIComponent(imageUrl)}`;
    },

    // Get player URL
    getPlayerUrl: (videoUrl) => {
      if (!videoUrl) return '';
      return `${KKPHIM_CONFIG.player.base}${encodeURIComponent(videoUrl)}`;
    },

    // Check if URL is from KKPhim
    isKKPhimUrl: (url) => {
      if (!url) return false;
      return url.includes('kkphim') || url.includes('phimapi') || url.includes('phimimg');
    },

    // Get fallback data
    getFallbackData: (type) => {
      const fallbacks = {
        movies: {
          items: [],
          totalItems: 0,
          totalPages: 0,
          currentPage: 1,
          fallback: true,
          message: 'Không thể tải danh sách phim. Vui lòng thử lại sau.'
        },
        movieDetail: {
          movie: null,
          episodes: [],
          fallback: true,
          message: 'Không thể tải thông tin phim. Vui lòng thử lại sau.'
        },
        categories: {
          items: [
            { name: 'Hành động', slug: 'hanh-dong' },
            { name: 'Tình cảm', slug: 'tinh-cam' },
            { name: 'Hài hước', slug: 'hai-huoc' },
            { name: 'Kinh dị', slug: 'kinh-di' },
            { name: 'Viễn tưởng', slug: 'vien-tuong' }
          ],
          fallback: true
        },
        countries: {
          items: [
            { name: 'Việt Nam', slug: 'viet-nam' },
            { name: 'Trung Quốc', slug: 'trung-quoc' },
            { name: 'Hàn Quốc', slug: 'han-quoc' },
            { name: 'Nhật Bản', slug: 'nhat-ban' },
            { name: 'Mỹ', slug: 'my' }
          ],
          fallback: true
        }
      };
      
      return fallbacks[type] || { fallback: true, message: 'Không thể tải dữ liệu.' };
    }
  }
};

export default KKPHIM_CONFIG;
