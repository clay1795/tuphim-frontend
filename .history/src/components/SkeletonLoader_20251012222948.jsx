const SkeletonLoader = ({ count = 8, className = "", type = "grid" }) => {
  // Simple spinning circle loader
  return (
    <div className={`flex justify-center items-center py-12 ${className}`}>
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
