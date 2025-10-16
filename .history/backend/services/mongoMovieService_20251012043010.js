const mongoose = require('mongoose');

// MongoDB Schema for Movies
const movieSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  originalName: { type: String, index: true },
  year: { type: Number, index: true },
  country: { type: String, index: true },
  category: { type: String, index: true },
  type: { type: String, index: true },
  status: { type: String, index: true },
  poster_url: String,
  thumb_url: String,
  banner_url: String,
  episodeCurrent: String,
  episodeTotal: String,
  quality: String,
  duration: String,
  description: String,
  director: String,
  actors: [String],
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for performance
movieSchema.index({ name: 'text', originalName: 'text' });
movieSchema.index({ category: 1, country: 1, year: 1 });
movieSchema.index({ type: 1, status: 1 });

const Movie = mongoose.model('Movie', movieSchema);

class MongoMovieService {
  
  // Search movies with MongoDB
  async searchMovies(query = {}) {
    try {
      const {
        keyword = '',
        category = '',
        country = '',
        year = '',
        type = '',
        page = 1,
        limit = 20,
        sort_field = 'updatedAt',
        sort_type = 'desc'
      } = query;

      // Build filter
      const filter = {};
      
      if (keyword) {
        filter.$or = [
          { name: { $regex: keyword, $options: 'i' } },
          { originalName: { $regex: keyword, $options: 'i' } }
        ];
      }
      
      if (category) filter.category = category;
      if (country) filter.country = country;
      if (year) filter.year = parseInt(year);
      if (type) filter.type = type;

      // Build sort
      const sort = {};
      sort[sort_field] = sort_type === 'desc' ? -1 : 1;

      // Execute query with pagination
      const skip = (page - 1) * limit;
      
      const [movies, total] = await Promise.all([
        Movie.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Movie.countDocuments(filter)
      ]);

      return {
        success: true,
        data: {
          items: movies,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      };

    } catch (error) {
      console.error('MongoDB search error:', error);
      return {
        success: false,
        message: 'Search failed',
        error: error.message
      };
    }
  }

  // Get movie by slug
  async getMovieBySlug(slug) {
    try {
      const movie = await Movie.findOne({ slug }).lean();
      return {
        success: !!movie,
        data: movie
      };
    } catch (error) {
      return {
        success: false,
        message: 'Movie not found',
        error: error.message
      };
    }
  }

  // Get movies by category
  async getMoviesByCategory(category, page = 1, limit = 20) {
    return this.searchMovies({ category, page, limit });
  }

  // Get movies by country
  async getMoviesByCountry(country, page = 1, limit = 20) {
    return this.searchMovies({ country, page, limit });
  }

  // Get movies by year
  async getMoviesByYear(year, page = 1, limit = 20) {
    return this.searchMovies({ year, page, limit });
  }

  // Get movies by type
  async getMoviesByType(type, page = 1, limit = 20) {
    return this.searchMovies({ type, page, limit });
  }

  // Get new movies (recently updated)
  async getNewMovies(page = 1, limit = 20) {
    return this.searchMovies({ page, limit, sort_field: 'updatedAt', sort_type: 'desc' });
  }

  // Get categories
  async getCategories() {
    try {
      const categories = await Movie.distinct('category');
      return {
        success: true,
        data: categories.filter(Boolean).map(cat => ({ name: cat, slug: cat }))
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get categories',
        error: error.message
      };
    }
  }

  // Get countries
  async getCountries() {
    try {
      const countries = await Movie.distinct('country');
      return {
        success: true,
        data: countries.filter(Boolean).map(country => ({ name: country, slug: country }))
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get countries',
        error: error.message
      };
    }
  }

  // Get years
  async getYears() {
    try {
      const years = await Movie.distinct('year');
      return {
        success: true,
        data: years.filter(Boolean).sort((a, b) => b - a)
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get years',
        error: error.message
      };
    }
  }

  // Get movie stats
  async getStats() {
    try {
      const [totalMovies, categories, countries, types] = await Promise.all([
        Movie.countDocuments(),
        Movie.distinct('category'),
        Movie.distinct('country'),
        Movie.distinct('type')
      ]);

      return {
        success: true,
        data: {
          totalMovies,
          categories: categories.length,
          countries: countries.length,
          types: types.length,
          lastUpdate: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get stats',
        error: error.message
      };
    }
  }

  // Bulk insert movies (for migration)
  async bulkInsertMovies(movies) {
    try {
      const result = await Movie.insertMany(movies, { ordered: false });
      return {
        success: true,
        data: {
          inserted: result.length,
          total: movies.length
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Bulk insert failed',
        error: error.message
      };
    }
  }
}

module.exports = new MongoMovieService();
