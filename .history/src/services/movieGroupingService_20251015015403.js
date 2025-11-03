// Movie Grouping Service - Nhóm phim theo series và chỉ hiển thị 1 phim đại diện
class MovieGroupingService {
  
  /**
   * Tạo key để nhóm phim dựa trên tên gốc
   * @param {string} name - Tên phim
   * @param {string} originName - Tên gốc phim
   * @returns {string} Key để nhóm phim
   */
  createSeriesKey(name, originName) {
    if (!name) return '';
    
    // Lấy tên gốc làm base nếu có, nếu không dùng tên chính
    const baseName = originName || name;
    
    // Loại bỏ các từ khóa chỉ phần/phần mùa - Cải thiện regex
    let cleanName = baseName
      // Loại bỏ các pattern phần/phần mùa với số (cải thiện)
      .replace(/\s+(phần|part|season|mùa|season)\s*\d+.*$/i, '')
      .replace(/\s+(phần|part|season|mùa|season)\s*(\d+).*$/i, '')
      // Loại bỏ số ở cuối (chỉ khi không có từ khóa phần)
      .replace(/(?<!\b(?:phần|part|season|mùa)\s*)\d+\s*$/i, '')
      // Loại bỏ năm
      .replace(/\s+\d{4}.*$/i, '')
      // Loại bỏ chất lượng (mở rộng)
      .replace(/\s+(hd|fhd|4k|cam|ts|tc|full hd|ultra hd|bluray|dvdrip).*$/i, '')
      // Loại bỏ ngôn ngữ (mở rộng)
      .replace(/\s+(vietsub|thuyết minh|lồng tiếng|sub|dub|eng sub|viet sub).*$/i, '')
      // Loại bỏ sau dấu - hoặc :
      .replace(/\s*[-:]\s*.*$/i, '')
      // Loại bỏ nội dung trong ngoặc đơn
      .replace(/\s*\(.*?\)\s*/g, '')
      // Loại bỏ nội dung trong ngoặc vuông
      .replace(/\s*\[.*?\]\s*/g, '')
      // Loại bỏ các từ khóa phổ biến khác
      .replace(/\s+(ova|special|movie|film|anime).*$/i, '')
      // Thay thế nhiều khoảng trắng bằng 1
      .replace(/\s+/g, ' ')
      .trim();
    
    // Xử lý các trường hợp đặc biệt
    cleanName = this.normalizeSeriesName(cleanName);
    
    return cleanName.toLowerCase();
  }

  /**
   * Chuẩn hóa tên series cho các trường hợp đặc biệt
   * @param {string} name - Tên đã clean
   * @returns {string} Tên đã được chuẩn hóa
   */
  normalizeSeriesName(name) {
    // Mapping các tên phổ biến
    const nameMappings = {
      'one punch man': 'one punch man',
      'đấm phát chết luôn': 'one punch man',
      'attack on titan': 'attack on titan',
      'tấn công khổng lồ': 'attack on titan',
      'demon slayer': 'demon slayer',
      'thanh gươm diệt quỷ': 'demon slayer',
      'jujutsu kaisen': 'jujutsu kaisen',
      'nanatsu no taizai': 'nanatsu no taizai',
      'seven deadly sins': 'nanatsu no taizai',
      'naruto': 'naruto',
      'naruto shippuden': 'naruto',
      'dragon ball': 'dragon ball',
      'dragon ball z': 'dragon ball',
      'dragon ball super': 'dragon ball'
    };

    const lowerName = name.toLowerCase();
    
    // Tìm kiếm partial match
    for (const [key, value] of Object.entries(nameMappings)) {
      if (lowerName.includes(key)) {
        return value;
      }
    }
    
    return name;
  }

  /**
   * Xác định số phần của phim từ tên
   * @param {string} name - Tên phim
   * @param {string} originName - Tên gốc phim
   * @returns {number} Số phần (1 nếu không xác định được)
   */
  extractPartNumber(name, originName) {
    const searchName = name || originName || '';
    
    // Tìm pattern "phần X", "part X", "season X" - Cải thiện regex
    const partPatterns = [
      /(?:phần|part|season|mùa|season)\s*(\d+)/i,
      /season\s*(\d+)/i,
      /part\s*(\d+)/i,
      /phần\s*(\d+)/i
    ];
    
    for (const pattern of partPatterns) {
      const match = searchName.match(pattern);
      if (match) {
        const num = parseInt(match[1]);
        if (num >= 1 && num <= 20) { // Giới hạn hợp lý
          return num;
        }
      }
    }
    
    // Tìm pattern số ở cuối tên (chỉ khi không có từ khóa phần)
    if (!/(?:phần|part|season|mùa)/i.test(searchName)) {
      const numberMatch = searchName.match(/\s+(\d+)\s*$/);
      if (numberMatch) {
        const num = parseInt(numberMatch[1]);
        // Chỉ coi là phần nếu số <= 10 và không phải năm
        if (num <= 10 && num >= 1) {
          // Kiểm tra xem có phải năm không
          const yearMatch = searchName.match(/\b(19|20)\d{2}\b/);
          if (!yearMatch || parseInt(yearMatch[0]) !== num) {
            return num;
          }
        }
      }
    }
    
    return 1; // Mặc định là phần 1
  }

