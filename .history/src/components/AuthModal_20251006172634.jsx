import { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [authForm, setAuthForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Reset form when modal opens/closes and handle animation
  useEffect(() => {
    if (isOpen) {
      setAuthForm({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setAuthError('');
      // Start animation after scroll lock is applied
      setTimeout(() => setIsAnimating(true), 50);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Restore scroll position on unmount
      const scrollY = document.body.getAttribute('data-scroll-y');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY));
      }
      
      document.body.removeAttribute('data-scroll-y');
    };
  }, []);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setAuthForm({
      displayName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setAuthError('');
  };

  const handleAuthFormChange = (e) => {
    setAuthForm({
      ...authForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (isLogin) {
        // Handle login
        const result = await login({
          email: authForm.email,
          password: authForm.password
        });

        if (result.success) {
          onClose();
          
          // Redirect admin to admin panel
          if (result.redirectTo) {
            navigate(result.redirectTo);
          }
        } else {
          setAuthError(result.message);
        }
      } else {
        // Handle registration
        if (authForm.password !== authForm.confirmPassword) {
          setAuthError('Mật khẩu xác nhận không khớp');
          setAuthLoading(false);
          return;
        }

        const result = await register({
          email: authForm.email,
          password: authForm.password,
          displayName: authForm.displayName
        });

        if (result.success) {
          onClose();
        } else {
          setAuthError(result.message);
        }
      }
    } catch (error) {
      setAuthError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setAuthLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Full screen coverage with fade animation */}
      <div 
        className={`fixed inset-0 bg-black/60 modal-backdrop z-[99998] ${
          isOpen && isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          transition: 'opacity 0.3s ease-out'
        }}
      ></div>
      
      {/* Modal Container */}
      <div 
        className="fixed z-[99999]"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          pointerEvents: 'none'
        }}
      >
        {/* Modal Content with slide-down animation */}
        <div 
          className={`relative bg-gray-900 rounded-lg shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto transform ${
            isOpen && isAnimating 
              ? 'translate-y-0 opacity-100 scale-100' 
              : '-translate-y-4 opacity-0 scale-98'
          }`}
          style={{
            position: 'relative',
            zIndex: 1,
            pointerEvents: 'auto',
            transformOrigin: 'center top',
            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          }}
        >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 text-white hover:text-gray-300 transition-all duration-200 z-10 hover:scale-110 transform ${
            isAnimating ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className={`p-6 pb-4 transition-all duration-300 delay-100 ${
          isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isLogin ? 'Đăng nhập' : 'Tạo tài khoản mới'}
          </h2>
          <p className="text-gray-300 text-sm">
            {isLogin ? (
              <>Nếu bạn chưa có tài khoản,{' '}
                <button 
                  onClick={toggleAuthMode}
                  className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200 hover:underline"
                >
                  đăng ký ngay
                </button>
              </>
            ) : (
              <>Nếu bạn đã có tài khoản,{' '}
                <button 
                  onClick={toggleAuthMode}
                  className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200 hover:underline"
                >
                  đăng nhập
                </button>
              </>
            )}
          </p>
        </div>

        {/* Modal Body */}
        <div className={`px-6 pb-6 transition-all duration-300 delay-150 ${
          isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          {/* Error Message */}
          {authError && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg text-sm animate-pulse">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {/* Display Name - chỉ hiển thị khi đăng ký */}
            {!isLogin && (
              <div className="animate-fadeInUp">
                <input
                  type="text"
                  name="displayName"
                  placeholder="Tên hiển thị"
                  value={authForm.displayName}
                  onChange={handleAuthFormChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 hover:border-gray-600 focus:scale-[1.02] transform"
                  required={!isLogin}
                />
              </div>
            )}

            {/* Email */}
            <div className="animate-fadeInUp">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={authForm.email}
                onChange={handleAuthFormChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 hover:border-gray-600 focus:scale-[1.02] transform"
                required
              />
            </div>

            {/* Password */}
            <div className="animate-fadeInUp">
              <input
                type="password"
                name="password"
                placeholder="Mật khẩu"
                value={authForm.password}
                onChange={handleAuthFormChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 hover:border-gray-600 focus:scale-[1.02] transform"
                required
              />
            </div>

            {/* Confirm Password - chỉ hiển thị khi đăng ký */}
            {!isLogin && (
              <div className="animate-fadeInUp">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  value={authForm.confirmPassword}
                  onChange={handleAuthFormChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 hover:border-gray-600 focus:scale-[1.02] transform"
                  required={!isLogin}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-all duration-200 hover:scale-[1.02] transform hover:shadow-lg hover:shadow-yellow-500/25 animate-fadeInUp"
            >
              {authLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>{isLogin ? 'Đang đăng nhập...' : 'Đang đăng ký...'}</span>
                </div>
              ) : (
                isLogin ? 'Đăng nhập' : 'Đăng ký'
              )}
            </button>

            {/* Forgot Password - chỉ hiển thị khi đăng nhập */}
            {isLogin && (
              <div className="text-center">
                <button 
                  type="button"
                  className="text-white hover:text-yellow-400 transition-colors duration-200 text-sm"
                >
                  Quên mật khẩu?
                </button>
              </div>
            )}

            {/* Demo Accounts */}
            {isLogin && (
              <div className="text-center space-y-2 animate-fadeInUp">
                <div className="text-xs text-gray-400">
                  Tài khoản demo:
                </div>
                <div className="text-xs text-gray-300 space-y-1">
                  <div><strong>Admin:</strong> admin@example.com / admin123</div>
                  <div><strong>Member:</strong> member@example.com / member123</div>
                </div>
              </div>
            )}

            {/* Google Login */}
            <button
              type="button"
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-[1.02] transform hover:shadow-lg animate-fadeInUp"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Đăng nhập bằng Google</span>
            </button>
          </form>
        </div>
      </div>
      </div>
    </>
  );
};

export default AuthModal;
