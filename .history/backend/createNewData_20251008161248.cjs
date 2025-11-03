const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb+srv://claydev:Wh3nxgmqs6Lq5bI9@cluster0-claydev.itpluqe.mongodb.net/tuphim_users?retryWrites=true&w=majority&appName=Cluster0-ClayDev', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample movie data with real images
const sampleMovies = [
  {
    movieId: 'movie1',
    movieSlug: 'tien-len-chien-doi-that-sun',
    movieName: 'Tiến Lên! Chiến Đội Thất Sủn...',
    originalName: 'Go! The Lost Team',
    poster_url: 'https://image.tmdb.org/t/p/w500/1Lh9LER4xRQ3INFFi2dfS2hpRwv.jpg',
    thumb_url: 'https://image.tmdb.org/t/p/w300/1Lh9LER4xRQ3INFFi2dfS2hpRwv.jpg',
    banner_url: 'https://image.tmdb.org/t/p/w1280/1Lh9LER4xRQ3INFFi2dfS2hpRwv.jpg'
  },
  {
    movieId: 'movie2',
    movieSlug: 'gintama-thay-ginpachi',
    movieName: 'GINTAMA - Thầy Ginpachi Ở...',
    originalName: 'GINTAMA - Teacher Ginpachi At...',
    poster_url: 'https://image.tmdb.org/t/p/w500/8Y43POKjjKDGI9MH89NW0NAzzp8.jpg',
    thumb_url: 'https://image.tmdb.org/t/p/w300/8Y43POKjjKDGI9MH89NW0NAzzp8.jpg',
    banner_url: 'https://image.tmdb.org/t/p/w1280/8Y43POKjjKDGI9MH89NW0NAzzp8.jpg'
  },
  {
    movieId: 'movie3',
    movieSlug: 'nguoi-vo-thuong-luu',
    movieName: 'Người Vợ Thượng Lưu (Phim...)',
    originalName: 'The Upper-Class Wife',
    poster_url: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
    thumb_url: 'https://image.tmdb.org/t/p/w300/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
    banner_url: 'https://image.tmdb.org/t/p/w1280/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg'
  },
  {
    movieId: 'movie4',
    movieSlug: 'ai-da-danh-cap-nu-hon',
    movieName: 'Ai Đã Đánh Cắp Nụ Hôn Của...',
    originalName: 'Who Stole Her Kiss',
    poster_url: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    thumb_url: 'https://image.tmdb.org/t/p/w300/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    banner_url: 'https://image.tmdb.org/t/p/w1280/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg'
  },
  {
    movieId: 'movie5',
    movieSlug: 'rang-cua-em-nho-anh-roi',
    movieName: 'Răng Của Em Nhớ Anh Rồi',
    originalName: 'My Teeth Miss You Already',
    poster_url: 'https://image.tmdb.org/t/p/w500/6XYLiMxHAaCsoyrVo38LBWMw2p8.jpg',
    thumb_url: 'https://image.tmdb.org/t/p/w300/6XYLiMxHAaCsoyrVo38LBWMw2p8.jpg',
    banner_url: 'https://image.tmdb.org/t/p/w1280/6XYLiMxHAaCsoyrVo38LBWMw2p8.jpg'
  },
  {
    movieId: 'movie6',
    movieSlug: 'gia-thien',
    movieName: 'Già Thiên',
    originalName: 'Old Heaven',
    poster_url: 'https://image.tmdb.org/t/p/w500/4m1Au3YkjqsxF8iwQy0fPYSxE0h.jpg',
    thumb_url: 'https://image.tmdb.org/t/p/w300/4m1Au3YkjqsxF8iwQy0fPYSxE0h.jpg',
    banner_url: 'https://image.tmdb.org/t/p/w1280/4m1Au3YkjqsxF8iwQy0fPYSxE0h.jpg'
  },
  {
    movieId: 'movie7',
    movieSlug: 'phim-hanh-dong-1',
    movieName: 'Phim Hành Động 1',
    originalName: 'Action Movie 1',
    poster_url: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    thumb_url: 'https://image.tmdb.org/t/p/w300/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    banner_url: 'https://image.tmdb.org/t/p/w1280/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg'
  },
  {
    movieId: 'movie8',
    movieSlug: 'phim-tinh-cam-1',
    movieName: 'Phim Tình Cảm 1',
    originalName: 'Romance Movie 1',
    poster_url: 'https://image.tmdb.org/t/p/w500/2g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    thumb_url: 'https://image.tmdb.org/t/p/w300/2g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    banner_url: 'https://image.tmdb.org/t/p/w1280/2g0dhYtq4irTY1GPXvft6k4YLjm.jpg'
  },
  {
    movieId: 'movie9',
    movieSlug: 'phim-kinh-di-1',
    movieName: 'Phim Kinh Dị 1',
    originalName: 'Horror Movie 1',
    poster_url: 'https://image.tmdb.org/t/p/w500/3g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    thumb_url: 'https://image.tmdb.org/t/p/w300/3g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    banner_url: 'https://image.tmdb.org/t/p/w1280/3g0dhYtq4irTY1GPXvft6k4YLjm.jpg'
  },
  {
    movieId: 'movie10',
    movieSlug: 'phim-hai-1',
    movieName: 'Phim Hài 1',
    originalName: 'Comedy Movie 1',
    poster_url: 'https://image.tmdb.org/t/p/w500/4g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    thumb_url: 'https://image.tmdb.org/t/p/w300/4g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    banner_url: 'https://image.tmdb.org/t/p/w1280/4g0dhYtq4irTY1GPXvft6k4YLjm.jpg'
  },
  {
    movieId: 'movie11',
    movieSlug: 'phim-sieu-anh-hung-1',
    movieName: 'Phim Siêu Anh Hùng 1',
    originalName: 'Superhero Movie 1',
    poster_url: 'https://image.tmdb.org/t/p/w500/5g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    thumb_url: 'https://image.tmdb.org/t/p/w300/5g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    banner_url: 'https://image.tmdb.org/t/p/w1280/5g0dhYtq4irTY1GPXvft6k4YLjm.jpg'
  },
  {
    movieId: 'movie12',
    movieSlug: 'phim-khoa-hoc-vien-tuong-1',
    movieName: 'Phim Khoa Học Viễn Tưởng 1',
    originalName: 'Sci-Fi Movie 1',
    poster_url: 'https://image.tmdb.org/t/p/w500/6g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    thumb_url: 'https://image.tmdb.org/t/p/w300/6g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    banner_url: 'https://image.tmdb.org/t/p/w1280/6g0dhYtq4irTY1GPXvft6k4YLjm.jpg'
  }
];

