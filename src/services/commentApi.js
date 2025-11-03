import { getApiUrl } from '../utils/apiConfig.js';

const commentApi = {
  /**
   * Get comments for a movie
   * @param {string} movieSlug - Movie slug
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Comments data
   */
  async getComments(movieSlug, options = {}) {
    try {
      const { page = 1, limit = 20, sort = 'newest' } = options;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort
      });
      
      const response = await fetch(`${getApiUrl()}/comments/${movieSlug}?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  /**
   * Post a new comment
   * @param {Object} commentData - Comment data
   * @returns {Promise<Object>} Created comment
   */
  async postComment(commentData) {
    try {
      const { movieId, movieSlug, content, parentCommentId, username } = commentData;
      
      const response = await fetch(`${getApiUrl()}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId,
          movieSlug,
          content,
          parentCommentId,
          username: username || 'Anonymous'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error posting comment:', error);
      throw error;
    }
  },

  /**
   * Vote on a comment
   * @param {string} commentId - Comment ID
   * @param {string} action - Vote action ('upvote', 'downvote', 'remove')
   * @returns {Promise<Object>} Vote result
   */
  async voteComment(commentId, action) {
    try {
      const response = await fetch(`${getApiUrl()}/comments/${commentId}/vote`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error voting on comment:', error);
      throw error;
    }
  },

  /**
   * Get top comments for a movie (for TopComments component)
   * @param {string} movieSlug - Movie slug
   * @param {number} limit - Number of comments to fetch
   * @returns {Promise<Object>} Top comments data
   */
  async getTopComments(movieSlug, limit = 5) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      });
      
      const response = await fetch(`${getApiUrl()}/comments/top/${movieSlug}?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching top comments:', error);
      throw error;
    }
  },

  /**
   * Get comment statistics for a movie
   * @param {string} movieSlug - Movie slug
   * @returns {Promise<Object>} Comment statistics
   */
  async getCommentStats(movieSlug) {
    try {
      const response = await fetch(`${getApiUrl()}/comments/stats/${movieSlug}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching comment stats:', error);
      throw error;
    }
  },

  /**
   * Get latest comments from all movies
   * @param {number} limit - Number of comments to fetch
   * @returns {Promise<Object>} Latest comments data
   */
  async getLatestComments(limit = 5) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      });
      
      const response = await fetch(`${getApiUrl()}/comments/latest/all?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching latest comments:', error);
      throw error;
    }
  }
};

export default commentApi;
