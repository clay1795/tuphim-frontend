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
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      
      // Mock authentication - trong thực tế sẽ gọi API
      const { email, password } = credentials;
      
      // Check if it's admin credentials
      if (email === 'admin@example.com' && password === 'admin123') {
        const adminUser = {
          id: 'admin-1',
          email: 'admin@example.com',
          username: 'admin',
          fullName: 'Administrator',
          role: 'admin',
          avatar: null,
          joinDate: new Date().toISOString().split('T')[0]
        };
        
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        return { success: true, user: adminUser, redirectTo: '/admin' };
      }
      
      // Check if it's a regular member (mock data)
      const mockMembers = [
        {
          id: 'member-1',
          email: 'member@example.com',
          password: 'member123',
          username: 'member1',
          fullName: 'John Doe',
          role: 'member',
          avatar: null,
          joinDate: '2024-01-15'
        },
        {
          id: 'member-2',
          email: 'user@example.com',
          password: 'user123',
          username: 'user1',
          fullName: 'Jane Smith',
          role: 'member',
          avatar: null,
          joinDate: '2024-01-10'
        }
      ];
      
      const member = mockMembers.find(m => m.email === email && m.password === password);
      
      if (member) {
        const { password: _, ...userWithoutPassword } = member;
        setUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        return { success: true, user: userWithoutPassword, redirectTo: null };
      }
      
      return { success: false, message: 'Email hoặc mật khẩu không đúng' };
      
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Có lỗi xảy ra khi đăng nhập' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Mock registration - trong thực tế sẽ gọi API
      const { email, password, displayName } = userData;
      
      // Check if email already exists
      const existingUser = localStorage.getItem('user');
      if (existingUser && JSON.parse(existingUser).email === email) {
        return { success: false, message: 'Email này đã được sử dụng' };
      }
      
      const newUser = {
        id: `member-${Date.now()}`,
        email,
        username: email.split('@')[0],
        fullName: displayName,
        role: 'member',
        avatar: null,
        joinDate: new Date().toISOString().split('T')[0]
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { success: true, user: newUser };
      
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Có lỗi xảy ra khi đăng ký' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('adminUser'); // Clear admin session if exists
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const isMember = () => {
    return user && user.role === 'member';
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAdmin,
    isMember
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthProvider;