async function createNewData() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Find user with email luongchienhieplch@gmail.com
    const user = await User.findOne({ email: 'luongchienhieplch@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ Found user: ${user.email}`);
    
    // Create completely new favorites data
    const newFavorites = sampleMovies.map((movie, index) => ({
      movieId: movie.movieId,
      movieSlug: movie.movieSlug,
      movieName: movie.movieName,
      originalName: movie.originalName,
      poster_url: movie.poster_url,
      thumb_url: movie.thumb_url,
      banner_url: movie.banner_url,
      addedAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000))
    }));
    
    // Create completely new watchlist data
    const newWatchlist = sampleMovies.slice(0, 8).map((movie, index) => ({
      movieId: movie.movieId,
      movieSlug: movie.movieSlug,
      movieName: movie.movieName,
      originalName: movie.originalName,
      poster_url: movie.poster_url,
      thumb_url: movie.thumb_url,
      banner_url: movie.banner_url,
      addedAt: new Date(Date.now() - (index * 12 * 60 * 60 * 1000))
    }));
    
    // Create completely new watch history data
    const newWatchHistory = sampleMovies.slice(0, 5).map((movie, index) => ({
      movieId: movie.movieId,
      movieSlug: movie.movieSlug,
      movieName: movie.movieName,
      originalName: movie.originalName,
      poster_url: movie.poster_url,
      thumb_url: movie.thumb_url,
      banner_url: movie.banner_url,
      watchedAt: new Date(Date.now() - (index * 6 * 60 * 60 * 1000))
    }));
    
    // Replace the data completely
    user.preferences.favorites = newFavorites;
    user.preferences.watchlist = newWatchlist;
    user.preferences.watchHistory = newWatchHistory;
    
    await user.save();
    console.log('✅ New data created successfully!');
    
    // Verify the update
    console.log('\n📋 New favorites data:');
    user.preferences.favorites.slice(0, 3).forEach((fav, index) => {
      console.log(`${index + 1}. ${fav.movieName}`);
      console.log(`   - poster_url: ${fav.poster_url}`);
      console.log(`   - thumb_url: ${fav.thumb_url}`);
      console.log(`   - banner_url: ${fav.banner_url}`);
      console.log('');
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating new data:', error);
    process.exit(1);
  }
}

createNewData();
