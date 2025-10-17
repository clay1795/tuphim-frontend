import { useState, useEffect } from "react";
import MovieGrid from "./MovieGrid";
import movieApi from "../services/movieApi";
import mongoMovieApi from "../services/mongoMovieApi";
import movieGroupingService from "../services/movieGroupingService";

const TestSeriesGrouping = () => {
  const [movies, setMovies] = useState([]);
  const [groupedMovies, setGroupedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGrouped, setShowGrouped] = useState(true);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        console.log('Loading movies for series grouping test...');
        
        // Try multiple APIs to find working one
        let movieData = [];
        let response = null;
        
        try {
          // Try MongoDB API first
          console.log('Trying MongoDB API...');
          response = await mongoMovieApi.getNewMovies(1, 50);
          console.log('MongoDB API Response:', response);
          
          if (response.success && response.data && response.data.items && Array.isArray(response.data.items)) {
            movieData = response.data.items;
            console.log('Loaded movies from MongoDB:', movieData.length);
          } else {
            throw new Error('MongoDB API format not expected');
          }
        } catch (mongoError) {
          console.log('MongoDB API failed, trying movieApi...');
          
          try {
            // Fallback to regular movieApi
            response = await movieApi.getNewMovies(1);
            console.log('MovieApi Response:', response);
            
            if (response.items && Array.isArray(response.items)) {
              movieData = response.items;
            } else if (response.data && Array.isArray(response.data)) {
              movieData = response.data;
            } else if (Array.isArray(response)) {
              movieData = response;
            }
            
            console.log('Loaded movies from MovieApi:', movieData.length);
          } catch (movieApiError) {
            console.log('MovieApi failed, trying searchMovies...');
            
            // Try searchMovies as last resort
            response = await movieApi.searchMovies('', { limit: 50 });
            console.log('SearchMovies Response:', response);
            
            if (response.data && Array.isArray(response.data)) {
              movieData = response.data;
              console.log('Loaded movies from searchMovies:', movieData.length);
            }
          }
        }
        
        if (movieData.length === 0) {
          console.error('No movies loaded from any API');
          // Create some sample data for testing
          movieData = [
            {
              _id: '1',
              slug: 'one-punch-man-1',
              name: 'One Punch Man - Phần 1 HD Vietsub',
              origin_name: 'One Punch Man',
              year: 2015,
              poster_url: '/src/assets/temp-1.jpeg',
              quality: 'HD',
              episode_current: '12',
              episode_total: '12'
            },
            {
              _id: '2',
              slug: 'one-punch-man-2',
              name: 'One Punch Man - Phần 2 HD Vietsub',
              origin_name: 'One Punch Man',
              year: 2019,
              poster_url: '/src/assets/temp-1.jpeg',
              quality: 'HD',
              episode_current: '12',
              episode_total: '12'
            },
            {
              _id: '3',
              slug: 'attack-on-titan-1',
              name: 'Attack on Titan - Phần 1',
              origin_name: 'Attack on Titan',
              year: 2013,
              poster_url: '/src/assets/temp-1.jpeg',
              quality: 'FHD',
              episode_current: '25',
              episode_total: '25'
            }
          ];
          console.log('Using sample data for testing:', movieData.length);
        }
        
        setMovies(movieData);
        
        // Test grouping service
        const grouped = movieGroupingService.groupMoviesBySeries(movieData);
        console.log('Grouped movies:', grouped.length, 'from', movieData.length);
        setGroupedMovies(grouped);
        
      } catch (error) {
        console.error('Error loading movies:', error);
        // Set empty arrays on error
        setMovies([]);
        setGroupedMovies([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadMovies();
  }, []);

  const analyzeMovies = () => {
    console.log('=== MOVIE ANALYSIS ===');
    console.log('Total movies:', movies.length);
    console.log('Grouped movies:', groupedMovies.length);
    
    // Analyze series
    const seriesMap = new Map();
    movies.forEach(movie => {
      const seriesKey = movieGroupingService.createSeriesKey(movie.name, movie.origin_name);
      if (!seriesMap.has(seriesKey)) {
        seriesMap.set(seriesKey, []);
      }
      seriesMap.get(seriesKey).push({
        name: movie.name,
        origin_name: movie.origin_name,
        partNumber: movieGroupingService.extractPartNumber(movie.name, movie.origin_name)
      });
    });
    
    // Show series with multiple parts
    console.log('Series with multiple parts:');
    seriesMap.forEach((parts, seriesKey) => {
      if (parts.length > 1) {
        console.log(`- ${seriesKey}: ${parts.length} parts`, parts);
      }
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Đang tải phim để test...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Test Series Grouping</h1>
          
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => setShowGrouped(!showGrouped)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showGrouped 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {showGrouped ? 'Hiển thị theo series' : 'Hiển thị tất cả phim'}
            </button>
            
            <button
              onClick={analyzeMovies}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Phân tích phim (Console)
            </button>
          </div>
          
          <div className="text-gray-400 text-sm">
            <p>Tổng phim: {movies.length}</p>
            <p>Phim sau nhóm: {groupedMovies.length}</p>
            <p>Giảm: {movies.length - groupedMovies.length} phim</p>
          </div>
        </div>
        
        <MovieGrid
          movies={showGrouped ? groupedMovies : movies}
          title={showGrouped ? "Phim được nhóm theo series" : "Tất cả phim"}
          groupBySeries={showGrouped}
        />
      </div>
    </div>
  );
};

export default TestSeriesGrouping;
