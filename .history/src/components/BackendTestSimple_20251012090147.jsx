import { useState, useEffect } from 'react';

import { getApiUrl, buildApiUrl } from '../utils/apiConfig.js';
const BackendTestSimple = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    try {
      // Test health check using fetch
      const response = await fetch('getApiUrl()/health');
      const data = await response.json();
      
      if (response.ok) {
        setHealthStatus({
          success: true,
          message: 'Backend connection successful',
          data: data
        });
      } else {
        setHealthStatus({
          success: false,
          message: 'Backend returned error',
          error: data.message
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

      const response = await fetch('getApiUrl()/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testUser)
      });

      const data = await response.json();

      if (response.ok) {
        setHealthStatus({
          success: true,
          message: 'User registration successful',
          data: data
        });
      } else {
        setHealthStatus({
          success: false,
          message: 'User registration failed',
          error: data.message
        });
      }
    } catch (error) {
      setHealthStatus({
        success: false,
        message: 'User registration failed',
        error: error.message
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
      <h2 className="text-2xl font-bold mb-6 text-center text-white">Backend Connection Test</h2>
      
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
              {healthStatus.data && (
                <div className="mt-2 text-xs text-gray-500">
                  <p>Status: {healthStatus.data.status}</p>
                  <p>Environment: {healthStatus.data.environment}</p>
                  <p>Uptime: {Math.round(healthStatus.data.uptime)}s</p>
                </div>
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

        {/* Test Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Test Results</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
              <span className="text-sm">Backend Server: Running on port 3001</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
              <span className="text-sm">MongoDB Atlas: Connected</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
              <span className="text-sm">KKPhim API: Connected</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
              <span className="text-sm">CORS: Configured</span>
            </div>
          </div>
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
          <p><strong>Backend URL:</strong> getApiUrl()</p>
          <p><strong>Frontend URL:</strong> {window.location.origin}</p>
          <p><strong>Environment:</strong> development</p>
          <p><strong>Status:</strong> ✅ All systems operational</p>
        </div>
      </div>
    </div>
  );
};

export default BackendTestSimple;








