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
    
    // Loại bỏ các từ khóa chỉ phần/phần mùa
    const cleanName = baseName
      .replace(/\s+(phần|part|season|mùa)\s*\d+.*$/i, '') // Loại bỏ "phần 1", "season 2", etc.
      .replace(/\s+\d{4}.*$/i, '') // Loại bỏ năm
      .replace(/\s+(hd|fhd|4k|cam|ts|tc).*$/i, '') // Loại bỏ chất lượng
      .replace(/\s+(vietsub|thuyết minh|lồng tiếng).*$/i, '') // Loại bỏ ngôn ngữ
      .replace(/\s*[-:]\s*.*$/i, '') // Loại bỏ sau dấu - hoặc :
      .replace(/\s*\(.*?\)\s*/g, '') // Loại bỏ nội dung trong ngoặc đơn
      .replace(/\s+/g, ' ') // Thay thế nhiều khoảng trắng bằng 1
      .trim();
    
    return cleanName.toLowerCase();
  }

  /**
   * Xác định số phần của phim từ tên
   * @param {string} name - Tên phim
   * @param {string} originName - Tên gốc phim
   * @returns {number} Số phần (1 nếu không xác định được)
   */
  extractPartNumber(name, originName) {
    const searchName = name || originName || '';
    
    // Tìm pattern "phần X", "part X", "season X"
    const partMatch = searchName.match(/(?:phần|part|season|mùa)\s*(\d+)/i);
    if (partMatch) {
      return parseInt(partMatch[1]);
    }
    
    // Tìm pattern số ở cuối tên
    const numberMatch = searchName.match(/\s+(\d+)\s*$/);
    if (numberMatch) {
      const num = parseInt(numberMatch[1]);
      // Chỉ coi là phần nếu số <= 10 (tránh nhầm với năm)
      if (num <= 10) {
        return num;
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
      
      representativeMovies.push(representativeMovie);
    });
    
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
