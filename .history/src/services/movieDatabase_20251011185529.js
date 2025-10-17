// Movie Database Service - Pre-load và cache toàn bộ database
class MovieDatabase {
  constructor() {
    this.allMovies = [];
    this.isLoaded = false;
    this.loading = false;
    this.cache = new Map();
    this.lastUpdate = null;
  }

  // Pre-load toàn bộ database
  async preloadDatabase() {
    if (this.isLoaded || this.loading) {
      return this.allMovies;
    }

    this.loading = true;
    console.log('🚀 Starting database preload...');

    try {
      let allMovies = [];
      let page = 1;
      let hasMore = true;
      const limit = 100; // Tăng limit để fetch nhanh hơn

      while (hasMore && page <= 500) { // Giới hạn 500 trang để tránh quá tải
        console.log(`📡 Pre-loading page ${page}...`);
        
        const response = await fetch(`http://localhost:3001/api/movies/new?page=${page}&limit=${limit}&version=v3`);
        const result = await response.json();

        if (result.data && result.data.items && result.data.items.length > 0) {
          allMovies = allMovies.concat(result.data.items);
          console.log(`✅ Page ${page}: ${result.data.items.length} movies (Total: ${allMovies.length})`);
          page++;
          
          // Update progress
          this.updateProgress(allMovies.length, page);
        } else {
          hasMore = false;
        }

        // Small delay để không overwhelm server
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      this.allMovies = allMovies;
      this.isLoaded = true;
      this.lastUpdate = new Date();
      
      console.log(`🎉 Database preload complete: ${allMovies.length} movies`);
      
      // Cache vào localStorage
      this.saveToCache();
      
      return allMovies;
    } catch (error) {
      console.error('❌ Database preload failed:', error);
      this.loading = false;
      throw error;
    } finally {
      this.loading = false;
    }
  }

  // Load từ cache nếu có
  async loadFromCache() {
    try {
      const cached = localStorage.getItem('movieDatabase');
      if (cached) {
        const data = JSON.parse(cached);
        const cacheTime = new Date(data.lastUpdate);
        const now = new Date();
        
        // Cache valid trong 1 giờ
        if (now - cacheTime < 60 * 60 * 1000) {
          this.allMovies = data.movies;
          this.isLoaded = true;
          this.lastUpdate = cacheTime;
          console.log(`📦 Loaded ${data.movies.length} movies from cache`);
          return this.allMovies;
        }
      }
    } catch (error) {
      console.error('❌ Cache load failed:', error);
    }
    return null;
  }

  // Save vào cache
  saveToCache() {
    try {
      const data = {
        movies: this.allMovies,
        lastUpdate: this.lastUpdate,
        count: this.allMovies.length
      };
      localStorage.setItem('movieDatabase', JSON.stringify(data));
      console.log('💾 Database saved to cache');
    } catch (error) {
      console.error('❌ Cache save failed:', error);
    }
  }

  // Instant filtering - không cần API call
  filterMovies(filters) {
    if (!this.isLoaded) {
      return [];
    }

    let filtered = [...this.allMovies];

    // Keyword search
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(movie => 
        movie.name?.toLowerCase().includes(keyword) ||
        movie.origin_name?.toLowerCase().includes(keyword)
      );
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(movie => movie.type === filters.type);
    }

    // Year filter
    if (filters.year) {
      filtered = filtered.filter(movie => movie.year === parseInt(filters.year));
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(movie => 
        movie.category?.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    // Country filter
    if (filters.country) {
      filtered = filtered.filter(movie => 
        movie.country?.toLowerCase().includes(filters.country.toLowerCase())
      );
    }

    // Sort
    if (filters.sort === 'modified_time') {
      filtered.sort((a, b) => {
        const aTime = new Date(a.modified?.time || 0);
        const bTime = new Date(b.modified?.time || 0);
        return filters.sortType === 'desc' ? bTime - aTime : aTime - bTime;
      });
    }

    return filtered;
  }

  // Get movie by ID
  getMovie(id) {
    return this.allMovies.find(movie => movie._id === id || movie.slug === id);
  }

  // Get random movies
  getRandomMovies(count = 10) {
    const shuffled = [...this.allMovies].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Get movies by type
  getMoviesByType(type, count = 50) {
    return this.allMovies.filter(movie => movie.type === type).slice(0, count);
  }

  // Update progress
  updateProgress(loaded, page) {
    const event = new CustomEvent('databaseProgress', {
      detail: { loaded, page, total: this.allMovies.length }
    });
    window.dispatchEvent(event);
  }

  // Get stats
  getStats() {
    if (!this.isLoaded) return null;

    const stats = {
      total: this.allMovies.length,
      byType: {},
      byYear: {},
      lastUpdate: this.lastUpdate
    };

    this.allMovies.forEach(movie => {
      // Count by type
      stats.byType[movie.type] = (stats.byType[movie.type] || 0) + 1;
      
      // Count by year
      if (movie.year) {
        stats.byYear[movie.year] = (stats.byYear[movie.year] || 0) + 1;
      }
    });

    return stats;
  }

  // Clear cache
  clearCache() {
    localStorage.removeItem('movieDatabase');
    this.allMovies = [];
    this.isLoaded = false;
    this.lastUpdate = null;
  }
}

// Singleton instance
const movieDatabase = new MovieDatabase();

export default movieDatabase;
