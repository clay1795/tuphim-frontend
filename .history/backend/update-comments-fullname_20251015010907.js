const mongoose = require('mongoose');
const Comment = require('./models/Comment');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/tuphim', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
  updateComments();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function updateComments() {
  try {
    // Mapping username -> fullName
    const usernameToFullName = {
      'testuser': 'Nguyễn Văn Test',
      'Movie Fan': 'Fan Phim Hay',
      'Movie Lover': 'Người Yêu Phim',
      'Fan Movie': 'Fan Phim Điện Ảnh',
      'New User 1': 'Người Dùng Mới 1',
      'Fresh Commenter': 'Người Bình Luận Mới'
    };

    console.log('🔄 Updating comments with fullName...');

    // Cập nhật tất cả comments
    for (const [username, fullName] of Object.entries(usernameToFullName)) {
      const result = await Comment.updateMany(
        { username: username, fullName: { $in: [null, '', undefined] } },
        { $set: { fullName: fullName } }
      );
      
      console.log(`✅ Updated ${result.modifiedCount} comments for username: ${username} -> ${fullName}`);
    }

    console.log('✅ All comments updated successfully!');
    
    // Hiển thị một vài comments để verify
    const sampleComments = await Comment.find().sort({ createdAt: -1 }).limit(5);
    console.log('\n📝 Sample comments:');
    sampleComments.forEach(comment => {
      console.log(`- ${comment.username} (${comment.fullName || 'NO FULLNAME'}): ${comment.content.substring(0, 50)}...`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating comments:', error);
    process.exit(1);
  }
}

