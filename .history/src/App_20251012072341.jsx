import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Banner from "./components/Banner";
import Header from "./components/Header";
import MovieDetailRoPhim from "./components/MovieDetailRoPhim";
import MovieFeatured from "./components/MovieFeatured";
import AdvancedSearchCache from "./components/AdvancedSearchCache";
import InterestSuggestions from "./components/InterestSuggestions";
import TopMovies from "./components/TopMovies";
import TopComments from "./components/TopComments";
import AuthProvider from "./context/AuthContextSimple";
import MovieSection from "./components/MovieSection";
import MovieSectionCarousel from "./components/MovieSectionCarousel";
import TopMoviesSection from "./components/TopMoviesSection";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import BackendTestSimple from "./components/BackendTestSimple";
import MovieDetailTest from "./components/MovieDetailTest";
import MovieDetailDebug from "./components/MovieDetailDebug";
import MovieDetailSimple from "./components/MovieDetailSimple";
import UserProfile from "./components/UserProfile";
import UserWatchlist from "./components/UserWatchlist";
import UserFavorites from "./components/UserFavorites";
import UserHistory from "./components/UserHistory";
import ResetPassword from "./components/ResetPassword";
import UserLayout from "./components/UserLayout";
import UserAccount from "./components/user/UserAccount";
import UserNotifications from "./components/user/UserNotifications";
import { MovieProvider } from "./context/MovieDetailContext";
import { ThemeProvider } from "./context/ThemeContext";
import kkphimApi from "./services/kkphimApi";
import { createDetailedMovieSections } from "./utils/movieFilters.js";

// Admin Components
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./components/admin/Dashboard";
import MovieManagement from "./components/admin/MovieManagement";
import UserManagement from "./components/admin/UserManagement";
import CategoryManagement from "./components/admin/CategoryManagement";
import Analytics from "./components/admin/Analytics";
import Settings from "./components/admin/Settings";

