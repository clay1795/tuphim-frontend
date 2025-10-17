import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextSimple';
import commentApi from '../services/commentApi';
import PropTypes from 'prop-types';

const CommentSection = ({ movieSlug, movieId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [username, setUsername] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Load comments
  useEffect(() => {
    loadComments();
  }, [movieSlug, sortBy, page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize username - sử dụng fullName nếu có
  useEffect(() => {
    if (user) {
      // Ưu tiên: fullName -> username -> email
      setUsername(user.fullName || user.username || user.email || 'User');
    } else {
      setUsername('Anonymous');
    }
  }, [user]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await commentApi.getComments(movieSlug, {
        page,
        limit: 20,
        sort: sortBy
      });

      if (response.success) {
        if (page === 1) {
          setComments(response.data.comments);
        } else {
          setComments(prev => [...prev, ...response.data.comments]);
        }
        setHasMore(page < response.data.pagination.pages);
      } else {
        setError('Failed to load comments');
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      setError('Please enter a comment');
      return;
    }

    if (!user && !username.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      setPosting(true);
      setError(null);
      
      const response = await commentApi.postComment({
        movieId,
        movieSlug,
        content: newComment.trim(),
        username: user?.username || user?.email || username.trim(), // Username thật từ account
        fullName: user?.fullName || username.trim() // FullName từ account hoặc dùng username nhập vào
      });

      if (response.success) {
        setNewComment('');
        setSuccessMessage('Comment posted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Refresh comments
        setPage(1);
        await loadComments();
      } else {
        setError(response.message || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      setError(error.message || 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleVote = async (commentId, action) => {
    try {
      const response = await commentApi.voteComment(commentId, action);
      
      if (response.success) {
        // Update comment in local state
        setComments(prev => prev.map(comment => 
          comment._id === commentId 
            ? { ...comment, upvotes: response.data.upvotes, downvotes: response.data.downvotes }
            : comment
        ));
      }
    } catch (error) {
      console.error('Error voting on comment:', error);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);
    
    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    
    return commentDate.toLocaleDateString('vi-VN');
  };

  const getAvatarUrl = (avatar, username) => {
    if (avatar) return avatar;
    
    // Generate avatar from username
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const color = colors[username.length % colors.length];
    const initial = username.charAt(0).toUpperCase();
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=${color.replace('#', '')}&color=fff&size=40`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold text-lg">💬 Bình luận</h4>
          
          {/* Sort options */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="bg-gray-600 text-white px-3 py-1 rounded text-sm border border-gray-500"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="top">Nhiều vote nhất</option>
            <option value="hot">Hot nhất</option>
          </select>
        </div>
        
        {/* Comment form */}
        <form onSubmit={handlePostComment} className="mb-6">
          <div className="space-y-3">
            {!user && (
              <div>
                <input
                  type="text"
                  placeholder="Tên của bạn..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                  maxLength={50}
                />
              </div>
            )}
            
            <textarea
              placeholder="Viết bình luận của bạn..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-gray-800 text-white p-4 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none resize-none"
              rows="4"
              maxLength={1000}
            />
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {user ? (
                  <span className="text-gray-400 text-sm">
                    Đăng nhập với tên: <span className="text-yellow-400">{user.username || user.email}</span>
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm">Đăng nhập để có thêm tính năng</span>
                )}
              </div>
              <button 
                type="submit"
                disabled={posting || !newComment.trim()}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {posting ? 'Đang đăng...' : 'Gửi bình luận'}
              </button>
            </div>
          </div>
        </form>

        {/* Messages */}
        {error && (
          <div className="bg-red-600/20 border border-red-500/50 text-red-300 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-600/20 border border-green-500/50 text-green-300 p-3 rounded-lg mb-4">
            {successMessage}
          </div>
        )}

        {/* Comments list */}
        <div className="space-y-4">
          {loading && page === 1 ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
              <p className="text-gray-400 mt-2">Đang tải bình luận...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
            </div>
          ) : (
            <>
              {comments.map((comment) => (
                <div key={comment._id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src={getAvatarUrl(comment.avatar, comment.fullName || comment.username)}
                      alt={comment.fullName || comment.username}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((comment.fullName || comment.username).charAt(0))}&background=4B5563&color=fff&size=40`;
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-white font-semibold text-sm">{(comment.fullName && comment.fullName.trim()) || comment.username}</span>
                        <span className="text-gray-400 text-xs">{formatTimeAgo(comment.createdAt)}</span>
                        {comment.isEdited && (
                          <span className="text-gray-500 text-xs">(đã chỉnh sửa)</span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed mb-3">
                        {comment.content}
                      </p>
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={() => handleVote(comment._id, 'upvote')}
                          className="text-gray-400 hover:text-green-500 transition-colors text-sm flex items-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span>{comment.upvotes}</span>
                        </button>
                        <button 
                          onClick={() => handleVote(comment._id, 'downvote')}
                          className="text-gray-400 hover:text-red-500 transition-colors text-sm flex items-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 22l-3.09-6.26L2 14.73l5-4.87-1.18-6.88L12 6.23l6.18-3.25L17 9.86l5 4.87-6.91 1.01L12 22z"/>
                          </svg>
                          <span>{comment.downvotes}</span>
                        </button>
                        {comment.replyCount > 0 && (
                          <span className="text-gray-500 text-sm">
                            {comment.replyCount} phản hồi
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Load more button */}
              {hasMore && (
                <div className="text-center mt-6">
                  <button 
                    onClick={() => setPage(prev => prev + 1)}
                    disabled={loading}
                    className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    {loading ? 'Đang tải...' : 'Xem thêm bình luận'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

CommentSection.propTypes = {
  movieSlug: PropTypes.string.isRequired,
  movieId: PropTypes.string
};

export default CommentSection;
