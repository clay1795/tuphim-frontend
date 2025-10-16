require('dotenv').config();
const mongoose = require('mongoose');
const Comment = require('./models/Comment');
const User = require('./models/User');

// Kết nối MongoDB Atlas
const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri).then(() => {
  console.log('✅ Connected to MongoDB Atlas');
  updateCommentsWithUserFullName();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function updateCommentsWithUserFullName() {
  try {
    console.log('🔄 Updating comments with fullName from User database...');

    // Lấy tất cả users
    const users = await User.find().select('username fullName');
    console.log(`Found ${users.length} users in database`);

    let totalUpdated = 0;

    // Cập nhật comments cho từng user
    for (const user of users) {
      if (user.fullName && user.fullName.trim()) {
        const result = await Comment.updateMany(
          { username: user.username },
          { $set: { fullName: user.fullName } }
        );
        
        if (result.modifiedCount > 0) {
          console.log(`✅ Updated ${result.modifiedCount} comments for user "${user.username}" -> fullName: "${user.fullName}"`);
          totalUpdated += result.modifiedCount;
        }
      }
    }

    console.log(`\n✅ Total ${totalUpdated} comments updated with fullName from User database!`);

    // Hiển thị sample comments
    const sampleComments = await Comment.find().sort({ createdAt: -1 }).limit(10);
    console.log('\n📝 Sample comments after update:');
    sampleComments.forEach(comment => {
      console.log(`- Username: "${comment.username}" | FullName: "${comment.fullName}" | Content: "${comment.content.substring(0, 30)}..."`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating comments:', error);
    process.exit(1);
  }
}

