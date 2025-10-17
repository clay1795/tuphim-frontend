const mongoose = require('mongoose');
require('dotenv').config();

async function checkMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📊 All collections:');
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`- ${col.name}: ${count} documents`);
      
      if (count > 0 && col.name.includes('movie')) {
        const sample = await db.collection(col.name).findOne({});
        console.log(`  Sample: ${sample?.name || sample?.title || 'Unknown'}`);
      }
    }
    
    // Check if there are any documents with movie-like data
    console.log('\n🔍 Searching for movie data...');
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      if (count > 0) {
        const sample = await db.collection(col.name).findOne({});
        if (sample && (sample.name || sample.title || sample.poster_url || sample.slug)) {
          console.log(`✅ Found movie data in collection: ${col.name}`);
          console.log(`   Total documents: ${count}`);
          console.log(`   Sample: ${sample.name || sample.title || 'Unknown'}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkMongoDB();