// Sync Management
import SyncPage from "./pages/SyncPage";

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [featuredMovie, setFeaturedMovie] = useState(null);

  const handleFeaturedMovieChange = (movie) => {
    setFeaturedMovie(movie);
    console.log('Featured movie changed:', movie);
  };

  const loadMovies = async (page = 1) => {
    setLoading(true);
    try {
      console.log('Loading new movies for homepage - page:', page);
      
      // Gọi backend API thay vì trực tiếp KKPhim API
      const response = await fetch(`http://localhost:3001/api/movies/new?page=${page}&version=v3`);
      const data = await response.json();
      console.log('Homepage API Response:', data);
      console.log('API Response keys:', Object.keys(data));
      
      // Xử lý dữ liệu từ backend API
      let movieData = [];
      
      if (data.success && data.data && data.data.items && Array.isArray(data.data.items)) {
        movieData = data.data.items;
        console.log('Found movies in data.data.items:', movieData.length);
      } else if (data.items && Array.isArray(data.items)) {
        movieData = data.items;
        console.log('Found movies in data.items:', movieData.length);
      } else if (data.data && Array.isArray(data.data)) {
        movieData = data.data;
        console.log('Found movies in data.data:', movieData.length);
      } else if (Array.isArray(data)) {
        movieData = data;
        console.log('Data is direct array:', movieData.length);
      } else if (data && typeof data === 'object') {
        // Tìm array đầu tiên trong object
        const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
        console.log('Possible arrays found:', possibleArrays.length);
        if (possibleArrays.length > 0) {
          movieData = possibleArrays[0];
          console.log('Using first array with', movieData.length, 'items');
        }
      }
      
      console.log('Final homepage movieData:', movieData.length, 'items');
      if (movieData.length > 0) {
        console.log('Sample movie data:', movieData[0]);
        console.log('Sample movie poster_url:', movieData[0].poster_url);
        console.log('Sample movie thumb_url:', movieData[0].thumb_url);
        setMovies(movieData);
      } else {
        console.warn('No movies found, using fallback data');
        // Fallback data với nhiều phim hơn
        const fallbackData = [
          {
            _id: '1',
            name: 'Avengers: Endgame',
            slug: 'avengers-endgame',
            thumb_url: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
            year: 2019,
            quality: '4K',
            episode_current: 1,
            episode_total: 1,
            category: [{ name: 'Action' }],
            country: [{ name: 'USA' }],
            tmdb: { vote_average: 8.4 }
          },
          {
            _id: '2', 
            name: 'Spider-Man: No Way Home',
            slug: 'spider-man-no-way-home',
            thumb_url: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
            year: 2021,
            quality: 'FHD',
            episode_current: 1,
            episode_total: 1,
            category: [{ name: 'Action' }],
            country: [{ name: 'USA' }],
            tmdb: { vote_average: 8.1 }
          },
          {
            _id: '3',
            name: 'The Batman',
            slug: 'the-batman',
            thumb_url: 'https://image.tmdb.org/t/p/w500/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
            year: 2022,
            quality: '4K',
            episode_current: 1,
            episode_total: 1,
            category: [{ name: 'Action' }],
            country: [{ name: 'USA' }],
            tmdb: { vote_average: 7.8 }
          },
          {
            _id: '4',
            name: 'Top Gun: Maverick',
            slug: 'top-gun-maverick',
            thumb_url: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
            year: 2022,
            quality: 'FHD',
            episode_current: 1,
            episode_total: 1,
            category: [{ name: 'Action' }],
            country: [{ name: 'USA' }],
            tmdb: { vote_average: 8.3 }
          },
          {
            _id: '5',
            name: 'Doctor Strange in the Multiverse of Madness',
            slug: 'doctor-strange-multiverse',
            thumb_url: 'https://image.tmdb.org/t/p/w500/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg',
            year: 2022,
            quality: '4K',
            episode_current: 1,
            episode_total: 1,
            category: [{ name: 'Fantasy' }],
            country: [{ name: 'USA' }],
            tmdb: { vote_average: 6.9 }
          },
          {
            _id: '6',
            name: 'Black Widow',
            slug: 'black-widow',
            thumb_url: 'https://image.tmdb.org/t/p/w500/qAZ0pzat24kLdO3o8ejmbLxyOac.jpg',
            year: 2021,
            quality: 'FHD',
            episode_current: 1,
            episode_total: 1,
            category: [{ name: 'Action' }],
            country: [{ name: 'USA' }],
            tmdb: { vote_average: 6.7 }
          }
        ];
        
        setMovies(fallbackData);
      }
    } catch (error) {
      console.error('Load movies error:', error);
      console.log('API Error, using sample data:', error.message);
      
      // Sample data với nhiều phim hơn
      const sampleMovies = [
        {
          _id: '1',
          name: 'Avengers: Endgame',
          slug: 'avengers-endgame',
          thumb_url: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
          year: 2019,
          quality: '4K',
          episode_current: 1,
          episode_total: 1,
          category: [{ name: 'Action' }],
          country: [{ name: 'USA' }],
          tmdb: { vote_average: 8.4 }
        },
        {
          _id: '2',
          name: 'Spider-Man: No Way Home',
          slug: 'spider-man-no-way-home',
          thumb_url: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
          year: 2021,
          quality: 'FHD',
          episode_current: 1,
          episode_total: 1,
          category: [{ name: 'Action' }],
          country: [{ name: 'USA' }],
          tmdb: { vote_average: 8.1 }
        },
        {
          _id: '3',
          name: 'The Batman',
          slug: 'the-batman',
          thumb_url: 'https://image.tmdb.org/t/p/w500/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
          year: 2022,
          quality: '4K',
          episode_current: 1,
          episode_total: 1,
          category: [{ name: 'Action' }],
          country: [{ name: 'USA' }],
          tmdb: { vote_average: 7.8 }
        },
        {
          _id: '4',
          name: 'Top Gun: Maverick',
          slug: 'top-gun-maverick',
          thumb_url: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
          year: 2022,
          quality: 'FHD',
          episode_current: 1,
          episode_total: 1,
          category: [{ name: 'Action' }],
          country: [{ name: 'USA' }],
          tmdb: { vote_average: 8.3 }
        },
        {
          _id: '5',
          name: 'Doctor Strange in the Multiverse of Madness',
          slug: 'doctor-strange-multiverse',
          thumb_url: 'https://image.tmdb.org/t/p/w500/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg',
          year: 2022,
          quality: '4K',
          episode_current: 1,
          episode_total: 1,
          category: [{ name: 'Fantasy' }],
          country: [{ name: 'USA' }],
          tmdb: { vote_average: 6.9 }
        },
        {
          _id: '6',
          name: 'Black Widow',
          slug: 'black-widow',
          thumb_url: 'https://image.tmdb.org/t/p/w500/qAZ0pzat24kLdO3o8ejmbLxyOac.jpg',
          year: 2021,
          quality: 'FHD',
          episode_current: 1,
          episode_total: 1,
          category: [{ name: 'Action' }],
          country: [{ name: 'USA' }],
          tmdb: { vote_average: 6.7 }
        }
      ];
      
      setMovies(sampleMovies);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Movies state updated:', movies.length);
    if (movies.length > 0) {
      console.log('First movie:', movies[0]);
    }
  }, [movies]);

  // Load movies on component mount
  useEffect(() => {
    loadMovies(1);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <MovieProvider>
            <div className="min-h-screen bg-gray-900 transition-colors duration-300">
            <Header />
            <Routes>
                <Route path="/test" element={<BackendTestSimple />} />
                <Route path="/test-movie-detail" element={<MovieDetailTest />} />
                <Route path="/debug-movie/:slug" element={<MovieDetailDebug />} />
                <Route path="/simple-movie/:slug" element={<MovieDetailSimple />} />
              <Route path="/" element={
                <>
                  <>
                    {/* Hero Section - Banner phim nổi bật */}
                    <Banner 
                      onFeaturedMovieChange={handleFeaturedMovieChange}
                      featuredMovie={featuredMovie}
                    />
                    
                    {/* Top 6 Phim Nổi Bật */}
                    {movies.length > 0 ? (
                      <TopMoviesSection movies={movies.slice(0, 6)} />
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-white text-xl mb-4">Đang tải phim...</div>
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent mx-auto"></div>
                      </div>
                    )}
                    
                    {/* Bạn đang quan tâm gì? */}
                    <InterestSuggestions />
                    
                    {/* Top 10 phim bộ hôm nay */}
                    {movies.length > 0 && <TopMovies 
                      movies={movies.filter(movie => {
                        const hasMultipleEpisodes = movie.episode_total && parseInt(movie.episode_total) > 1;
                        const hasCurrentEpisode = movie.episode_current && parseInt(movie.episode_current) > 1;
                        const hasSeriesKeywords = movie.name && (
                          movie.name.toLowerCase().includes('tập') ||
                          movie.name.toLowerCase().includes('season') ||
                          movie.name.toLowerCase().includes('phần') ||
                          movie.name.toLowerCase().includes('hoàn tất')
                        );
                        const hasEpisodeInfo = movie.name && (
                          movie.name.includes('Tập') ||
                          movie.name.includes('(') && movie.name.includes(')')
                        );
                        return hasMultipleEpisodes || hasCurrentEpisode || hasSeriesKeywords || hasEpisodeInfo;
                      })} 
                      title="Top 10 phim bộ hôm nay"
                      type="series"
                    />}
                    
                    {/* Top 10 phim lẻ hôm nay */}
                    {movies.length > 0 && <TopMovies 
                      movies={movies.filter(movie => {
                        const hasSingleEpisode = !movie.episode_total || parseInt(movie.episode_total) === 1;
                        const hasSingleCurrent = !movie.episode_current || parseInt(movie.episode_current) === 1;
                        const isNotSeries = !movie.name || (
                          !movie.name.toLowerCase().includes('tập') &&
                          !movie.name.toLowerCase().includes('season') &&
                          !movie.name.toLowerCase().includes('phần') &&
                          !movie.name.toLowerCase().includes('hoàn tất') &&
                          !movie.name.includes('Tập') &&
                          !(movie.name.includes('(') && movie.name.includes(')'))
                        );
                        return hasSingleEpisode && hasSingleCurrent && isNotSeries;
                      })} 
                      title="Top 10 phim lẻ hôm nay"
                      type="single"
                    />}
                    
                    {/* Top bình luận */}
                    <TopComments />
                    
                    {/* Movie Sections with Detailed Filters */}
                    {movies.length > 0 && (() => {
                      try {
                        const sections = createDetailedMovieSections(movies);
                        return sections.map((section) => {
                          const Component = section.component === 'MovieSectionCarousel' ? MovieSectionCarousel : MovieSection;
                          
                          return (
                            <Component
                              key={section.key}
                              title={section.title}
                              description={section.description}
                              movies={section.movies}
                              linkTo={`/tim-kiem${section.searchParams}`}
                            />
                          );
                        });
                      } catch (error) {
                        console.error('Error creating movie sections:', error);
                        return null;
                      }
                    })()}
                    
                    {/* Footer */}
                    <Footer />
                  </>

                  {loading && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                      <div className="glass-dark rounded-2xl p-8 flex items-center space-x-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-red-600 border-t-transparent"></div>
                        <span className="text-white text-lg font-medium">Đang tải phim...</span>
                      </div>
                    </div>
                  )}
                </>
              } />
              
              <Route path="/phim/:slug" element={<MovieDetailRoPhim />} />
              <Route path="/phim-le" element={<AdvancedSearchCache />} />
              <Route path="/phim-bo" element={<AdvancedSearchCache />} />
              <Route path="/phim-de-cu" element={<MovieFeatured />} />
              <Route path="/hoat-hinh" element={<AdvancedSearchCache />} />
              <Route path="/tim-kiem" element={<AdvancedSearchCache />} />
              <Route path="/duyet-tim" element={<AdvancedSearchCache />} />
              
              {/* User Management Routes */}
              <Route path="/user" element={<UserLayout />}>
                <Route path="profile" element={<UserAccount />} />
                <Route path="thong-bao" element={<UserNotifications />} />
                <Route path="favorite" element={<UserFavorites />} />
                <Route path="playlist" element={<UserWatchlist />} />
                <Route path="xem-tiep" element={<UserHistory />} />
              </Route>
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Legacy Routes - Redirect to new user routes */}
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/watchlist" element={<UserWatchlist />} />
              <Route path="/favorites" element={<UserFavorites />} />
              <Route path="/history" element={<UserHistory />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="movies" element={<MovieManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Sync Management Route */}
              <Route path="/sync" element={<SyncPage />} />
            </Routes>
            </div>
            </MovieProvider>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
