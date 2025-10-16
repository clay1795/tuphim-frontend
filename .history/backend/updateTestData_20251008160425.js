const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://luongchienhiep:luongHiep2k5@cluster0.8qj8x.mongodb.net/tuphim?retryWrites=true&w=majority', {
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

async function updateTestData() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);
    
    for (const user of users) {
      console.log(`Updating user: ${user.email}`);
      
      // Update favorites with real movie data
      if (user.preferences.favorites && user.preferences.favorites.length > 0) {
        user.preferences.favorites = user.preferences.favorites.map((fav, index) => {
          const movieData = sampleMovies[index % sampleMovies.length];
          return {
            ...fav,
            ...movieData,
            addedAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)) // Different dates
          };
        });
      }
      
      // Update watchlist with real movie data
      if (user.preferences.watchlist && user.preferences.watchlist.length > 0) {
        user.preferences.watchlist = user.preferences.watchlist.map((item, index) => {
          const movieData = sampleMovies[(index + 3) % sampleMovies.length];
          return {
            ...item,
            ...movieData,
            addedAt: new Date(Date.now() - (index * 12 * 60 * 60 * 1000)) // Different dates
          };
        });
      }
      
      // Update watch history with real movie data
      if (user.preferences.watchHistory && user.preferences.watchHistory.length > 0) {
        user.preferences.watchHistory = user.preferences.watchHistory.map((item, index) => {
          const movieData = sampleMovies[(index + 6) % sampleMovies.length];
          return {
            ...item,
            ...movieData,
            watchedAt: new Date(Date.now() - (index * 6 * 60 * 60 * 1000)) // Different dates
          };
        });
      }
      
      await user.save();
      console.log(`Updated user: ${user.email}`);
    }
    
    console.log('✅ All test data updated successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error updating test data:', error);
    process.exit(1);
  }
}

updateTestData();
