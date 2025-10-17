import { useState, useEffect } from 'react';
import { mongoMovieApi } from '../services/mongoMovieApi';
import commentApi from '../services/commentApi';




  const TopComments = () => {
    const [showAllTrending, setShowAllTrending] = useState(false);
    const [showAllFavorite, setShowAllFavorite] = useState(false);
     const [showAllComments, setShowAllComments] = useState(false);
    
    // API data states
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [favoriteMovies, setFavoriteMovies] = useState([]);
    const [topComments, setTopComments] = useState([]);
    const [loadingTrending, setLoadingTrending] = useState(true);
    const [loadingFavorite, setLoadingFavorite] = useState(true);
    const [loadingComments, setLoadingComments] = useState(true);
    // const [error, setError] = useState(null); // Currently unused

  // Function để tạo avatar từ dữ liệu API thật
  const getRealAvatarFromApi = (movie, index) => {
    // Nếu có poster từ API, tạo avatar từ poster
    if (movie.poster && movie.poster !== '') {
      return movie.poster;
    }
    
    // Nếu có thumbnail từ API
    if (movie.thumbnail && movie.thumbnail !== '') {
      return movie.thumbnail;
    }
    
    // Nếu có image từ API
    if (movie.image && movie.image !== '') {
      return movie.image;
    }
    
    // Fallback: tạo avatar dựa trên movie ID và index
    const movieId = movie._id || movie.id || index;
    const avatarHashes = [
      '7y3Jg6L', '7jQn3Qw', 'Kkqkq8Q', '6sE5w0z', 'kf7pQ8N',
      'avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5',
      'PqqRstu', 'OppqRst', 'MnnopQr', 'NnoPqRs',
      'latest1', 'latest2', 'latest3', 'latest4'
    ];
    const hashIndex = movieId.toString().length % avatarHashes.length;
    return `https://i.imgur.com/${avatarHashes[hashIndex]}.jpg`;
  };

  // Color function removed as we're using fixed background now

  // Load trending movies from MongoDB
  useEffect(() => {
    const loadTrendingMovies = async () => {
      try {
        setLoadingTrending(true);
        // Lấy phim mới cập nhật từ MongoDB
        const data = await mongoMovieApi.getNewMovies(1, 10);
        console.log('Trending movies MongoDB response:', data);
        
        // Xử lý dữ liệu MongoDB API
        let movieData = [];
        
        // MongoDB API trả về format: { success: true, data: { items: [...] } }
        if (data.success && data.data && data.data.items) {
          movieData = data.data.items;
        } else if (Array.isArray(data)) {
          movieData = data;
        }
        
        // Chuyển đổi dữ liệu API thành format cần thiết
        const processedMovies = movieData.slice(0, 10).map((movie, index) => {
          const optimizedUrl = getOptimizedImageUrl(movie);
          console.log(`Trending Movie ${index + 1}:`, {
            title: movie.name || movie.title,
            originalImage: movie.thumb_url || movie.poster_url || movie.thumbnail,
            optimizedUrl: optimizedUrl,
            allImageFields: Object.keys(movie).filter(key => 
              key.includes('thumb') || key.includes('poster') || key.includes('image')
            )
          });
          
          return {
            id: movie._id || index + 1,
            title: movie.name || movie.title || 'Unknown Movie',
            thumbnail: optimizedUrl,
            trend: getRandomTrend(), // Random trend cho demo
            color: getTrendColor(getRandomTrend())
          };
        });
        
        setTrendingMovies(processedMovies);
      } catch (err) {
        console.error('Error loading trending movies:', err);
        // Fallback to mock data
        setTrendingMovies(getMockTrendingMovies());
      } finally {
        setLoadingTrending(false);
      }
    };

    loadTrendingMovies();
  }, []);

  // Load favorite movies from MongoDB
  useEffect(() => {
    const loadFavoriteMovies = async () => {
      try {
        setLoadingFavorite(true);
        // Lấy phim phổ biến từ MongoDB để làm favorite
        console.log('Loading favorite movies from MongoDB...');
        
        // Thử lấy từ phim mới cập nhật (trang 2 để có phim khác)
        let data = await mongoMovieApi.getNewMovies(2, 15);
        console.log('Favorite movies MongoDB response (page 2):', data);
        
        // Nếu không có dữ liệu, thử trang 3
        if (!data || !data.success || !data.data || !data.data.items || data.data.items.length === 0) {
          console.log('Trying page 3 for favorite movies...');
          data = await mongoMovieApi.getNewMovies(3, 15);
        }
        
        // Xử lý dữ liệu MongoDB API
        let movieData = [];
        
        // MongoDB API trả về format: { success: true, data: { items: [...] } }
        if (data.success && data.data && data.data.items) {
          movieData = data.data.items;
          console.log('Found favorite movies in MongoDB:', movieData.length, 'items');
        } else if (Array.isArray(data)) {
          movieData = data;
          console.log('Favorite movies data is array:', movieData.length, 'items');
        }
        
        // Nếu vẫn không có dữ liệu, thử search từ MongoDB
        if (movieData.length === 0) {
          console.log('Trying MongoDB search for favorite movies...');
          try {
            // Thử search phim từ MongoDB
            const searchData = await mongoMovieApi.searchMovies('', { page: 1, limit: 15 });
            console.log('MongoDB search for favorites:', searchData);
            
            if (searchData.success && searchData.data && searchData.data.items) {
              movieData = searchData.data.items;
              console.log('Found movies via MongoDB search:', movieData.length, 'items');
            }
          } catch (altErr) {
            console.log('MongoDB search failed, using fallback:', altErr);
          }
        }
        
        // Tạo danh sách favorite movies đa dạng
        const processedMovies = movieData.slice(0, 15).map((movie, index) => {
          const optimizedUrl = getOptimizedImageUrl(movie);
          console.log(`Favorite Movie ${index + 1}:`, {
            title: movie.name || movie.title,
            originalImage: movie.thumb_url || movie.poster_url || movie.thumbnail,
            optimizedUrl: optimizedUrl,
            allImageFields: Object.keys(movie).filter(key => 
              key.includes('thumb') || key.includes('poster') || key.includes('image')
            )
          });
          
          // Tạo trend pattern đa dạng cho favorite movies
          const trendPattern = ['up', 'up', 'neutral', 'up', 'down', 'up', 'neutral', 'up', 'down', 'neutral'];
          const trend = trendPattern[index % trendPattern.length] || getRandomTrend();
          
          return {
            id: movie._id || `fav_${index + 1}`,
            title: movie.name || movie.title || 'Unknown Movie',
            thumbnail: optimizedUrl,
            trend: trend,
            color: getTrendColor(trend)
          };
        });
        
        // Lấy 10 phim đầu tiên cho favorite
        const finalFavoriteMovies = processedMovies.slice(0, 10);
        console.log('Final favorite movies:', finalFavoriteMovies.length, 'items');
        
        setFavoriteMovies(finalFavoriteMovies);
      } catch (err) {
        console.error('Error loading favorite movies:', err);
        // Fallback to mock data
        setFavoriteMovies(getMockFavoriteMovies());
      } finally {
        setLoadingFavorite(false);
      }
    };

    loadFavoriteMovies();
  }, []);

  // Load top comments from real comment system
  useEffect(() => {
    console.log('🚀 TopComments useEffect triggered');
    const loadTopComments = async () => {
      try {
        setLoadingComments(true);
        console.log('Loading top comments from comment system...');
        
        // Lấy phim mới từ MongoDB để lấy movieSlugs
        const movieData = await mongoMovieApi.getNewMovies(1, 5);
        console.log('Movies for top comments:', movieData);
        
        let movieItems = [];
        if (movieData.success && movieData.data && movieData.data.items) {
          movieItems = movieData.data.items;
        } else if (Array.isArray(movieData)) {
          movieItems = movieData;
        }
        
        // Lấy tất cả comments từ database (không giới hạn theo phim)
        try {
          // Thử lấy comments từ phim có nhiều comments nhất
          const popularMovies = movieItems.slice(0, 10); // Lấy 10 phim đầu
          console.log('Popular movies for comments:', popularMovies.map(m => ({ name: m.name || m.title, slug: m.slug })));
          const allComments = [];
          
          // Test với phim cụ thể trước
          const testMovies = ['tieu-diet-ca-map', 'co-gai-ca-map'];
          for (const slug of testMovies) {
            try {
              console.log(`Fetching comments for movie: ${slug}`);
              const commentResponse = await commentApi.getTopComments(slug, 3); // Lấy 3 comments mỗi phim
              if (commentResponse.success && commentResponse.data.length > 0) {
                console.log(`Found ${commentResponse.data.length} comments for ${slug}`);
                commentResponse.data.forEach(comment => {
                  // Tìm movie object tương ứng
                  const movie = popularMovies.find(m => m.slug === slug);
                  const optimizedUrl = movie ? getOptimizedImageUrl(movie) : '';
                  
                  allComments.push({
                    id: comment._id,
                    user: comment.username || 'User',
                    userInfo: '∞',
                    avatar: comment.avatar || (movie ? getRealAvatarFromApi(movie, 0) : ''),
                    poster: optimizedUrl,
                    comment: comment.content,
                    upvotes: comment.upvotes || 0,
                    downvotes: comment.downvotes || 0,
                    replies: comment.replyCount || 0,
                    isAdmin: false,
                    createdAt: comment.createdAt
                  });
                });
              }
            } catch (commentError) {
              console.log(`No comments found for movie ${slug}:`, commentError);
            }
          }
          
          // Sort comments by upvotes and take top 5
          const sortedComments = allComments
            .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
            .slice(0, 5);
          
          console.log('All comments found:', allComments.length);
          console.log('Sorted comments:', sortedComments.length);
          
          if (sortedComments.length > 0) {
            console.log(`✅ Found ${sortedComments.length} real comments from database`);
            setTopComments(sortedComments);
          } else {
            console.log('No real comments found in database, using mock data');
            // Fallback to mock data
            const generatedComments = movieItems.slice(0, 5).map((movie, index) => {
              const optimizedUrl = getOptimizedImageUrl(movie);
              
              const commentTemplates = [
                `ủa phim lẻ hả,tưởng phim bộ chứ=((`,
                `Phim này diễn viên đẹp quãi lun á :3`,
                `Tập cúi hay qá trùi luôn...khai thác diễn xuất tuyệt đối of John Xina đỉnh kao...`,
                `ê Lý Thấm hợp hình tượng nữ tướng dữ luôn á =)) xem mấy fim motip nữ tướn...`,
                `Bà Clary diễn ngáo&ngớ ngẩn hay 😂 nhưg mà thật sự thì bả ko biết gì thật ...`
              ];
              
              const userNames = ['Con đ mê phim', 'Nguyễn Trung Đức', 'Margaret Qualley', 'zzz', 'Margaret Qualley'];
              const statsData = [
                { upvotes: 0, downvotes: 0, replies: 5 },
                { upvotes: 5, downvotes: 0, replies: 0 },
                { upvotes: 4, downvotes: 0, replies: 0 },
                { upvotes: 4, downvotes: 0, replies: 0 },
                { upvotes: 3, downvotes: 0, replies: 0 }
              ];

              return {
                id: movie._id || `comment_${index + 1}`,
                user: userNames[index] || 'User',
                userInfo: '∞',
                avatar: getRealAvatarFromApi(movie, index),
                poster: optimizedUrl,
                comment: commentTemplates[index] || `Phim ${movie.name || movie.title} hay lắm!`,
                upvotes: statsData[index]?.upvotes || 0,
                downvotes: statsData[index]?.downvotes || 0,
                replies: statsData[index]?.replies || 0,
                isAdmin: index === 1 || index === 3
              };
            });
            
            setTopComments(generatedComments);
          }
        } catch (dbError) {
          console.error('Error fetching comments from database:', dbError);
          // Fallback to mock data
          setTopComments(getMockTopComments());
        }
        
        console.log('Top comments loading completed');
        
      } catch (err) {
        console.error('Error loading top comments:', err);
        // Fallback to mock data
        setTopComments(getMockTopComments());
      } finally {
        setLoadingComments(false);
      }
    };

    loadTopComments();
  }, []);



  // Function để refresh favorite movies
  const refreshFavoriteMovies = async () => {
    try {
      setLoadingFavorite(true);
      console.log('Refreshing favorite movies...');
      
      // Lấy phim từ trang ngẫu nhiên để có dữ liệu mới
      const randomPage = Math.floor(Math.random() * 5) + 1;
      const data = await mongoMovieApi.getNewMovies(randomPage, 10);
      console.log(`Refreshing with page ${randomPage}:`, data);
      
      // Xử lý dữ liệu MongoDB API
      let movieData = [];
      
      // MongoDB API trả về format: { success: true, data: { items: [...] } }
      if (data.success && data.data && data.data.items) {
        movieData = data.data.items;
      } else if (Array.isArray(data)) {
        movieData = data;
      }
      
      const processedMovies = movieData.slice(0, 10).map((movie, index) => {
        const optimizedUrl = getOptimizedImageUrl(movie);
        const trendPattern = ['up', 'up', 'neutral', 'up', 'down', 'up', 'neutral', 'up', 'down', 'neutral'];
        const trend = trendPattern[index % trendPattern.length] || getRandomTrend();
        
        return {
          id: movie._id || `fav_refresh_${index + 1}`,
          title: movie.name || movie.title || 'Unknown Movie',
          thumbnail: optimizedUrl,
          trend: trend,
          color: getTrendColor(trend)
        };
      });
      
      setFavoriteMovies(processedMovies);
      console.log('Favorite movies refreshed successfully');
    } catch (err) {
      console.error('Error refreshing favorite movies:', err);
    } finally {
      setLoadingFavorite(false);
    }
  };

  // Helper functions
  const getRandomTrend = () => {
    const trends = ['up', 'down', 'neutral'];
    return trends[Math.floor(Math.random() * trends.length)];
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return '#4caf50';
      case 'down': return '#e91e63';
      case 'neutral': return '#ffd54a';
      default: return '#ffd54a';
    }
  };

  // Optimize image URL from API
  const getOptimizedImageUrl = (movie) => {
    console.log('Processing movie for image:', movie);
    
    // Thử các field ảnh phổ biến từ KKPhim API
    const imageFields = [
      'thumb_url',
      'poster_url', 
      'thumbnail',
      'thumb',
      'poster',
      'image',
      'cover',
      'banner',
      'img',
      'photo'
    ];
    
    for (const field of imageFields) {
      if (movie[field] && typeof movie[field] === 'string' && movie[field].trim()) {
        let imageUrl = movie[field].trim();
        console.log(`Found image in field "${field}":`, imageUrl);
        
        // Nếu là relative URL, thêm domain
        if (imageUrl.startsWith('/')) {
          imageUrl = `https://phimimg.com${imageUrl}`;
          console.log('Converted relative URL to:', imageUrl);
        }
        
        // Nếu là URL từ phimimg.com, optimize nó
        if (imageUrl.includes('phimimg.com')) {
          const optimizedUrl = `https://phimapi.com/image.php?url=${encodeURIComponent(imageUrl)}`;
          console.log('Optimized phimimg.com URL to:', optimizedUrl);
          return optimizedUrl;
        }
        
        // Nếu là URL hợp lệ khác
        if (imageUrl.startsWith('http')) {
          console.log('Using direct URL:', imageUrl);
          return imageUrl;
        }
      }
    }
    
    // Fallback: tạo placeholder với tên phim
    const movieName = movie.name || movie.title || 'Unknown';
    const placeholderUrl = `https://via.placeholder.com/300x450/2a2a2a/ffffff?text=${encodeURIComponent(movieName.substring(0, 20))}`;
    console.log('Using placeholder URL:', placeholderUrl);
    return placeholderUrl;
  };

  // Function để refresh top comments
  const refreshTopComments = async () => {
    try {
      setLoadingComments(true);
      console.log('Refreshing top comments...');
      
      // Lấy phim từ trang ngẫu nhiên để có bình luận mới
      const randomPage = Math.floor(Math.random() * 3) + 1;
      const data = await mongoMovieApi.getNewMovies(randomPage, 5);
      console.log(`Refreshing comments with page ${randomPage}:`, data);
      
      let movieData = [];
      if (data.success && data.data && data.data.items) {
        movieData = data.data.items;
      } else if (Array.isArray(data)) {
        movieData = data;
      }
      
      // Lấy tất cả comments từ database
      const popularMovies = movieData.slice(0, 10);
      const allComments = [];
      
      for (const movie of popularMovies) {
        try {
          const commentResponse = await commentApi.getTopComments(movie.slug, 2);
          if (commentResponse.success && commentResponse.data.length > 0) {
            commentResponse.data.forEach(comment => {
              const optimizedUrl = getOptimizedImageUrl(movie);
              
              allComments.push({
                id: comment._id,
                user: comment.username || 'User',
                userInfo: '∞',
                avatar: comment.avatar || getRealAvatarFromApi(movie, 0),
                poster: optimizedUrl,
                comment: comment.content,
                upvotes: comment.upvotes || 0,
                downvotes: comment.downvotes || 0,
                replies: comment.replyCount || 0,
                isAdmin: false,
                createdAt: comment.createdAt
              });
            });
          }
        } catch (commentError) {
          console.log(`No comments found for movie ${movie.slug}:`, commentError);
        }
      }
      
      // Sort comments by upvotes and take top 5
      const sortedComments = allComments
        .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
        .slice(0, 5);
      
      if (sortedComments.length > 0) {
        console.log(`Refreshed: Found ${sortedComments.length} real comments from database`);
        setTopComments(sortedComments);
      } else {
        console.log('Refreshed: No real comments found, using mock data');
        const generatedComments = movieData.slice(0, 5).map((movie, index) => {
          const optimizedUrl = getOptimizedImageUrl(movie);
          
          const commentTemplates = [
            `kkkkkkkkkkk(`,
            `Phim này diễn viên đẹp quãi lun á :3`,
            `Tập cúi hay qá trùi luôn...khai thác diễn xuất tuyệt đối of John Xina đỉnh kao...`,
            `ê Lý Thấm hợp hình tượng nữ tướng dữ luôn á =)) xem mấy fim motip nữ tướn...`,
            `Bà Clary diễn ngáo&ngớ ngẩn hay 😂 nhưg mà thật sự thì bả ko biết gì thật ...`
          ];
        
          const userNames = ['Con đ mê phim', 'Nguyễn Trung Đức', 'Margaret Qualley', 'zzz', 'Margaret Qualley'];
          const statsData = [
            { upvotes: 0, downvotes: 0, replies: 5 },
            { upvotes: 5, downvotes: 0, replies: 0 },
            { upvotes: 4, downvotes: 0, replies: 0 },
            { upvotes: 4, downvotes: 0, replies: 0 },
            { upvotes: 3, downvotes: 0, replies: 0 }
          ];

          return {
            id: movie._id || `comment_refresh_${index + 1}`,
            user: userNames[index] || 'User',
            userInfo: '∞',
            avatar: getRealAvatarFromApi(movie, index),
            poster: optimizedUrl,
            comment: commentTemplates[index] || `Phim ${movie.name || movie.title} hay lắm!`,
            upvotes: statsData[index]?.upvotes || 0,
            downvotes: statsData[index]?.downvotes || 0,
            replies: statsData[index]?.replies || 0,
            isAdmin: index === 2
          };
        });
        
        setTopComments(generatedComments);
      }
      
      console.log('Top comments refreshed successfully');
    } catch (err) {
      console.error('Error refreshing top comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  // Mock data fallback
  const getMockTopComments = () => [
  {
    id: 1,
      user: 'Con đ mê phim',
      userInfo: '∞',
      avatar: 'https://i.imgur.com/7y3Jg6L.jpg',
      poster: 'https://i.imgur.com/biH3P9a.jpg',
      comment: 'ủa phim lẻ hả,tưởng phim bộ chứ=((',
      upvotes: 0,
      downvotes: 0,
      replies: 5,
      isAdmin: false
  },
  {
    id: 2,
      user: 'Nguyễn Trung Đức',
      userInfo: '∞',
      avatar: 'https://i.imgur.com/7jQn3Qw.jpg',
      poster: 'https://i.imgur.com/6j7U7U4.jpg',
      comment: 'Phim này diễn viên đẹp quãi lun á :3',
      upvotes: 5,
      downvotes: 0,
      replies: 0,
      isAdmin: false
  },
  {
    id: 3,
      user: 'Margaret Qualley',
      userInfo: '∞',
      avatar: 'https://i.imgur.com/Kkqkq8Q.jpg',
      poster: 'https://i.imgur.com/iy7Vd7U.jpg',
      comment: 'Tập cúi hay qá trùi luôn...khai thác diễn xuất tuyệt đối of John Xina đỉnh kao...',
      upvotes: 4,
      downvotes: 0,
      replies: 0,
      isAdmin: false
  },
  {
    id: 4,
      user: 'zzz',
      userInfo: '∞',
      avatar: 'https://i.imgur.com/6sE5w0z.jpg',
      poster: 'https://i.imgur.com/3WCHuCe.jpg',
      comment: 'ê Lý Thấm hợp hình tượng nữ tướng dữ luôn á =)) xem mấy fim motip nữ tướn...',
      upvotes: 4,
      downvotes: 0,
      replies: 0,
      isAdmin: false
    },
    {
      id: 5,
      user: 'Margaret Qualley',
      userInfo: '∞',
      avatar: 'https://i.imgur.com/kf7pQ8N.jpg',
      poster: 'https://i.imgur.com/iy7Vd7U.jpg',
      comment: 'Bà Clary diễn ngáo&ngớ ngẩn hay 😂 nhưg mà thật sự thì bả ko biết gì thật ...',
      upvotes: 3,
      downvotes: 0,
      replies: 0,
      isAdmin: false
    }
  ];

  const getMockTrendingMovies = () => [
    { id: 1, title: 'Hãy Lấy Em Đi', thumbnail: 'https://i.imgur.com/6j7U7U4.jpg', trend: 'up', color: '#4caf50' },
    { id: 2, title: 'Nhập Thanh Vân', thumbnail: 'https://i.imgur.com/biH3P9a.jpg', trend: 'up', color: '#4caf50' },
    { id: 3, title: 'Yến Ngộ Vĩnh An', thumbnail: 'https://i.imgur.com/3WCHuCe.jpg', trend: 'down', color: '#e91e63' },
    { id: 4, title: 'Thần Đèn Ơi, Ước Đi', thumbnail: 'https://i.imgur.com/ESkv6Qp.jpg', trend: 'up', color: '#4caf50' },
    { id: 5, title: 'Nhất Tiếu Tùy Ca', thumbnail: 'https://i.imgur.com/iy7Vd7U.jpg', trend: 'up', color: '#4caf50' },
    { id: 6, title: 'Kim Chiêu Ngọc Túy', thumbnail: 'https://i.imgur.com/2x3y4z5.jpg', trend: 'up', color: '#4caf50' },
    { id: 7, title: 'Phi Vụ Động Trời 2', thumbnail: 'https://i.imgur.com/3y4z5x6.jpg', trend: 'up', color: '#4caf50' },
    { id: 8, title: 'Hồi Hồn Kế', thumbnail: 'https://i.imgur.com/4z5x6y7.jpg', trend: 'up', color: '#4caf50' },
    { id: 9, title: 'Thế Giới Không Lối Thoát', thumbnail: 'https://i.imgur.com/5x6y7z8.jpg', trend: 'down', color: '#e91e63' },
    { id: 10, title: 'Biên Giới Cuối Cùng', thumbnail: 'https://i.imgur.com/7x8Y9Z1.jpg', trend: 'up', color: '#4caf50' }
  ];


  const getMockFavoriteMovies = () => [
    { id: 1, title: 'Hãy Lấy Em Đi', thumbnail: 'https://i.imgur.com/6j7U7U4.jpg', trend: 'up', color: '#4caf50' },
    { id: 2, title: 'Thần Đèn Ơi, Ước Đi', thumbnail: 'https://i.imgur.com/ESkv6Qp.jpg', trend: 'up', color: '#4caf50' },
    { id: 3, title: 'Nhập Thanh Vân', thumbnail: 'https://i.imgur.com/biH3P9a.jpg', trend: 'down', color: '#e91e63' },
    { id: 4, title: 'Yến Ngộ Vĩnh An', thumbnail: 'https://i.imgur.com/3WCHuCe.jpg', trend: 'neutral', color: '#ffd54a' },
    { id: 5, title: 'Nhất Tiếu Tùy Ca', thumbnail: 'https://i.imgur.com/iy7Vd7U.jpg', trend: 'up', color: '#4caf50' },
    { id: 6, title: 'Kim Chiêu Ngọc Túy', thumbnail: 'https://i.imgur.com/2x3y4z5.jpg', trend: 'neutral', color: '#ffd54a' },
    { id: 7, title: 'Phi Vụ Động Trời 2', thumbnail: 'https://i.imgur.com/3y4z5x6.jpg', trend: 'up', color: '#4caf50' },
    { id: 8, title: 'Hồi Hồn Kế', thumbnail: 'https://i.imgur.com/4z5x6y7.jpg', trend: 'neutral', color: '#ffd54a' },
    { id: 9, title: 'Thế Giới Không Lối Thoát', thumbnail: 'https://i.imgur.com/5x6y7z8.jpg', trend: 'down', color: '#e91e63' },
    { id: 10, title: 'Biên Giới Cuối Cùng', thumbnail: 'https://i.imgur.com/7x8Y9Z1.jpg', trend: 'neutral', color: '#ffd54a' }
  ];

  const displayTrending = showAllTrending ? trendingMovies : trendingMovies.slice(0, 5);
  const displayFavorite = showAllFavorite ? favoriteMovies : favoriteMovies.slice(0, 5);

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-2px); }
            75% { transform: translateX(2px); }
          }
          
          @keyframes fade {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 0.3; }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          
          .arrow-up:hover {
            animation: bounce 0.6s ease;
            color: #4caf50 !important;
          }
          
          .arrow-down:hover {
            animation: shake 0.5s ease;
            color: #e91e63 !important; /* Pink for thumbs down */
          }
        `}
      </style>
      <div style={{
        color: '#e8e9ed',
        fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
        padding: '0'
      }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
         {/* 3 CỘT: SÔI NỔI / YÊU THÍCH / TOP BÌNH LUẬN */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
          marginBottom: '16px'
        }}>
          
          {/* SÔI NỔI NHẤT */}
          <section 
            data-section="trending"
            style={{
              background: 'rgba(26, 27, 35, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
              padding: '16px',
              backdropFilter: 'blur(5px)'
          }}>
            <h2 style={{
              fontSize: '18px',
              marginBottom: '14px',
              color: '#ffd54a',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              letterSpacing: '0.2px'
            }}>
              <i className="fa-solid fa-fire"></i> SÔI NỔI NHẤT
              {loadingTrending && (
                <i className="fa-solid fa-spinner fa-spin" style={{ 
                  fontSize: '14px', 
                  color: '#ffd54a',
                  marginLeft: '8px'
                }}></i>
              )}
            </h2>
            
            {loadingTrending ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '20px',
                textAlign: 'center',
                color: '#9aa0b4'
              }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '8px' }}></i>
                <span>Đang tải dữ liệu...</span>
              </div>
            ) : (
              <ol style={{ listStyle: 'none' }}>
              {displayTrending.map((movie, index) => (
                <li key={movie.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  color: '#e6e7ef',
                  transition: 'transform 0.15s ease',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  marginBottom: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(2px)'
                }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#9aa0b4',
                    minWidth: '20px'
                  }}>
                    {index + 1}.
                  </span>
                  {movie.trend === 'up' && (
                    <i className="fa-solid fa-arrow-trend-up" style={{ 
                      color: movie.color,
                      fontSize: '16px',
                      filter: 'drop-shadow(0 0 3px rgba(76, 175, 80, 0.3))',
                      transition: 'all 0.3s ease',
                      animation: 'pulse 2s infinite'
                    }}></i>
                  )}
                  {movie.trend === 'down' && (
                    <i className="fa-solid fa-arrow-trend-down" style={{ 
                      color: movie.color,
                      fontSize: '16px',
                      filter: 'drop-shadow(0 0 3px rgba(233, 30, 99, 0.3))',
                      transition: 'all 0.3s ease',
                      animation: 'shake 1s infinite'
                    }}></i>
                  )}
                  {movie.trend === 'neutral' && (
                    <div style={{
                      width: '16px',
                      height: '3px',
                      backgroundColor: movie.color,
                      borderRadius: '2px',
                      opacity: '0.7',
                      transition: 'all 0.3s ease',
                      animation: 'fade 3s infinite'
                    }}></div>
                  )}
                  <img 
                    src={movie.thumbnail} 
                    alt={movie.title}
                    style={{
                      width: '40px',
                      height: '55px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      boxShadow: '0 0 10px rgba(255, 255, 255, 0.12)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      cursor: 'pointer',
                      background: 'linear-gradient(45deg, #2a2a2a, #1a1a1a)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                      e.target.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.12)';
                    }}
                    onError={(e) => {
                      // Fallback khi ảnh lỗi
                      const movieName = movie.title || 'Unknown';
                      e.target.src = `https://via.placeholder.com/40x55/2a2a2a/ffffff?text=${encodeURIComponent(movieName.substring(0, 3))}`;
                    }}
                    onLoad={(e) => {
                      // Ẩn loading state khi ảnh load xong
                      e.target.style.opacity = '1';
                    }}
                  />
                  {movie.title}
                </li>
              ))}
              </ol>
            )}
            <button 
              onClick={() => setShowAllTrending(!showAllTrending)}
              style={{
                display: 'inline-block',
                marginTop: '6px',
                color: '#9aa0b4',
                fontSize: '12px',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0'
              }}
            >
              {showAllTrending ? 'Thu gọn' : 'Xem thêm'}
            </button>
          </section>

          {/* YÊU THÍCH NHẤT */}
          <section style={{
            background: 'rgba(26, 27, 35, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
            padding: '16px',
            backdropFilter: 'blur(5px)'
          }}>
            <h2 style={{
              fontSize: '18px',
              marginBottom: '14px',
              color: '#ffd54a',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              letterSpacing: '0.2px'
            }}>
              <i className="fa-solid fa-heart"></i> YÊU THÍCH NHẤT
              {loadingFavorite && (
                <i className="fa-solid fa-spinner fa-spin" style={{ 
                  fontSize: '14px', 
                  color: '#ffd54a',
                  marginLeft: '8px'
                }}></i>
              )}
              <button
                onClick={refreshFavoriteMovies}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffd54a',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginLeft: 'auto',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 213, 74, 0.1)';
                  e.target.style.transform = 'rotate(180deg)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.transform = 'rotate(0deg)';
                }}
                title="Làm mới danh sách yêu thích"
              >
                <i className="fa-solid fa-rotate"></i>
              </button>
            </h2>
            
            {loadingFavorite ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '20px',
                textAlign: 'center',
                color: '#9aa0b4'
              }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '8px' }}></i>
                <span>Đang tải dữ liệu...</span>
              </div>
            ) : (
              <ol style={{ listStyle: 'none' }}>
              {displayFavorite.map((movie, index) => (
                <li key={movie.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  color: '#e6e7ef',
                  transition: 'transform 0.15s ease',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  marginBottom: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(2px)'
                }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#9aa0b4',
                    minWidth: '20px'
                  }}>
                    {index + 1}.
                  </span>
                  {movie.trend === 'up' && (
                    <i className="fa-solid fa-arrow-trend-up" style={{ 
                      color: movie.color,
                      fontSize: '16px',
                      filter: 'drop-shadow(0 0 3px rgba(76, 175, 80, 0.3))',
                      transition: 'all 0.3s ease',
                      animation: 'pulse 2s infinite'
                    }}></i>
                  )}
                  {movie.trend === 'down' && (
                    <i className="fa-solid fa-arrow-trend-down" style={{ 
                      color: movie.color,
                      fontSize: '16px',
                      filter: 'drop-shadow(0 0 3px rgba(233, 30, 99, 0.3))',
                      transition: 'all 0.3s ease',
                      animation: 'shake 1s infinite'
                    }}></i>
                  )}
                  {movie.trend === 'neutral' && (
                    <div style={{
                      width: '16px',
                      height: '3px',
                      backgroundColor: movie.color,
                      borderRadius: '2px',
                      opacity: '0.7',
                      transition: 'all 0.3s ease',
                      animation: 'fade 3s infinite'
                    }}></div>
                  )}
                  <img 
                    src={movie.thumbnail} 
                    alt={movie.title}
                    style={{
                      width: '40px',
                      height: '55px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      boxShadow: '0 0 10px rgba(255, 255, 255, 0.12)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      cursor: 'pointer',
                      background: 'linear-gradient(45deg, #2a2a2a, #1a1a1a)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                      e.target.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.12)';
                    }}
                    onError={(e) => {
                      // Fallback khi ảnh lỗi
                      const movieName = movie.title || 'Unknown';
                      e.target.src = `https://via.placeholder.com/40x55/2a2a2a/ffffff?text=${encodeURIComponent(movieName.substring(0, 3))}`;
                    }}
                    onLoad={(e) => {
                      // Ẩn loading state khi ảnh load xong
                      e.target.style.opacity = '1';
                    }}
                  />
                  {movie.title}
                </li>
              ))}
              </ol>
            )}
            <button 
              onClick={() => setShowAllFavorite(!showAllFavorite)}
              style={{
                display: 'inline-block',
                marginTop: '6px',
                color: '#9aa0b4',
                fontSize: '12px',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0'
              }}
            >
              {showAllFavorite ? 'Thu gọn' : 'Xem thêm'}
            </button>
          </section>

           {/* TOP BÌNH LUẬN */}
          <section style={{
             background: 'rgba(26, 27, 35, 0.3)',
             border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
             boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
             padding: '16px',
             backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{
              fontSize: '18px',
              marginBottom: '14px',
               color: '#ff8c00',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
               letterSpacing: '0.2px',
               textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}>
               <i className="fa-solid fa-medal"></i> TOP BÌNH LUẬN
               {loadingComments && (
                <i className="fa-solid fa-spinner fa-spin" style={{ 
                  fontSize: '14px', 
                   color: '#ff8c00',
                  marginLeft: '8px'
                }}></i>
              )}
              <button
                 onClick={refreshTopComments}
                style={{
                  background: 'none',
                  border: 'none',
                   color: '#ff8c00',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginLeft: 'auto',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                   e.target.style.backgroundColor = 'rgba(255, 140, 0, 0.1)';
                  e.target.style.transform = 'rotate(180deg)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.transform = 'rotate(0deg)';
                }}
                 title="Làm mới bình luận"
              >
                <i className="fa-solid fa-rotate"></i>
              </button>
            </h2>
            
             {loadingComments ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '20px',
                textAlign: 'center',
                color: '#9aa0b4'
              }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '8px' }}></i>
                 <span>Đang tải bình luận...</span>
              </div>
            ) : (
               (showAllComments ? topComments : topComments.slice(0, 4)).map((comment) => (
              <div key={comment.id} style={{
                marginBottom: '12px',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: '0.2s',
                  display: 'flex',
                gap: '12px',
                backdropFilter: 'blur(3px)'
                }}>
                  <img 
                    src={comment.avatar} 
                    alt="" 
                    style={{
                     width: '32px',
                     height: '32px',
                      borderRadius: '50%',
                     objectFit: 'cover',
                     flexShrink: 0
                   }}
                 />
                 <div style={{ flex: 1 }}>
                   <div style={{
                     display: 'flex',
                     alignItems: 'center',
                     gap: '6px',
                     marginBottom: '6px'
                   }}>
                  <span style={{
                       fontSize: '13px',
                    color: '#fff',
                       fontWeight: '600'
                  }}>
                       {comment.user}
                  </span>
                     <span style={{
                       color: '#ffd54a',
                       fontSize: '12px'
                     }}>{comment.userInfo}</span>
            </div>
                <p style={{
                     fontSize: '12px',
                  color: '#fff',
                  lineHeight: '1.4',
                     marginBottom: '6px',
                     overflow: 'hidden',
                     display: '-webkit-box',
                     WebkitLineClamp: 2,
                     WebkitBoxOrient: 'vertical'
                }}>
                  {comment.comment}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                     gap: '12px',
                     fontSize: '11px',
                  color: '#ccc'
                }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                       <i className="fa-solid fa-thumbs-up" style={{ color: '#4caf50', fontSize: '10px' }}></i>
                       {comment.upvotes}
                     </span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                       <i className="fa-solid fa-thumbs-down" style={{ color: '#e91e63', fontSize: '10px' }}></i>
                       {comment.downvotes}
                     </span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                       <i className="fa-regular fa-comment" style={{ color: '#fff', fontSize: '10px' }}></i>
                       {comment.replies}
                     </span>
          </div>
                 </div>
                 <img 
                   src={comment.poster} 
                   alt="Movie Poster"
                   style={{
                     width: '30px',
                     height: '45px',
                     borderRadius: '4px',
                     objectFit: 'cover',
                     flexShrink: 0
                   }}
                   onError={(e) => {
                     e.target.src = 'https://via.placeholder.com/30x45/2a2a2a/ffffff?text=No+Image';
                   }}
                 />
      </div>
        ))
            )}
            
            <button 
               onClick={() => setShowAllComments(!showAllComments)}
              style={{
                display: 'inline-block',
                marginTop: '6px',
                color: '#9aa0b4',
                fontSize: '12px',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0'
              }}
            >
               {showAllComments ? 'Thu gọn' : 'Xem thêm'}
            </button>
    </section>
          </div>
      </div>
    </div>
    </>
  );
};

export default TopComments;