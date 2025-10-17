const kkphimApi = require('../services/kkphimApi');
const logger = require('../services/logger');

/**
 * Middleware to automatically update movie data with real data from KKPhim API
 * This ensures that when users add movies to favorites/watchlist, they get real data
 */
class MovieDataUpdater {
  
  /**
   * Update movie data with real data from KKPhim API
   * @param {Object} movieData - Movie data to update
   * @returns {Object} - Updated movie data
   */
  static async updateMovieData(movieData) {
    try {
      // If already has real data, return as is
      if (movieData.poster_url && movieData.poster_url.includes('phimimg.com')) {
        return movieData;
      }

      // If no slug, return original data
      if (!movieData.movieSlug) {
        logger.warn('No movieSlug provided for movie data update');
        return movieData;
      }

      logger.info(`Updating movie data for slug: ${movieData.movieSlug}`);
      
      // Fetch real data from KKPhim API
      const kkphimData = await kkphimApi.getMovieDetail(movieData.movieSlug);
      
      if (kkphimData && kkphimData.movie) {
        const movie = kkphimData.movie;
        
        // Update with real data
        // Only set originalName if it's different from movieName and not empty
        let originalName = null;
        if (movie.origin_name && movie.origin_name.trim() && movie.origin_name !== movie.name) {
          originalName = movie.origin_name;
        }
        
        const updatedData = {
          ...movieData,
          movieId: movie._id || movieData.movieId,
          movieSlug: movie.slug || movieData.movieSlug,
          movieName: movie.name || movieData.movieName,
          originalName: originalName,
          poster_url: movie.poster_url || movieData.poster_url,
          thumb_url: movie.thumb_url || movieData.thumb_url,
          banner_url: movie.banner_url || movieData.banner_url,
          addedAt: movieData.addedAt || new Date()
        };
        
        logger.info(`Successfully updated movie data for: ${movie.name}`);
        logger.info(`Original name: ${movie.origin_name || 'Not available'}`);
        logger.info(`Updated originalName: ${updatedData.originalName || 'Not set'}`);
        return updatedData;
      } else {
        logger.warn(`No movie data found for slug: ${movieData.movieSlug}`);
        return movieData;
      }
    } catch (error) {
      logger.error(`Error updating movie data for slug: ${movieData.movieSlug}`, error.message);
      return movieData; // Return original data if update fails
    }
  }

  /**
   * Update multiple movies data
   * @param {Array} moviesData - Array of movie data to update
   * @returns {Array} - Updated array of movie data
   */
  static async updateMultipleMoviesData(moviesData) {
    const updatedMovies = [];
    
    for (const movieData of moviesData) {
      try {
        const updatedMovie = await this.updateMovieData(movieData);
        updatedMovies.push(updatedMovie);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        logger.error(`Error updating movie: ${movieData.movieName}`, error.message);
        updatedMovies.push(movieData); // Keep original data if update fails
      }
    }
    
    return updatedMovies;
  }

  /**
   * Check if movie data needs updating
   * @param {Object} movieData - Movie data to check
   * @returns {boolean} - True if needs updating
   */
  static needsUpdate(movieData) {
    return !movieData.poster_url || !movieData.poster_url.includes('phimimg.com');
  }

  /**
   * Get update statistics for a list of movies
   * @param {Array} moviesData - Array of movie data
   * @returns {Object} - Statistics about updates needed
   */
  static getUpdateStats(moviesData) {
    const stats = {
      total: moviesData.length,
      needsUpdate: 0,
      hasRealData: 0,
      noSlug: 0
    };

    moviesData.forEach(movie => {
      if (!movie.movieSlug) {
        stats.noSlug++;
      } else if (this.needsUpdate(movie)) {
        stats.needsUpdate++;
      } else {
        stats.hasRealData++;
      }
    });

    return stats;
  }
}

module.exports = MovieDataUpdater;
