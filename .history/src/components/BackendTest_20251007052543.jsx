import { useState, useEffect } from 'react';
import { healthApi, authApi } from '../services/backendApi';

const BackendTest = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    try {
      // Test health check
      const healthResponse = await healthApi.getHealth();
      setHealthStatus(healthResponse);

      // Test auth endpoint
      try {
        const authResponse = await authApi.getCurrentUser();
        setAuthStatus({ success: true, message: 'Auth endpoint accessible' });
      } catch (error) {
        setAuthStatus({ 
          success: false, 
          message: 'Auth endpoint accessible but requires authentication' 
        });
      }
    } catch (error) {
      setHealthStatus({ 
        success: false, 
        message: 'Backend connection failed', 
        error: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const testUserRegistration = async () => {
    setLoading(true);
    try {
      const testUser = {
        email: `test${Date.now()}@example.com`,
        password: 'Test123456',
        username: `testuser${Date.now()}`,
        fullName: 'Test User'
      };

      const response = await authApi.register(testUser);
      setAuthStatus({ 
        success: true, 
        message: 'User registration successful', 
        data: response 
      });
    } catch (error) {
      setAuthStatus({ 
        success: false, 
        message: 'User registration failed', 
        error: error.response?.data?.message || error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testBackendConnection();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Backend Connection Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Health Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Health Check</h3>
          {healthStatus ? (
            <div className={`p-4 rounded-lg ${
              healthStatus.success ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
            }`}>
              <div className="flex items-center mb-2">
                <span className={`w-3 h-3 rounded-full mr-2 ${
                  healthStatus.success ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                <span className="font-medium">
                  {healthStatus.success ? 'Connected' : 'Failed'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {healthStatus.message}
              </p>
              {healthStatus.timestamp && (
                <p className="text-xs text-gray-500 mt-2">
                  Timestamp: {new Date(healthStatus.timestamp).toLocaleString()}
                </p>
              )}
              {healthStatus.error && (
                <p className="text-xs text-red-600 mt-2">
                  Error: {healthStatus.error}
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-600 dark:text-gray-300">Testing connection...</p>
            </div>
          )}
        </div>

        {/* Auth Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Authentication Test</h3>
          {authStatus ? (
            <div className={`p-4 rounded-lg ${
              authStatus.success ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
            }`}>
              <div className="flex items-center mb-2">
                <span className={`w-3 h-3 rounded-full mr-2 ${
                  authStatus.success ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                <span className="font-medium">
                  {authStatus.success ? 'Working' : 'Failed'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {authStatus.message}
              </p>
              {authStatus.error && (
                <p className="text-xs text-red-600 mt-2">
                  Error: {authStatus.error}
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-600 dark:text-gray-300">Testing authentication...</p>
            </div>
          )}
        </div>
      </div>

      {/* Test Buttons */}
      <div className="mt-6 flex justify-center space-x-4">
        <button
          onClick={testBackendConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
        
        <button
          onClick={testUserRegistration}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Registration'}
        </button>
      </div>

      {/* Backend Info */}
      <div className="mt-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Backend Information</h4>
        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <p><strong>Backend URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}</p>
          <p><strong>Frontend URL:</strong> {window.location.origin}</p>
          <p><strong>Environment:</strong> {import.meta.env.VITE_APP_ENV || 'development'}</p>
        </div>
      </div>
    </div>
  );
};

export default BackendTest;
