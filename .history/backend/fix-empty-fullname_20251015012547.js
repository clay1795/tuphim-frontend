require('dotenv').config();
const mongoose = require('mongoose');
const Comment = require('./models/Comment');

// Kết nối MongoDB Atlas
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

mongoose.connect(mongoUri).then(() => {
  console.log('✅ Connected to MongoDB Atlas');
  fixEmptyFullNames();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function fixEmptyFullNames() {
  try {
    console.log('🔄 Fixing comments with empty fullName...');

    // Cập nhật tất cả comments có fullName rỗng
    const result = await Comment.updateMany(
      { 
        $or: [
          { fullName: '' },
          { fullName: null },
          { fullName: { $exists: false } }
        ]
      },
      [
        {
          $set: {
            fullName: '$username' // Set fullName = username
          }
        }
      ]
    );

    console.log(`✅ Updated ${result.modifiedCount} comments with empty fullName`);

    // Hiển thị một vài comments để verify
    const sampleComments = await Comment.find().sort({ createdAt: -1 }).limit(10);
    console.log('\n📝 Sample comments:');
    sampleComments.forEach(comment => {
      console.log(`- Username: "${comment.username}" | FullName: "${comment.fullName}" | Content: "${comment.content.substring(0, 30)}..."`);
    });

    console.log('\n✅ All comments fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing comments:', error);
    process.exit(1);
  }
}