  /**
   * Nhóm danh sách phim theo series
   * @param {Array} movies - Danh sách phim
   * @returns {Array} Danh sách phim đã được nhóm (chỉ hiển thị phim mới nhất của mỗi series)
   */
  groupMoviesBySeries(movies) {
    if (!movies || !Array.isArray(movies)) {
      console.log('MovieGroupingService: Invalid movies input');
      return [];
    }

    console.log('MovieGroupingService: Processing', movies.length, 'movies');
    const seriesMap = new Map();
    
    // Nhóm phim theo series key
    movies.forEach((movie, index) => {
      const seriesKey = this.createSeriesKey(movie.name, movie.origin_name);
      const partNumber = this.extractPartNumber(movie.name, movie.origin_name);
      
      console.log(`Movie ${index + 1}: "${movie.name}" -> Series Key: "${seriesKey}", Part: ${partNumber}`);
      
      if (!seriesKey) {
        console.log(`Movie ${index + 1}: No series key, skipping`);
        return;
      }
      
      // Thêm thông tin phần vào movie
      const movieWithPart = {
        ...movie,
        seriesKey,
        partNumber,
        originalName: movie.origin_name || movie.name_en || movie.name
      };
      
      if (!seriesMap.has(seriesKey)) {
        seriesMap.set(seriesKey, []);
        console.log(`New series found: "${seriesKey}"`);
      }
      
      seriesMap.get(seriesKey).push(movieWithPart);
    });
    
    // Chọn phim đại diện cho mỗi series (phim mới nhất hoặc phần cao nhất)
    const representativeMovies = [];
    
    seriesMap.forEach((seriesMovies, seriesKey) => {
      if (seriesMovies.length === 0) return;
      
      console.log(`Processing series "${seriesKey}" with ${seriesMovies.length} movies`);
      
      // Sắp xếp theo phần số (cao nhất) hoặc năm (mới nhất)
      const sortedMovies = seriesMovies.sort((a, b) => {
        // Ưu tiên phần số cao hơn
        if (a.partNumber !== b.partNumber) {
          return b.partNumber - a.partNumber;
        }
        
        // Nếu cùng phần, ưu tiên năm mới hơn
        const yearA = parseInt(a.year) || 0;
        const yearB = parseInt(b.year) || 0;
        return yearB - yearA;
      });
      
      console.log(`Sorted movies for "${seriesKey}":`, sortedMovies.map(m => `${m.name} (Part ${m.partNumber}, Year ${m.year})`));
      
      // Chọn phim đầu tiên (đại diện) và thêm thông tin về các phần khác
      const representativeMovie = {
        ...sortedMovies[0],
        seriesParts: sortedMovies.map(movie => ({
          _id: movie._id,
          slug: movie.slug,
          name: movie.name,
          partNumber: movie.partNumber,
          year: movie.year,
          quality: movie.quality,
          episode_current: movie.episode_current,
          episode_total: movie.episode_total,
          status: movie.status
        }))
      };
      
      console.log(`Representative movie for "${seriesKey}":`, representativeMovie.name);
      representativeMovies.push(representativeMovie);
    });
    
    console.log(`MovieGroupingService: Final result - ${representativeMovies.length} representative movies from ${movies.length} total movies`);
    
    // Sắp xếp lại theo thứ tự gốc (giữ nguyên thứ tự của phim đầu tiên trong mỗi series)
    return representativeMovies;
  }

  /**
   * Lấy danh sách các phần của một series
   * @param {string} seriesKey - Key của series
   * @param {Array} allMovies - Tất cả phim trong database
   * @returns {Array} Danh sách các phần của series
   */
  getSeriesParts(seriesKey, allMovies) {
    if (!seriesKey || !allMovies) return [];
    
    return allMovies.filter(movie => {
      const movieSeriesKey = this.createSeriesKey(movie.name, movie.origin_name);
      return movieSeriesKey === seriesKey;
    }).sort((a, b) => {
      const partA = this.extractPartNumber(a.name, a.origin_name);
      const partB = this.extractPartNumber(b.name, b.origin_name);
      return partA - partB;
    });
  }

  /**
   * Kiểm tra xem phim có phải là series không
   * @param {Object} movie - Phim cần kiểm tra
   * @returns {boolean} True nếu là series
   */
  isSeries(movie) {
    const name = movie.name || '';
    const originName = movie.origin_name || '';
    const searchName = originName || name;
    
    // Kiểm tra có chứa từ khóa chỉ phần/phần mùa
    const hasPartKeyword = /(?:phần|part|season|mùa)\s*\d+/i.test(searchName);
    
    // Kiểm tra có số ở cuối (có thể là phần)
    const hasEndingNumber = /\s+\d+\s*$/.test(searchName);
    
    return hasPartKeyword || hasEndingNumber;
  }

  /**
   * Tạo tên hiển thị cho series (loại bỏ số phần)
   * @param {string} name - Tên phim
   * @param {string} originName - Tên gốc phim
   * @returns {string} Tên series
   */
  getSeriesDisplayName(name, originName) {
    const baseName = originName || name || '';
    
    return baseName
      .replace(/\s+(phần|part|season|mùa)\s*\d+.*$/i, '')
      .replace(/\s+\d{4}.*$/i, '')
      .replace(/\s+(hd|fhd|4k|cam|ts|tc).*$/i, '')
      .replace(/\s+(vietsub|thuyết minh|lồng tiếng).*$/i, '')
      .replace(/\s*[-:]\s*.*$/i, '')
      .trim();
  }
}

// Tạo instance singleton
const movieGroupingService = new MovieGroupingService();

export default movieGroupingService;
