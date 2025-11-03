import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Banner from "./components/Banner";
import Header from "./components/Header";
import MovieDetailRoPhim from "./components/MovieDetailRoPhim";
import MovieFeatured from "./components/MovieFeatured";
import AdvancedSearch from "./components/AdvancedSearch";
import InterestSuggestions from "./components/InterestSuggestions";
import TopMovies from "./components/TopMovies";
import TopComments from "./components/TopComments";
import MovieSection from "./components/MovieSection";
import TopMoviesSection from "./components/TopMoviesSection";
import Footer from "./components/Footer";
import { MovieProvider } from "./context/MovieDetailContext";
import { ThemeProvider } from "./context/ThemeContext";
import movieApi from "./services/movieApi";
import { filterMoviesByTheme, filterHighQualityMovies, filterNewMovies } from "./utils/movieFilters";

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMovies = async (page = 1) => {
    setLoading(true);
    try {
      console.log('Loading new movies for homepage');
      const data = await movieApi.getNewMovies(page);
      console.log('Homepage API Response:', data);
      
      const movieData = data.items || data.data || [];
      console.log('Movies loaded for homepage:', movieData.length);
      
      if (movieData.length === 0) {
        console.log('No movies found, using fallback data');
        const fallbackData = [
          {
            _id: '1',
            name: 'Sample Movie 1',
            slug: 'sample-movie-1',
            thumb_url: '/src/assets/temp-1.jpeg',
            year: 2024,
            quality: 'HD',
            episode_current: 1,
            episode_total: 1,
            category: [{ name: 'Action' }],
            country: [{ name: 'USA' }],
            tmdb: { vote_average: 8.5 }
          },
          {
            _id: '2', 
            name: 'Sample Movie 2',
            slug: 'sample-movie-2',
            thumb_url: '/src/assets/temp-1.jpeg',
            year: 2024,
            quality: 'FHD',
            episode_current: 2,
            episode_total: 10,
            category: [{ name: 'Drama' }],
            country: [{ name: 'Korea' }],
            tmdb: { vote_average: 9.0 }
          }
        ];
        setMovies(fallbackData);
      } else {
        setMovies(movieData);
      }
    } catch (error) {
      console.error('Load movies error:', error);
      const sampleMovies = [
        {
          _id: '1',
          name: 'Phim mẫu 1',
          slug: 'phim-mau-1',
          thumb_url: '/src/assets/temp-1.jpeg',
          year: '2024',
          rating: 8.5,
          quality: 'HD',
          episode_current: 1,
          episode_total: 12,
          category: [{ name: 'Action' }],
          country: [{ name: 'USA' }],
          tmdb: { vote_average: 8.5 }
        }
      ];
      setMovies(sampleMovies);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Movies state updated:', movies.length);
  }, [movies]);

  useEffect(() => {
    loadMovies(1);
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <MovieProvider>
          <div className="min-h-screen bg-gray-900 transition-colors duration-300">
            <Routes>
              <Route path="/" element={
                <>
                  <Header />
                  
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-4xl font-bold text-white text-center mb-8">
                      RoPhim - Phim Hay Cả Rồ
                    </h1>
                    
                    {loading ? (
                      <div className="text-center py-12">
                        <div className="text-white text-xl mb-4">Đang tải phim...</div>
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent mx-auto"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {movies.map((movie) => (
                          <div key={movie._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                            <img 
                              src={movie.thumb_url || '/src/assets/temp-1.jpeg'} 
                              alt={movie.name}
                              className="w-full h-64 object-cover"
                              onError={(e) => {
                                e.target.src = '/src/assets/temp-1.jpeg';
                              }}
                            />
                            <div className="p-4">
                              <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                                {movie.name}
                              </h3>
                              <div className="flex justify-between items-center text-gray-300 text-sm">
                                <span>{movie.year}</span>
                                <span className="bg-red-600 px-2 py-1 rounded text-xs">
                                  {movie.quality || 'HD'}
                                </span>
                              </div>
                              {movie.tmdb?.vote_average && (
                                <div className="flex items-center mt-2">
                                  <span className="text-yellow-400 text-sm">
                                    ⭐ {movie.tmdb.vote_average}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!loading && movies.length === 0 && (
                      <div className="text-center py-12">
                        <div className="text-white text-xl">Không có phim nào để hiển thị</div>
                      </div>
                    )}
                  </div>
                </>
              } />
              
              <Route path="/phim/:slug" element={<MovieDetailRoPhim />} />
              <Route path="/phim-le" element={<AdvancedSearch />} />
              <Route path="/phim-bo" element={<AdvancedSearch />} />
              <Route path="/hoat-hinh" element={<AdvancedSearch />} />
              <Route path="/tim-kiem" element={<AdvancedSearch />} />
              <Route path="/duyet-tim" element={<AdvancedSearch />} />
            </Routes>
          </div>
        </MovieProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
