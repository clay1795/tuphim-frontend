// Series Grouping Service - Nhóm phim theo series và hiển thị phần mới nhất
class SeriesGroupingService {
  /**
   * Xác định tên series gốc từ tên phim
   * @param {string} movieName - Tên phim
   * @returns {string} - Tên series gốc
   */
  static getSeriesBaseName(movieName) {
    if (!movieName) return '';
    
    // Loại bỏ các phần chỉ số tập, mùa, phần
    let baseName = movieName
      .replace(/\s*(tập|episode|ep|part|phần|season|s)\s*\d+/gi, '')
      .replace(/\s*(tập|episode|ep|part|phần|season|s)\s*[ivxlcdm]+/gi, '') // Roman numerals
      .replace(/\s*\d+$/g, '') // Số ở cuối
      .replace(/\s*-\s*\d+$/g, '') // Số sau dấu -
      .replace(/\s*\(.*?\)/g, '') // Nội dung trong ngoặc
      .replace(/\s*\[.*?\]/g, '') // Nội dung trong ngoặc vuông
      .replace(/\s*\{.*?\}/g, '') // Nội dung trong ngoặc nhọn
      .trim();
    
    return baseName;
  }

  /**
   * Xác định số thứ tự của phần/tập từ tên phim
   * @param {string} movieName - Tên phim
   * @returns {number} - Số thứ tự (1, 2, 3...)
   */
  static getSeriesPartNumber(movieName) {
    if (!movieName) return 1;
    
    // Tìm số trong tên phim
    const patterns = [
      /\b(phần|part)\s*(\d+)/i,
      /\b(season|s)\s*(\d+)/i,
      /\b(tập|episode|ep)\s*(\d+)/i,
      /\b(\d+)\s*(phần|part)/i,
      /\b(\d+)\s*(season|s)/i,
      /\b(\d+)\s*(tập|episode|ep)/i,
      /\b(\d+)$/, // Số ở cuối
      /-\s*(\d+)$/ // Số sau dấu -
    ];
    
    for (const pattern of patterns) {
      const match = movieName.match(pattern);
      if (match) {
        const number = parseInt(match[2] || match[1]);
        if (!isNaN(number) && number > 0) {
          return number;
        }
      }
    }
    
    return 1; // Mặc định là phần 1
  }

  /**
   * Kiểm tra xem phim có phải là series không
   * @param {Object} movie - Đối tượng phim
   * @returns {boolean}
   */
  static isSeriesMovie(movie) {
    if (!movie) return false;
    
    const movieName = (movie.name || '').toLowerCase();
    const originName = (movie.origin_name || '').toLowerCase();
    const episodeTotal = parseInt(movie.episode_total || 0);
    const episodeCurrent = parseInt(movie.episode_current || 0);
    
    // Kiểm tra các dấu hiệu của series
    const hasSeriesKeywords = movieName.includes('tập') || 
                             movieName.includes('season') || 
                             movieName.includes('phần') ||
                             movieName.includes('series') ||
                             movieName.includes('bộ phim') ||
                             movieName.includes('dài tập') ||
                             movieName.includes('phim truyền hình') ||
                             originName.includes('season') ||
                             originName.includes('series') ||
                             originName.includes('tập');
    
    // Kiểm tra pattern tập/phần trong tên
    const hasEpisodePattern = /\b(tập|episode|ep|part|phần|season|s)\s*\d+/i.test(movieName) ||
                             /\b(tập|episode|ep|part|phần|season|s)\s*\d+/i.test(originName);
    
    // Kiểm tra số tập
    const hasMultipleEpisodes = episodeTotal > 1 || episodeCurrent > 1;
    
    return hasSeriesKeywords || hasEpisodePattern || hasMultipleEpisodes;
  }

