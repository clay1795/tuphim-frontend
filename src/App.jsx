import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { getApiUrl } from "./utils/apiConfig";
import Banner from "./components/Banner";
import Header from "./components/Header";
import MovieDetailRoPhim from "./components/MovieDetailRoPhim";
import MovieFeatured from "./components/MovieFeatured";
import AdvancedSearchCache from "./components/AdvancedSearchCache";
// Removed unused components: InterestSuggestions, TopMovies
import TopComments from "./components/TopComments";
import AuthProvider from "./context/AuthContextSimple";
import MovieSection from "./components/MovieSection";
import MovieSectionCarousel from "./components/MovieSectionCarousel";
import TopMoviesSection from "./components/TopMoviesSection";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
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
import { VideoPlayerProvider } from "./context/VideoPlayerContext";
import MovieSectionsWithAPI from "./components/MovieSectionsWithAPI";

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

// Video Player
import VideoPlayer from "./pages/VideoPlayer";

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
      
      // Sử dụng API MongoDB mới
      const response = await fetch(`${getApiUrl()}/mongo-movies/new?page=${page}&limit=24`);
      const data = await response.json();
      console.log('Homepage MongoDB API Response:', data);
      console.log('API Response keys:', Object.keys(data));
      
      // Xử lý dữ liệu từ MongoDB API
      let movieData = [];
      
      if (data.success && data.data && data.data.items && Array.isArray(data.data.items)) {
        movieData = data.data.items;
        console.log('Found movies in MongoDB data.data.items:', movieData.length);
      } else {
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
        console.log('Setting movies state with', movieData.length, 'movies');
        setMovies(movieData);
      } else {
        console.warn('No movies found in API response, checking fallback data');
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
      
      console.log('Using fallback data with', fallbackData.length, 'movies');
      setMovies(fallbackData);
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
          <VideoPlayerProvider>
            <Router>
              <MovieProvider>
            <div className="min-h-screen bg-gray-900 transition-colors duration-300">
            <Header />
            <Routes>
              <Route path="/" element={
                <>
                  <>
                    {/* Hero Section - Banner phim nổi bật */}
                    <Banner 
                      onFeaturedMovieChange={handleFeaturedMovieChange}
                      featuredMovie={featuredMovie}
                    />
                    
                    {/* Top 6 Phim Nổi Bật */}
                    <TopMoviesSection />
                    
                    {/* Top bình luận */}
                    <TopComments />
                    
                    {/* Movie Sections with API Filtering */}
                    <MovieSectionsWithAPI />
                    
                    {/* Footer */}
                    <Footer />
                  </>

                  {loading && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                      <div className="glass-dark rounded-2xl p-8 flex items-center space-x-4">
                        <div className="luxury-spinner luxury-spinner-sm">
                          <div className="luxury-ring luxury-ring-outer"></div>
                          <div className="luxury-ring luxury-ring-inner"></div>
                          <div className="luxury-core luxury-core-sm"></div>
                        </div>
                        <span className="text-white text-lg font-medium">Đang tải phim...</span>
                      </div>
                    </div>
                  )}
                </>
              } />
              
              <Route path="/phim/:slug" element={<MovieDetailRoPhim />} />
              <Route path="/xem-phim/:slug" element={<VideoPlayer />} />
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
          </VideoPlayerProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
