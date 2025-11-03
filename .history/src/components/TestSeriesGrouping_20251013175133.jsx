import { useState, useEffect } from "react";
import MovieGrid from "./MovieGrid";
import movieApi from "../services/movieApi";
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
        
        // Load movies from API
        const response = await movieApi.getNewMovies(1);
        console.log('API Response:', response);
        
        let movieData = [];
        if (response.items && Array.isArray(response.items)) {
          movieData = response.items;
        } else if (response.data && Array.isArray(response.data)) {
          movieData = response.data;
        } else if (Array.isArray(response)) {
          movieData = response;
        }
        
        console.log('Loaded movies:', movieData.length);
        setMovies(movieData);
        
        // Test grouping service
        const grouped = movieGroupingService.groupMoviesBySeries(movieData);
        console.log('Grouped movies:', grouped.length, 'from', movieData.length);
        setGroupedMovies(grouped);
        
      } catch (error) {
        console.error('Error loading movies:', error);
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