  /**
   * Nhóm các phim theo series
   * @param {Array} movies - Danh sách phim
   * @returns {Object} - Object chứa series và phim đơn lẻ
   */
  static groupMoviesBySeries(movies) {
    if (!movies || !Array.isArray(movies)) {
      return { series: [], singleMovies: [] };
    }

    const seriesMap = new Map();
    const singleMovies = [];

    movies.forEach(movie => {
      if (this.isSeriesMovie(movie)) {
        const baseName = this.getSeriesBaseName(movie.name);
        const partNumber = this.getSeriesPartNumber(movie.name);
        
        if (!seriesMap.has(baseName)) {
          seriesMap.set(baseName, {
            baseName,
            movies: [],
            latestMovie: null,
            totalParts: 0
          });
        }
        
        const series = seriesMap.get(baseName);
        series.movies.push({
          ...movie,
          partNumber,
          seriesBaseName: baseName
        });
        
        // Cập nhật phim mới nhất
        if (!series.latestMovie || partNumber > series.latestMovie.partNumber) {
          series.latestMovie = { ...movie, partNumber, seriesBaseName: baseName };
        }
        
        series.totalParts = Math.max(series.totalParts, partNumber);
      } else {
        singleMovies.push(movie);
      }
    });

    // Chuyển Map thành Array và sắp xếp
    const series = Array.from(seriesMap.values()).map(series => ({
      ...series,
      movies: series.movies.sort((a, b) => a.partNumber - b.partNumber)
    }));

    return { series, singleMovies };
  }

  /**
   * Tạo danh sách phim để hiển thị (chỉ hiện phần mới nhất của series)
   * @param {Array} movies - Danh sách phim gốc
   * @returns {Array} - Danh sách phim đã được tối ưu
   */
  static getDisplayMovies(movies) {
    const { series, singleMovies } = this.groupMoviesBySeries(movies);
    
    // Tạo danh sách hiển thị với phim mới nhất của mỗi series
    const displayMovies = [
      ...singleMovies,
      ...series.map(s => s.latestMovie)
    ];
    
    return displayMovies;
  }

  /**
   * Lấy thông tin chi tiết series (tất cả các phần)
   * @param {string} movieSlug - Slug của phim
   * @param {Array} allMovies - Tất cả phim trong database
   * @returns {Object} - Thông tin series và các phần
   */
  static getSeriesDetails(movieSlug, allMovies) {
    if (!movieSlug || !allMovies) {
      return null;
    }

    // Tìm phim hiện tại
    const currentMovie = allMovies.find(m => m.slug === movieSlug || m._id === movieSlug);
    if (!currentMovie) {
      return null;
    }

    // Nếu không phải series, trả về phim đơn lẻ
    if (!this.isSeriesMovie(currentMovie)) {
      return {
        isSeries: false,
        currentMovie,
        allParts: [currentMovie]
      };
    }

    // Tìm tất cả phim trong cùng series
    const baseName = this.getSeriesBaseName(currentMovie.name);
    const seriesMovies = allMovies.filter(movie => {
      if (!this.isSeriesMovie(movie)) return false;
      const movieBaseName = this.getSeriesBaseName(movie.name);
      return movieBaseName === baseName;
    });

    // Sắp xếp theo số phần
    const sortedMovies = seriesMovies
      .map(movie => ({
        ...movie,
        partNumber: this.getSeriesPartNumber(movie.name)
      }))
      .sort((a, b) => a.partNumber - b.partNumber);

    return {
      isSeries: true,
      baseName,
      currentMovie,
      allParts: sortedMovies,
      totalParts: sortedMovies.length
    };
  }

  /**
   * Tạo metadata cho phim series
   * @param {Object} movie - Phim hiện tại
   * @param {Array} allParts - Tất cả các phần của series
   * @returns {Object} - Metadata
   */
  static createSeriesMetadata(movie, allParts) {
    if (!movie || !allParts || allParts.length <= 1) {
      return null;
    }

    const baseName = this.getSeriesBaseName(movie.name);
    const currentPart = this.getSeriesPartNumber(movie.name);
    
    return {
      isSeries: true,
      baseName,
      currentPart,
      totalParts: allParts.length,
      hasNewerParts: currentPart < allParts.length,
      hasOlderParts: currentPart > 1,
      seriesSlug: baseName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    };
  }
}

export default SeriesGroupingService;
