import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextSimple';

const UserHistoryTest = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('UserHistoryTest - user:', user);
    console.log('UserHistoryTest - loading:', loading);
  }, [user, loading]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-400">Bạn cần đăng nhập để xem lịch sử xem</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Xem tiếp (Test)</h1>
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Debug Info:</h2>
        <p><strong>User:</strong> {user.email}</p>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>Error:</strong> {error || 'None'}</p>
        <p><strong>Component:</strong> UserHistoryTest loaded successfully</p>
      </div>
    </div>
  );
};

export default UserHistoryTest;
