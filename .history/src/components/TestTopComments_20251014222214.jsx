import React, { useState, useEffect } from 'react';
import commentApi from '../services/commentApi';

const TestTopComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadComments = async () => {
      console.log('🧪 TestTopComments: Starting to load comments...');
      setLoading(true);
      setError(null);
      
      try {
        // Test với phim cụ thể
        const testMovies = ['tieu-diet-ca-map', 'co-gai-ca-map'];
        const allComments = [];
        
        for (const slug of testMovies) {
          console.log(`🧪 TestTopComments: Fetching comments for ${slug}`);
          try {
            const response = await commentApi.getTopComments(slug, 3);
            console.log(`🧪 TestTopComments: Response for ${slug}:`, response);
            
            if (response.success && response.data.length > 0) {
              response.data.forEach(comment => {
                allComments.push({
                  id: comment._id,
                  user: comment.username,
                  comment: comment.content,
                  upvotes: comment.upvotes || 0,
                  downvotes: comment.downvotes || 0,
                  replies: 0,
                  poster: 'https://via.placeholder.com/100x150/333/fff?text=Movie',
                  avatar: 'https://via.placeholder.com/32x32/007bff/fff?text=' + comment.username.charAt(0)
                });
              });
            }
          } catch (err) {
            console.log(`🧪 TestTopComments: No comments for ${slug}:`, err);
          }
        }
        
        console.log(`🧪 TestTopComments: Total comments found: ${allComments.length}`);
        setComments(allComments);
        
        if (allComments.length === 0) {
          setError('No comments found');
        }
        
      } catch (err) {
        console.error('🧪 TestTopComments: Error loading comments:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="text-white font-semibold mb-4 text-lg">🧪 Test TOP BÌNH LUẬN</h4>
        <div className="text-center text-gray-400 py-8">
          <i className="fa-solid fa-spinner fa-spin text-2xl mb-2"></i>
          <p>Đang tải comments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="text-white font-semibold mb-4 text-lg">🧪 Test TOP BÌNH LUẬN</h4>
        <div className="text-center text-red-400 py-8">
          <p>❌ Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white font-semibold text-lg">🧪 Test TOP BÌNH LUẬN</h4>
        <span className="text-gray-400 text-sm">Found {comments.length} comments</span>
      </div>

      {comments.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <p>No comments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start space-x-3">
                <img
                  src={comment.avatar}
                  alt={comment.user}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white font-semibold">{comment.user}</span>
                    <span className="text-gray-400 text-xs">∞</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-2">
                    {comment.comment}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span className="flex items-center space-x-1">
                      <i className="fa-solid fa-thumbs-up"></i>
                      <span>{comment.upvotes}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <i className="fa-solid fa-thumbs-down"></i>
                      <span>{comment.downvotes}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <i className="fa-solid fa-comment"></i>
                      <span>{comment.replies}</span>
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <img
                    src={comment.poster}
                    alt="Movie poster"
                    className="w-16 h-24 rounded object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestTopComments;
