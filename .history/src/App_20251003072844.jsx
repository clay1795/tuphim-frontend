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

  const handleFeaturedMovieChange = (movie) => {
    console.log('Featured movie changed:', movie);
  };

         const loadMovies = async (page = 1) => {
           setLoading(true);
           try {
             let data;
             {
               // Sử dụng API phim mới cập nhật
               console.log('Loading new movies for homepage');
               data = await movieApi.getNewMovies(page);
             }
             
             console.log('Homepage API Response:', data);
             console.log('API Response keys:', Object.keys(data));
             console.log('API Response structure:', JSON.stringify(data, null, 2));
             
             // Xử lý dữ liệu từ API - KKPhim API trả về data.items
             const movieData = data.items || data.data || [];
             console.log('Movies loaded for homepage:', movieData.length);
             if (movieData.length > 0) {
               console.log('Sample movie:', movieData[0]);
             }
             
             // Movie data loaded successfully
             
             // Debug: Kiểm tra cấu trúc dữ liệu
             if (movieData.length === 0) {
               console.warn('No movies found in API response');
               console.log('Full API response structure:', data);
               
               // Fallback data nếu API không trả về dữ liệu
               const fallbackData = [
                 {
                   _id: '1',
                   name: 'Sample Movie 1',
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
               
               console.log('Using fallback data');
               setMovies(fallbackData);
               setTotalPages(1);
               return;
             }
             
             // Debug: Kiểm tra các chủ đề phim
             const chineseMovies = filterMoviesByTheme(movieData, 'chinese');
             const koreanMovies = filterMoviesByTheme(movieData, 'korean');
             const americanMovies = filterMoviesByTheme(movieData, 'american');
             const disneyMovies = filterMoviesByTheme(movieData, 'disney');
             const animeMovies = filterMoviesByTheme(movieData, 'anime');
             
             console.log('Filtered movies by theme:');
             console.log('- Chinese movies:', chineseMovies.length);
             console.log('- Korean movies:', koreanMovies.length);
             console.log('- American movies:', americanMovies.length);
             console.log('- Disney movies:', disneyMovies.length);
             console.log('- Anime movies:', animeMovies.length);
             
             setMovies(movieData);
             setTotalPages(data.pagination?.totalPages || data.totalPages || data.total_pages || 1);
             setCurrentPage(page);
      } catch (error) {
             console.error('Load movies error:', error);
             // Chỉ hiển thị dữ liệu mẫu nếu thực sự có lỗi API
             if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
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
                   episode_total: 12
                 },
                 {
                   _id: '2',
                   name: 'Phim mẫu 2',
                   slug: 'phim-mau-2',
                   thumb_url: '/src/assets/temp-1.jpeg',
                   year: '2024',
                   rating: 7.8,
                   quality: 'FHD',
                   episode_current: 5,
                   episode_total: 20
                 }
               ];
               
               setMovies(sampleMovies);
               setTotalPages(1);
               setCurrentPage(1);
             }
           } finally {
             setLoading(false);
           }
         };

  const handlePageChange = (page) => {
    loadMovies(page);
  };

  useEffect(() => {
    console.log('Movies state updated:', movies);
  }, [movies]);

  // Load movies on component mount
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
                
                       {(
                         <>
                           {/* Hero Section - Banner phim nổi bật */}
          <Banner onFeaturedMovieChange={handleFeaturedMovieChange} />
                           
                           {/* Top 6 Phim Nổi Bật */}
                           <TopMoviesSection movies={movies.slice(0, 6)} />
                           
                           {/* Bộ lọc nâng cao - Tạm thời tắt để tránh lỗi */}
                           {/* <AdvancedMovieFilter 
                             onFilterChange={(newFilters) => {
                               setFilters(newFilters);
                               loadMovies(1);
                             }}
                             onSearch={(keyword, filterOptions) => {
                               handleSearch(keyword);
                             }}
                           /> */}
                           
                           {/* Bạn đang quan tâm gì? */}
                           <InterestSuggestions />
                           
                           {/* Top 10 phim bộ hôm nay */}
                           <TopMovies 
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
                           />
                           
                           {/* Top 10 phim lẻ hôm nay */}
                           <TopMovies 
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
                           />
                           
                           {/* Top bình luận */}
                           <TopComments />
                           
                           {/* Phim Điện Ảnh Mới Coóng */}
                           <MovieSection 
                             title="Phim Điện Ảnh Mới Coóng"
                             description="Những bộ phim điện ảnh mới nhất, chất lượng cao"
                             movies={filterHighQualityMovies(filterNewMovies(movies)).slice(0, 12)}
                             linkTo="/phim-de-cu"
                           />
                           
                           {/* Phim Trung Quốc mới */}
                           <MovieSection 
                             title="Phim Trung Quốc mới"
                             description="Tuyển tập phim Trung Quốc mới cập nhật"
                             movies={filterMoviesByTheme(movies, 'chinese').slice(0, 12)}
                           />
                           
                           {/* Mãn Nhãn với Phim Chiếu Rạp */}
                           <MovieSection 
                             title="Mãn Nhãn với Phim Chiếu Rạp"
                             description="Những bộ phim chiếu rạp nổi bật hiện đang có"
                             movies={filterMoviesByTheme(movies, 'cinema').slice(0, 12)}
                           />
                           
                           {/* Kho Tàng Anime Mới Nhất */}
                           <MovieSection 
                             title="Kho Tàng Anime Mới Nhất"
                             description="Tuyển tập anime mới nhất, đa dạng thể loại"
                             movies={(() => {
                               const animeMovies = filterMoviesByTheme(movies, 'anime');
                               const japaneseMovies = filterMoviesByTheme(movies, 'japanese');
                               const animationMovies = movies.filter(movie => {
                                 const category = movie.category?.map(c => c.name?.toLowerCase()).join(' ') || '';
                                 return category.includes('hoạt hình') || category.includes('animation');
                               });
                               return animeMovies.length > 0 ? animeMovies : 
                                      japaneseMovies.length > 0 ? japaneseMovies : 
                                      animationMovies.slice(0, 12);
                             })()}
                           />
                           
                           {/* Yêu Kiểu Mỹ */}
                           <MovieSection 
                             title="Yêu Kiểu Mỹ"
                             description="Tuyển tập phim tình cảm của Mỹ"
                             movies={(() => {
                               const americanRomance = filterMoviesByTheme(filterMoviesByTheme(movies, 'american'), 'romance');
                               const americanMovies = filterMoviesByTheme(movies, 'american');
                               const romanceMovies = filterMoviesByTheme(movies, 'romance');
                               return americanRomance.length > 0 ? americanRomance : 
                                      americanMovies.length > 0 ? americanMovies : 
                                      romanceMovies.slice(0, 12);
                             })()}
                           />
                           
                           {/* Phá Án Kiểu Hàn */}
                           <MovieSection 
                             title="Phá Án Kiểu Hàn"
                             description="Phim trinh thám Hàn Quốc hấp dẫn"
                             movies={(() => {
                               const koreanDetective = filterMoviesByTheme(filterMoviesByTheme(movies, 'korean'), 'detective');
                               const koreanMovies = filterMoviesByTheme(movies, 'korean');
                               const detectiveMovies = filterMoviesByTheme(movies, 'detective');
                               return koreanDetective.length > 0 ? koreanDetective : 
                                      koreanMovies.length > 0 ? koreanMovies : 
                                      detectiveMovies.slice(0, 12);
                             })()}
                           />
                           
                           {/* Điện Ảnh Chiều Thứ 7 */}
                           <MovieSection 
                             title="Điện Ảnh Chiều Thứ 7"
                             description="Các phim đề xuất cho cuối tuần"
                             movies={filterMoviesByTheme(movies, 'weekend').slice(0, 12)}
                           />
                           
                           {/* Footer */}
                           <Footer />
                         </>
                       )}


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
                   <Route path="/phim-le" element={<AdvancedSearch />} />
                   <Route path="/phim-bo" element={<AdvancedSearch />} />
                   <Route path="/phim-de-cu" element={<MovieFeatured />} />
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
