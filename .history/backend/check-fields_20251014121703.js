const mongoose = require('mongoose');
require('dotenv').config({ path: './env_new' });

const movieSchema = new mongoose.Schema({}, { strict: false });
const Movie = mongoose.model('Movie', movieSchema);

async function checkFields() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Get one sample movie to see all fields
    const sample = await Movie.findOne().lean();
    if (sample) {
      console.log('=== All fields in movie data ===');
      Object.keys(sample).forEach(key => {
        if (typeof sample[key] === 'string' && sample[key].length > 0) {
          console.log(`${key}: "${sample[key]}"`);
        } else if (typeof sample[key] !== 'string') {
          console.log(`${key}: ${typeof sample[key]} - ${JSON.stringify(sample[key]).substring(0, 100)}...`);
        }
      });
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkFields();
