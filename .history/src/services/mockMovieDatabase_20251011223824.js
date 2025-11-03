// Mock Movie Database - Tạm thời sử dụng mock data
class MockMovieDatabase {
  constructor() {
    this.allMovies = [];
    this.isLoaded = false;
    this.loading = false;
    this.lastUpdate = null;
  }

  // Generate mock movies
  generateMockMovies() {
    const movies = [];
    const types = ['single', 'series', 'hoathinh'];
    const countries = ['Việt Nam', 'Hàn Quốc', 'Nhật Bản', 'Trung Quốc', 'Thái Lan', 'Mỹ'];
    const categories = ['Hành động', 'Tình cảm', 'Hài hước', 'Kinh dị', 'Viễn tưởng', 'Lịch sử'];
    
    for (let i = 1; i <= 1000; i++) {
      const year = 2020 + Math.floor(Math.random() * 5);
      const type = types[Math.floor(Math.random() * types.length)];
      const country = countries[Math.floor(Math.random() * countries.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      movies.push({
        _id: `mock_${i}`,
        slug: `phim-mock-${i}`,
        name: `Phim Mock ${i}`,
        origin_name: `Mock Movie ${i}`,
        type: type,
        year: year,
        country: country,
        category: category,
        poster_url: `data:image/svg+xml;base64,${btoa(`<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="400" fill="#1f2937"/><text x="150" y="200" text-anchor="middle" fill="white" font-family="Arial" font-size="16">Mock ${i}</text></svg>`)}`,
        thumb_url: `data:image/svg+xml;base64,${btoa(`<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="400" fill="#1f2937"/><text x="150" y="200" text-anchor="middle" fill="white" font-family="Arial" font-size="16">Mock ${i}</text></svg>`)}`,
        modified: {
          time: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        status: type === 'series' ? 'ongoing' : 'completed',
        episode_total: type === 'series' ? Math.floor(Math.random() * 50) + 1 : 1,
        episode_current: type === 'series' ? Math.floor(Math.random() * 20) + 1 : 1,
        quality: ['HD', 'FullHD', '4K'][Math.floor(Math.random() * 3)],
        lang: 'vi',
        time: type === 'single' ? `${Math.floor(Math.random() * 120) + 60} phút` : null
      });
    }
    
    return movies;
  }

  // Load mock database
  async loadMockDatabase() {
    if (this.isLoaded || this.loading) {
      return this.allMovies;
    }

    this.loading = true;
    console.log('🚀 Loading mock database...');

    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.allMovies = this.generateMockMovies();
      this.isLoaded = true;
      this.lastUpdate = new Date();
      
      console.log(`🎉 Mock database loaded: ${this.allMovies.length} movies`);
      
      return this.allMovies;
    } catch (error) {
      console.error('❌ Mock database load failed:', error);
      this.loading = false;
      throw error;
    } finally {
      this.loading = false;
    }
  }

  // Filter movies
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
      stats.byType[movie.type] = (stats.byType[movie.type] || 0) + 1;
      if (movie.year) {
        stats.byYear[movie.year] = (stats.byYear[movie.year] || 0) + 1;
      }
    });

    return stats;
  }
}

export default new MockMovieDatabase();
