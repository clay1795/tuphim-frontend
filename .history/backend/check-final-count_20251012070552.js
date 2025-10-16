const mongoose = require('mongoose');
require('dotenv').config({ path: './env_new' });

const movieSchema = new mongoose.Schema({
  _id: String,
  name: String,
  slug: String,
  last_sync: Date
}, { timestamps: true });

const Movie = mongoose.model('Movie', movieSchema);

async function checkFinalCount() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔌 Connected to MongoDB');
    
    const count = await Movie.countDocuments();
    console.log(`📊 Total movies in database: ${count}`);
    
    // Get recent movies
    const recentMovies = await Movie.find({})
      .sort({ last_sync: -1 })
      .limit(5)
      .select('name slug last_sync');
    
    console.log('\n🎬 Most recent movies:');
    recentMovies.forEach((movie, index) => {
      console.log(`${index + 1}. ${movie.name} (${movie.slug}) - ${movie.last_sync}`);
    });
    
    // Get statistics
    const stats = await Movie.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📈 Movies by type:');
    stats.forEach(stat => {
      console.log(`  ${stat._id || 'Unknown'}: ${stat.count}`);
    });
    
    // Get year distribution
    const yearStats = await Movie.aggregate([
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);
    
    console.log('\n📅 Top years:');
    yearStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} movies`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkFinalCount();
