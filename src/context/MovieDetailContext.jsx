import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";
import Modal from "react-modal";
import YouTube from "react-youtube";
import movieApi from "../services/movieApi";

const MovieContext = createContext();

const opts = {
  height: "390",
  width: "640",
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    autoplay: 1,
  },
};

const MovieProvider = ({ children }) => {
  const [trailerUrl, setTrailerUrl] = useState("");
  const [modalIsOpen, setIsOpen] = useState(false);
  const [movieDetail, setMovieDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVideoTrailer = async (movieSlug) => {
    setLoading(true);
    try {
      console.log('Loading movie detail for slug:', movieSlug);
      // Lấy thông tin chi tiết phim từ KKPhim API
      const movieData = await movieApi.getMovieDetail(movieSlug);
      console.log('Movie detail data:', movieData);
      setMovieDetail(movieData);
      
      // Tìm trailer URL từ dữ liệu phim
      let videoUrl = null;
      
      if (movieData.episodes && movieData.episodes.length > 0) {
        // Lấy video từ tập đầu tiên
        const firstEpisode = movieData.episodes[0];
        console.log('First episode:', firstEpisode);
        
        if (firstEpisode.server_data && firstEpisode.server_data.length > 0) {
          const firstServer = firstEpisode.server_data[0];
          console.log('First server:', firstServer);
          
          if (firstServer.link_m3u8) {
            videoUrl = firstServer.link_m3u8;
            console.log('Found video URL:', videoUrl);
          }
        }
      }
      
      if (videoUrl) {
        // Nếu có video URL, hiển thị modal với video player
        setTrailerUrl(videoUrl);
        setIsOpen(true);
      } else {
        // Nếu không có video, hiển thị thông tin phim
        setTrailerUrl(null);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Error loading movie detail:', error);
      // Hiển thị modal với thông báo lỗi
      setTrailerUrl(null);
      setMovieDetail(null);
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setTrailerUrl("");
    setMovieDetail(null);
  };

  const fetchMovieDetail = async (movieSlug) => {
    setLoading(true);
    try {
      console.log('Loading movie detail for slug:', movieSlug);
      const movieData = await movieApi.getMovieDetail(movieSlug);
      console.log('Movie detail data:', movieData);
      setMovieDetail(movieData);
      return movieData;
    } catch (error) {
      console.error('Error loading movie detail:', error);
      setMovieDetail(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <MovieContext.Provider value={{ 
      handleVideoTrailer,
      movieDetail,
      loading,
      error: null, // Có thể thêm error state nếu cần
      fetchMovieDetail
    }}>
      {children}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={{
          overlay: {
            position: "fixed",
            zIndex: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          },
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#1f2937",
            border: "none",
            borderRadius: "8px",
            padding: "0",
            maxWidth: "90vw",
            maxHeight: "90vh",
            overflow: "auto",
          },
        }}
        contentLabel="Movie Detail Modal"
      >
        <div className="relative">
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="luxury-spinner">
                <div className="luxury-ring luxury-ring-outer"></div>
                <div className="luxury-ring luxury-ring-middle"></div>
                <div className="luxury-ring luxury-ring-inner"></div>
                <div className="luxury-core"></div>
              </div>
            </div>
          ) : trailerUrl ? (
            <div className="w-full">
              <video
                controls
                autoPlay
                className="w-full h-auto max-h-[70vh]"
                style={{ maxWidth: "800px" }}
              >
                <source src={trailerUrl} type="application/x-mpegURL" />
                <source src={trailerUrl} type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ video này.
              </video>
            </div>
          ) : movieDetail ? (
            <div className="p-6 text-white max-w-4xl">
              <div className="flex gap-6">
                <img
                  src={movieApi.getWebpImage(movieDetail.poster_url || movieDetail.thumb_url)}
                  alt={movieDetail.name}
                  className="w-48 h-72 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = '/src/assets/temp-1.jpeg';
                  }}
                />
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-4">{movieDetail.name}</h2>
                  
                  <div className="space-y-2 mb-4">
                    {movieDetail.year && (
                      <p><span className="font-semibold">Năm:</span> {movieDetail.year}</p>
                    )}
                    {movieDetail.country && movieDetail.country.length > 0 && (
                      <p><span className="font-semibold">Quốc gia:</span> {movieDetail.country[0].name}</p>
                    )}
                    {movieDetail.category && movieDetail.category.length > 0 && (
                      <p><span className="font-semibold">Thể loại:</span> {movieDetail.category.map(cat => cat.name).join(', ')}</p>
                    )}
                    {movieDetail.episode_current && (
                      <p><span className="font-semibold">Tập:</span> {movieDetail.episode_current}</p>
                    )}
                    {movieDetail.quality && (
                      <p><span className="font-semibold">Chất lượng:</span> {movieDetail.quality}</p>
                    )}
                    {movieDetail.lang && (
                      <p><span className="font-semibold">Ngôn ngữ:</span> {movieDetail.lang}</p>
                    )}
                    {movieDetail.time && (
                      <p><span className="font-semibold">Thời lượng:</span> {movieDetail.time}</p>
                    )}
                  </div>
                  
                  {movieDetail.content && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Nội dung:</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {movieDetail.content}
                      </p>
                    </div>
                  )}
                  
                  {movieDetail.episodes && movieDetail.episodes.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Danh sách tập:</h3>
                      <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                        {movieDetail.episodes.map((episode, index) => (
                          <button
                            key={index}
                            className="bg-gray-700 hover:bg-gray-600 p-2 rounded text-sm transition-colors"
                            onClick={() => {
                              if (episode.server_data && episode.server_data.length > 0) {
                                const videoUrl = episode.server_data[0].link_m3u8;
                                if (videoUrl) {
                                  setTrailerUrl(videoUrl);
                                }
                              }
                            }}
                          >
                            Tập {episode.episode_name || index + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-white">
              <p>Không thể tải thông tin phim.</p>
            </div>
          )}
        </div>
      </Modal>
    </MovieContext.Provider>
  );
};

MovieProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use the movie context
const useMovieDetailContext = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovieDetailContext must be used within a MovieProvider');
  }
  return context;
};

export { MovieProvider, MovieContext, useMovieDetailContext };
