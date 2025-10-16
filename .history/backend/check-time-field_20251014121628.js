const mongoose = require('mongoose');
require('dotenv').config({ path: './env_new' });

const movieSchema = new mongoose.Schema({
  _id: String,
  name: String,
  slug: String,
  origin_name: String,
  type: String,
  year: Number,
  poster_url: String,
  thumb_url: String,
  banner_url: String,
  episode_current: String,
  episode_total: String,
  time: String,
  quality: String,
  lang: String,
  category: [Object],
  country: [Object],
  sub_docquyen: Boolean,
  tmdb: Object,
  imdb: Object,
  modified: Object
}, { timestamps: true, strict: false });

const Movie = mongoose.model('Movie', movieSchema);

async function checkTimeField() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get a few sample movies to check the time field
    const samples = await Movie.find({ time: { $exists: true, $ne: null } }).limit(10).select('name time year type');
    
    console.log('\n=== Sample movies with time field ===');
    samples.forEach((movie, index) => {
      console.log(`${index + 1}. ${movie.name} (${movie.year}) - ${movie.type}`);
      console.log(`   Time: "${movie.time}"`);
      console.log('');
    });
    
    // Check if any movies have time field
    const count = await Movie.countDocuments({ time: { $exists: true, $ne: null } });
    console.log(`Total movies with time field: ${count}`);
    
    // Check total movies
    const totalCount = await Movie.countDocuments();
    console.log(`Total movies in database: ${totalCount}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTimeField();
