import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getApiBaseUrl } from '../utils/apiConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch(`${getApiBaseUrl()}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData.data);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (loginIdentifier, password) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: loginIdentifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Đăng nhập thất bại' };
      }

      localStorage.setItem('token', data.token);
      setUser(data.user);
      setIsAuthenticated(true);

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Có lỗi xảy ra' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Đăng ký thất bại' };
      }

      return { success: true, message: 'Đăng ký thành công' };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Có lỗi xảy ra' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiBaseUrl()}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Đổi mật khẩu thất bại' };
      }

      return { success: true, message: 'Đổi mật khẩu thành công' };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: 'Có lỗi xảy ra' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Gửi email thất bại' };
      }

      return { success: true, message: 'Email đã được gửi' };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, message: 'Có lỗi xảy ra' };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Đặt lại mật khẩu thất bại' };
      }

      return { success: true, message: 'Đặt lại mật khẩu thành công' };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, message: 'Có lỗi xảy ra' };
    }
  };

  const updateProfile = async (updateData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiBaseUrl()}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Cập nhật thông tin thất bại' };
      }

      setUser(data.data);
      return { success: true, user: data.data };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Có lỗi xảy ra' };
    }
  };

  const addToWatchlist = async (movieId) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/users/watchlist`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ movieId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Thêm vào danh sách thất bại' };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Add to watchlist error:', error);
      return { success: false, message: 'Có lỗi xảy ra' };
    }
  };

  const removeFromWatchlist = async (movieId) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/users/watchlist/${movieId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Xóa khỏi danh sách thất bại' };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Remove from watchlist error:', error);
      return { success: false, message: 'Có lỗi xảy ra' };
    }
  };

  const addToFavorites = async (movieId) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/users/favorites`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ movieId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Thêm vào yêu thích thất bại' };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Add to favorites error:', error);
      return { success: false, message: 'Có lỗi xảy ra' };
    }
  };

  const removeFromFavorites = async (movieId) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/users/favorites/${movieId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Xóa khỏi yêu thích thất bại' };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Remove from favorites error:', error);
      return { success: false, message: 'Có lỗi xảy ra' };
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    changePassword,
    forgotPassword,
    resetPassword,
    updateProfile,
    addToWatchlist,
    removeFromWatchlist,
    addToFavorites,
    removeFromFavorites,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;