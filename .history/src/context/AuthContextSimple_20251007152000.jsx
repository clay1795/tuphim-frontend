import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('authToken');
    
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    }
    
    setLoading(false);
  }, []);

  // Login function with real backend integration
  const login = async (credentials) => {
    try {
      setLoading(true);
      
      // Validate input
      const { email, password } = credentials;
      if (!email || !password) {
        return { success: false, message: 'Vui lòng nhập đầy đủ email và mật khẩu' };
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, message: 'Email không hợp lệ' };
      }
      
      // Call backend API
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          message: data.message || 'Đăng nhập thất bại' 
        };
      }

      if (data.success && data.data) {
        const { user, token } = data.data;
        
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('authToken', token);
        
        return { success: true, user, token };
      } else {
        return { 
          success: false, 
          message: 'Đăng nhập thất bại' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'Có lỗi xảy ra khi đăng nhập' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function (simplified for now)
  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Validate input
      const { email, password, username, fullName } = userData;
      if (!email || !password || !username || !fullName) {
        return { success: false, message: 'Vui lòng nhập đầy đủ thông tin' };
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, message: 'Email không hợp lệ' };
      }

      // Password validation
      if (password.length < 6) {
        return { success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
      }
      
      // For now, just simulate a successful registration
      const mockUser = {
        id: Date.now().toString(),
        email: email,
        username: username,
        fullName: fullName,
        role: 'user'
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('authToken', 'mock-token');
      
      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: 'Có lỗi xảy ra khi đăng ký' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear local storage and state
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Change password function (simplified)
  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      
      // For now, just simulate success
      return { success: true, message: 'Đổi mật khẩu thành công' };
    } catch (error) {
      console.error('Change password error:', error);
      return { 
        success: false, 
        message: 'Có lỗi xảy ra khi đổi mật khẩu' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('authToken');
  };

  // Check if user is admin
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    changePassword,
    isAuthenticated,
    isAdmin,
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

export default AuthProvider;

