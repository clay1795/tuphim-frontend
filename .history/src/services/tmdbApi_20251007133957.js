// TMDB API Service for getting real trailer data
const TMDB_API_KEY = 'your_tmdb_api_key_here'; // Cần thay thế bằng API key thật
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Function to get movie videos (trailers) from TMDB
export const getMovieVideos = async (tmdbId, type = 'movie') => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/${type}/${tmdbId}/videos?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching TMDB videos:', error);
    return null;
  }
};

// Function to get YouTube trailer URL from TMDB data
export const getYouTubeTrailerUrl = (videosData) => {
  if (!videosData || !videosData.results || videosData.results.length === 0) {
    return null;
  }
  
  // Tìm trailer YouTube đầu tiên
  const trailer = videosData.results.find(video => 
    video.site === 'YouTube' && 
    video.type === 'Trailer' &&
    video.official === true
  );
  
  if (trailer) {
    return `https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1`;
  }
  
  // Nếu không có trailer chính thức, tìm video YouTube khác
  const youtubeVideo = videosData.results.find(video => 
    video.site === 'YouTube' && 
    (video.type === 'Trailer' || video.type === 'Teaser')
  );
  
  if (youtubeVideo) {
    return `https://www.youtube.com/embed/${youtubeVideo.key}?autoplay=1&rel=0&modestbranding=1`;
  }
  
  return null;
};

// Function to get movie details from TMDB
export const getMovieDetails = async (tmdbId, type = 'movie') => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching TMDB movie details:', error);
    return null;
  }
};

// Function to search movies on TMDB
export const searchMovies = async (query) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching TMDB movies:', error);
    return null;
  }
};

export default {
  getMovieVideos,
  getYouTubeTrailerUrl,
  getMovieDetails,
  searchMovies
};
