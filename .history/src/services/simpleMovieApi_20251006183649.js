// Simple Movie API Service - Improved Search and Display
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const simpleMovieApi = {
  // Lấy danh sách phim mới cập nhật
  getNewMovies: async (page = 1, version = 'v3') => {
    try {
      console.log(`Fetching new movies - page: ${page}, version: ${version}`);
      const response = await fetch(`${BASE_URL}/danh-sach/phim-moi-cap-nhat-${version}?page=${page}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('New movies API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching new movies:', error);
      throw error;
    }
  },

  // Tìm kiếm phim nâng cao và chính xác
  searchMovies: async (keyword, options = {}) => {
    try {
      const {
        page = 1,
        category = '',
        country = '',
        year = '',
        limit = 20
      } = options;

      console.log(`Advanced search with keyword: "${keyword}", filters:`, { category, country, year });
      
      // Tìm kiếm trong nhiều trang hơn để có kết quả tốt hơn
      let allMovies = [];
      const searchPages = 50; // Tăng lên 50 trang để có nhiều kết quả hơn
      
      for (let currentPage = 1; currentPage <= searchPages; currentPage++) {
        try {
          console.log(`Searching page ${currentPage}/${searchPages}...`);
          const pageData = await simpleMovieApi.getNewMovies(currentPage);
          
          if (pageData.items && Array.isArray(pageData.items)) {
            // Lọc phim với thuật toán tìm kiếm nâng cao
            const filteredMovies = pageData.items.filter(movie => {
              const keywordLower = keyword.toLowerCase().trim();
              
              // 1. Tìm kiếm trong tên phim (chính xác và gần đúng)
              const movieName = (movie.name || '').toLowerCase();
              const originName = (movie.origin_name || '').toLowerCase();
              const slug = (movie.slug || '').toLowerCase();
              
              // 2. Tìm kiếm trong quốc gia
              const movieCountries = movie.country || [];
              const countryNames = movieCountries.map(country => (country.name || country).toLowerCase()).join(' ');
              
              // 3. Tìm kiếm trong thể loại
              const movieCategories = movie.category || [];
              const categoryNames = movieCategories.map(cat => (cat.name || cat).toLowerCase()).join(' ');
              
              // 4. Tìm kiếm trong diễn viên (nếu có)
              const movieActors = movie.actor || [];
              const actorNames = movieActors.map(actor => (actor.name || actor).toLowerCase()).join(' ');
              
              // 5. Tìm kiếm trong đạo diễn (nếu có)
              const movieDirectors = movie.director || [];
              const directorNames = movieDirectors.map(director => (director.name || director).toLowerCase()).join(' ');
              
              // 6. Tìm kiếm trong nội dung (nếu có)
              const content = (movie.content || '').toLowerCase();
              
              // Thuật toán tìm kiếm cải tiến
              const searchResults = simpleMovieApi.performAdvancedSearch(keywordLower, {
                movieName,
                originName,
                slug,
                countryNames,
                categoryNames,
                actorNames,
                directorNames,
                content
              });
              
              if (!searchResults.matched) {
                return false;
              }
              
              // Áp dụng các bộ lọc bổ sung
              if (category) {
                if (!categoryNames.includes(category.toLowerCase())) {
                  return false;
                }
              }
              
              if (country) {
                if (!countryNames.includes(country.toLowerCase())) {
                  return false;
                }
              }
              
              if (year) {
                const movieYear = movie.year || '';
                if (movieYear.toString() !== year.toString()) {
                  return false;
                }
              }
              
              return true;
            });
            
            allMovies = [...allMovies, ...filteredMovies];
            console.log(`Page ${currentPage}: Found ${filteredMovies.length} matching movies`);
            
            // Nếu đã tìm đủ kết quả, có thể dừng sớm
            if (allMovies.length >= limit * 5 && currentPage >= 20) {
              console.log(`Found sufficient results (${allMovies.length}), stopping search early`);
              break;
            }
          }
        } catch (pageError) {
          console.error(`Error searching page ${currentPage}:`, pageError);
        }
      }
      
      console.log(`Total search results: ${allMovies.length} movies`);
      
      // Loại bỏ trùng lặp dựa trên slug
      const uniqueMovies = [];
      const seenSlugs = new Set();
      
      for (const movie of allMovies) {
        if (movie.slug && !seenSlugs.has(movie.slug)) {
          seenSlugs.add(movie.slug);
          uniqueMovies.push(movie);
        }
      }
      
      console.log(`After deduplication: ${uniqueMovies.length} unique movies`);
      
      // Phân trang kết quả
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMovies = uniqueMovies.slice(startIndex, endIndex);
      
      return {
        items: paginatedMovies,
        totalItems: uniqueMovies.length,
        totalPages: Math.ceil(uniqueMovies.length / limit),
        currentPage: page,
        keyword: keyword
      };
      
    } catch (error) {
      console.error('Search movies error:', error);
      throw error;
    }
  },

  // Thuật toán tìm kiếm nâng cao và chính xác
  performAdvancedSearch: (keyword, searchFields) => {
    const {
      movieName,
      originName,
      slug,
      countryNames,
      categoryNames,
      actorNames,
      directorNames,
      content
    } = searchFields;

    // Tách từ khóa thành các từ riêng lẻ
    const keywordWords = keyword.split(/\s+/).filter(word => word.length > 0);
    
    // Tính điểm khớp cho từng trường
    let totalScore = 0;
    let matchDetails = [];

    // 1. Tìm kiếm trong tên phim (trọng số cao nhất)
    const nameScore = simpleMovieApi.calculateMatchScore(keyword, movieName);
    if (nameScore > 0) {
      totalScore += nameScore * 3; // Trọng số x3
      matchDetails.push(`Name: ${nameScore}`);
    }

    // 2. Tìm kiếm trong tên gốc
    const originScore = simpleMovieApi.calculateMatchScore(keyword, originName);
    if (originScore > 0) {
      totalScore += originScore * 2.5; // Trọng số x2.5
      matchDetails.push(`Origin: ${originScore}`);
    }

    // 3. Tìm kiếm trong slug
    const slugScore = simpleMovieApi.calculateMatchScore(keyword, slug);
    if (slugScore > 0) {
      totalScore += slugScore * 2; // Trọng số x2
      matchDetails.push(`Slug: ${slugScore}`);
    }

    // 4. Tìm kiếm từng từ trong tên phim
    let wordMatches = 0;
    for (const word of keywordWords) {
      if (movieName.includes(word) || originName.includes(word)) {
        wordMatches++;
        totalScore += 1;
      }
    }

    // 5. Tìm kiếm trong các trường khác
    const otherFields = `${countryNames} ${categoryNames} ${actorNames} ${directorNames} ${content}`;
    const otherScore = simpleMovieApi.calculateMatchScore(keyword, otherFields);
    if (otherScore > 0) {
      totalScore += otherScore;
      matchDetails.push(`Other: ${otherScore}`);
    }

    // 6. Tìm kiếm thông minh
    const smartMatches = simpleMovieApi.performSmartSearch(keyword, {
      movieName,
      originName,
      countryNames,
      categoryNames,
      actorNames,
      directorNames
    });
    
    if (smartMatches) {
      totalScore += 2; // Bonus điểm cho smart search
      matchDetails.push(`Smart: 2`);
    }

    // 7. Bonus cho khớp hoàn toàn
    if (movieName === keyword || originName === keyword) {
      totalScore += 5;
      matchDetails.push(`Exact: 5`);
    }

    // 8. Bonus cho khớp bắt đầu
    if (movieName.startsWith(keyword) || originName.startsWith(keyword)) {
      totalScore += 3;
      matchDetails.push(`Starts: 3`);
    }

    const matched = totalScore > 0;
    
    if (matched) {
      console.log(`Search match for "${keyword}": Score ${totalScore} (${matchDetails.join(', ')})`);
    }

    return {
      matched,
      score: totalScore,
      details: matchDetails
    };
  },

  // Tính điểm khớp giữa từ khóa và chuỗi tìm kiếm
  calculateMatchScore: (keyword, searchText) => {
    if (!keyword || !searchText) return 0;
    
    const keywordLower = keyword.toLowerCase();
    const searchLower = searchText.toLowerCase();
    
    // Khớp hoàn toàn
    if (searchLower.includes(keywordLower)) {
      // Tính độ dài khớp so với độ dài từ khóa
      const matchRatio = keywordLower.length / searchLower.length;
      return Math.max(1, matchRatio * 2);
    }
    
    // Khớm một phần (Levenshtein distance)
    const similarity = simpleMovieApi.calculateSimilarity(keywordLower, searchLower);
    return similarity > 0.7 ? similarity : 0;
  },

  // Tính độ tương đồng giữa hai chuỗi
  calculateSimilarity: (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = simpleMovieApi.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  },

  // Tính khoảng cách Levenshtein
  levenshteinDistance: (str1, str2) => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  },

  // Tìm kiếm thông minh cho các từ khóa đặc biệt
  performSmartSearch: (keyword, searchFields) => {
    const {
      movieName,
      originName,
      countryNames,
      categoryNames,
      actorNames,
      directorNames
    } = searchFields;

    // Mapping từ khóa thông minh mở rộng
    const smartMappings = {
      'vietnam': ['việt nam', 'vietnam', 'vn', 'vietnamese'],
      'vietnamese': ['việt nam', 'vietnamese', 'vn', 'vietnam'],
      'viet': ['việt nam', 'viet', 'vn', 'vietnam', 'vietnamese'],
      'korea': ['hàn quốc', 'korea', 'korean', 'kr', 'han'],
      'korean': ['hàn quốc', 'korean', 'korea', 'kr', 'han'],
      'han': ['hàn quốc', 'han', 'kr', 'korea', 'korean'],
      'china': ['trung quốc', 'china', 'chinese', 'cn', 'trung'],
      'chinese': ['trung quốc', 'chinese', 'china', 'cn', 'trung'],
      'trung': ['trung quốc', 'trung', 'cn', 'china', 'chinese'],
      'japan': ['nhật bản', 'japan', 'japanese', 'jp', 'nhat'],
      'japanese': ['nhật bản', 'japanese', 'japan', 'jp', 'nhat'],
      'nhat': ['nhật bản', 'nhat', 'jp', 'japan', 'japanese'],
      'thai': ['thái lan', 'thai', 'thailand'],
      'thailand': ['thái lan', 'thailand', 'thai'],
      'action': ['hành động', 'action', 'hành động', 'chiến đấu', 'võ thuật'],
      'romance': ['tình cảm', 'romance', 'lãng mạn', 'yêu đương', 'tình yêu'],
      'comedy': ['hài', 'comedy', 'hài hước', 'hài kịch', 'vui nhộn'],
      'horror': ['kinh dị', 'horror', 'ma', 'quái vật', 'đáng sợ'],
      'drama': ['chính kịch', 'drama', 'tâm lý', 'bi kịch', 'cảm động'],
      'scifi': ['khoa học viễn tưởng', 'scifi', 'sci-fi', 'khoa học', 'tương lai'],
      'fantasy': ['giả tưởng', 'fantasy', 'ma thuật', 'phép thuật', 'thần thoại'],
      'animation': ['hoạt hình', 'animation', 'anime', 'cartoon', 'nhí nhố'],
      'movie': ['phim lẻ', 'movie', 'phim', 'phim điện ảnh'],
      'series': ['phim bộ', 'series', 'bộ', 'phim truyền hình'],
      'anime': ['anime', 'hoạt hình nhật', 'japanese animation'],
      'manga': ['manga', 'truyện tranh nhật', 'japanese comic'],
      'marvel': ['marvel', 'mcu', 'superhero', 'siêu anh hùng'],
      'dc': ['dc', 'batman', 'superman', 'wonder woman'],
      'disney': ['disney', 'pixar', 'walt disney'],
      'netflix': ['netflix', 'original', 'gốc netflix'],
      'hollywood': ['hollywood', 'mỹ', 'usa', 'american'],
      'bollywood': ['bollywood', 'india', 'ấn độ', 'indian']
    };

    // Tìm kiếm từ khóa chính xác
    for (const [key, variations] of Object.entries(smartMappings)) {
      if (keyword.includes(key)) {
        for (const variation of variations) {
          const searchText = `${movieName} ${originName} ${countryNames} ${categoryNames} ${actorNames} ${directorNames}`;
          if (searchText.includes(variation)) {
            console.log(`Smart match found: "${keyword}" -> "${variation}"`);
            return true;
          }
        }
      }
    }

    // Tìm kiếm fuzzy (gần đúng) cho từ khóa
    const searchText = `${movieName} ${originName} ${countryNames} ${categoryNames} ${actorNames} ${directorNames}`;
    
    // Kiểm tra tất cả các variations
    for (const [key, variations] of Object.entries(smartMappings)) {
      for (const variation of variations) {
        const similarity = simpleMovieApi.calculateSimilarity(keyword, variation);
        if (similarity > 0.8) { // 80% tương đồng
          if (searchText.includes(variation)) {
            console.log(`Fuzzy smart match found: "${keyword}" -> "${variation}" (similarity: ${similarity})`);
            return true;
          }
        }
      }
    }

    // Tìm kiếm partial match
    for (const [key, variations] of Object.entries(smartMappings)) {
      for (const variation of variations) {
        if (keyword.includes(variation.substring(0, 3)) || variation.includes(keyword.substring(0, 3))) {
          if (searchText.includes(variation)) {
            console.log(`Partial smart match found: "${keyword}" -> "${variation}"`);
            return true;
          }
        }
      }
    }

    return false;
  },

  // Lấy phim theo thể loại
  getMoviesByCategory: async (category, options = {}) => {
    try {
      const { page = 1, limit = 20 } = options;
      
      console.log(`Fetching movies by category: ${category}`);
      
      // Tìm kiếm trong 5 trang đầu tiên
      let allMovies = [];
      const searchPages = 5;
      
      for (let currentPage = 1; currentPage <= searchPages; currentPage++) {
        try {
          const pageData = await simpleMovieApi.getNewMovies(currentPage);
          
          if (pageData.items && Array.isArray(pageData.items)) {
            const filteredMovies = pageData.items.filter(movie => {
              const movieCategories = movie.category || [];
              const categoryNames = movieCategories.map(cat => cat.name || cat).join(' ').toLowerCase();
              return categoryNames.includes(category.toLowerCase());
            });
            
            allMovies = [...allMovies, ...filteredMovies];
          }
        } catch (pageError) {
          console.error(`Error fetching category page ${currentPage}:`, pageError);
        }
      }
      
      // Phân trang kết quả
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMovies = allMovies.slice(startIndex, endIndex);
      
      return {
        items: paginatedMovies,
        totalItems: allMovies.length,
        totalPages: Math.ceil(allMovies.length / limit),
        currentPage: page,
        category: category
      };
      
    } catch (error) {
      console.error('Get movies by category error:', error);
      throw error;
    }
  },

  // Lấy phim theo năm
  getMoviesByYear: async (year, options = {}) => {
    try {
      const { page = 1, limit = 20 } = options;
      
      console.log(`Fetching movies by year: ${year}`);
      
      // Tìm kiếm trong 5 trang đầu tiên
      let allMovies = [];
      const searchPages = 5;
      
      for (let currentPage = 1; currentPage <= searchPages; currentPage++) {
        try {
          const pageData = await simpleMovieApi.getNewMovies(currentPage);
          
          if (pageData.items && Array.isArray(pageData.items)) {
            const filteredMovies = pageData.items.filter(movie => {
              const movieYear = movie.year || '';
              return movieYear.toString() === year.toString();
            });
            
            allMovies = [...allMovies, ...filteredMovies];
          }
        } catch (pageError) {
          console.error(`Error fetching year page ${currentPage}:`, pageError);
        }
      }
      
      // Phân trang kết quả
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMovies = allMovies.slice(startIndex, endIndex);
      
      return {
        items: paginatedMovies,
        totalItems: allMovies.length,
        totalPages: Math.ceil(allMovies.length / limit),
        currentPage: page,
        year: year
      };
      
    } catch (error) {
      console.error('Get movies by year error:', error);
      throw error;
    }
  },

  // Lấy phim theo quốc gia với tìm kiếm nâng cao
  getMoviesByCountry: async (country, options = {}) => {
    try {
      const { page = 1, limit = 20 } = options;
      
      console.log(`Fetching movies by country: ${country}`);
      
      // Tìm kiếm trong nhiều trang hơn để có kết quả tốt hơn
      let allMovies = [];
      const searchPages = 15; // Tăng từ 5 lên 15 trang
      
      // Mapping quốc gia thông minh
      const countryMappings = {
        'việt nam': ['việt nam', 'vietnam', 'vn', 'vietnamese'],
        'vietnam': ['việt nam', 'vietnam', 'vn', 'vietnamese'],
        'hàn quốc': ['hàn quốc', 'korea', 'korean', 'kr', 'han'],
        'korea': ['hàn quốc', 'korea', 'korean', 'kr', 'han'],
        'trung quốc': ['trung quốc', 'china', 'chinese', 'cn', 'trung'],
        'china': ['trung quốc', 'china', 'chinese', 'cn', 'trung'],
        'nhật bản': ['nhật bản', 'japan', 'japanese', 'jp', 'nhat'],
        'japan': ['nhật bản', 'japan', 'japanese', 'jp', 'nhat'],
        'thái lan': ['thái lan', 'thai', 'thailand'],
        'thailand': ['thái lan', 'thai', 'thailand']
      };
      
      const searchTerms = countryMappings[country.toLowerCase()] || [country.toLowerCase()];
      
      for (let currentPage = 1; currentPage <= searchPages; currentPage++) {
        try {
          const pageData = await simpleMovieApi.getNewMovies(currentPage);
          
          if (pageData.items && Array.isArray(pageData.items)) {
            const filteredMovies = pageData.items.filter(movie => {
              const movieCountries = movie.country || [];
              const countryNames = movieCountries.map(country => (country.name || country).toLowerCase()).join(' ');
              
              // Tìm kiếm với nhiều biến thể từ khóa
              return searchTerms.some(term => countryNames.includes(term));
            });
            
            allMovies = [...allMovies, ...filteredMovies];
            console.log(`Page ${currentPage}: Found ${filteredMovies.length} movies for country "${country}"`);
          }
        } catch (pageError) {
          console.error(`Error fetching country page ${currentPage}:`, pageError);
        }
      }
      
      console.log(`Total movies found for country "${country}": ${allMovies.length}`);
      
      // Loại bỏ trùng lặp
      const uniqueMovies = [];
      const seenSlugs = new Set();
      
      for (const movie of allMovies) {
        if (movie.slug && !seenSlugs.has(movie.slug)) {
          seenSlugs.add(movie.slug);
          uniqueMovies.push(movie);
        }
      }
      
      // Phân trang kết quả
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMovies = uniqueMovies.slice(startIndex, endIndex);
      
      return {
        items: paginatedMovies,
        totalItems: uniqueMovies.length,
        totalPages: Math.ceil(uniqueMovies.length / limit),
        currentPage: page,
        country: country
      };
      
    } catch (error) {
      console.error('Get movies by country error:', error);
      throw error;
    }
  },

  // Lấy phim theo loại (Phim Lẻ, Phim Bộ)
  getMoviesByType: async (type, options = {}) => {
    try {
      const { page = 1, limit = 20 } = options;
      
      console.log(`Fetching movies by type: ${type}`);
      
      // Tìm kiếm trong 5 trang đầu tiên
      let allMovies = [];
      const searchPages = 5;
      
      for (let currentPage = 1; currentPage <= searchPages; currentPage++) {
        try {
          const pageData = await simpleMovieApi.getNewMovies(currentPage);
          
          if (pageData.items && Array.isArray(pageData.items)) {
            const filteredMovies = pageData.items.filter(movie => {
              // Logic phân loại phim lẻ/phim bộ dựa trên episode
              if (type === 'Phim Lẻ') {
                return movie.episode_total === 1 || movie.episode_total === '1';
              } else if (type === 'Phim Bộ') {
                return movie.episode_total > 1 || parseInt(movie.episode_total) > 1;
              }
              return true;
            });
            
            allMovies = [...allMovies, ...filteredMovies];
          }
        } catch (pageError) {
          console.error(`Error fetching type page ${currentPage}:`, pageError);
        }
      }
      
      // Phân trang kết quả
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMovies = allMovies.slice(startIndex, endIndex);
      
      return {
        items: paginatedMovies,
        totalItems: allMovies.length,
        totalPages: Math.ceil(allMovies.length / limit),
        currentPage: page,
        type: type
      };
      
    } catch (error) {
      console.error('Get movies by type error:', error);
      throw error;
    }
  },

  // Lấy chi tiết phim
  getMovieDetail: async (slug) => {
    try {
      console.log(`Fetching movie detail for slug: ${slug}`);
      const response = await fetch(`${BASE_URL}/phim/${slug}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Movie detail API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching movie detail:', error);
      throw error;
    }
  },

  // Chuyển đổi ảnh sang WebP
  getWebpImage: (imageUrl) => {
    if (!imageUrl) return '';
    
    // Nếu đã là WebP hoặc từ TMDB, trả về nguyên
    if (imageUrl.includes('.webp') || imageUrl.includes('tmdb.org')) {
      return imageUrl;
    }
    
    // Chuyển đổi sang WebP cho các ảnh khác
    return imageUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
};

export default simpleMovieApi;
