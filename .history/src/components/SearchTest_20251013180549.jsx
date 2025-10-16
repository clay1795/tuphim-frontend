import { useState } from "react";
import { Link } from "react-router-dom";

const SearchTest = () => {
  const [searchKeyword, setSearchKeyword] = useState("đấm");

  const testKeywords = [
    "đấm",
    "one punch man", 
    "attack on titan",
    "demon slayer",
    "naruto"
  ];

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Search Test Page</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Test Search Keywords</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {testKeywords.map((keyword) => (
              <button
                key={keyword}
                onClick={() => setSearchKeyword(keyword)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  searchKeyword === keyword
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {keyword}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Nhập từ khóa tìm kiếm..."
            />
            
            <Link
              to={`/duyet-tim?keyword=${encodeURIComponent(searchKeyword)}`}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Tìm Kiếm
            </Link>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Hướng Dẫn Test</h3>
          <div className="space-y-3 text-gray-300">
            <p>1. Click vào từ khóa hoặc nhập từ khóa tìm kiếm</p>
            <p>2. Click nút "Tìm Kiếm" để chuyển đến trang kết quả</p>
            <p>3. Trên trang kết quả, bạn sẽ thấy nút "Nhóm theo series" / "Hiển thị tất cả"</p>
            <p>4. Click nút này để chuyển đổi giữa 2 chế độ hiển thị</p>
            <p>5. Kiểm tra xem One Punch Man có được nhóm thành 1 phim không</p>
          </div>
          
          <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg">
            <h4 className="text-blue-400 font-semibold mb-2">🎯 Kết Quả Mong Đợi:</h4>
            <ul className="text-blue-300 space-y-1">
              <li>• <strong>Chế độ "Hiển thị tất cả":</strong> One Punch Man hiển thị 3 phim riêng biệt</li>
              <li>• <strong>Chế độ "Nhóm theo series":</strong> One Punch Man hiển thị 1 phim với badge "3 Phần"</li>
              <li>• Click vào phim series sẽ thấy tất cả các phần trong trang chi tiết</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchTest;
