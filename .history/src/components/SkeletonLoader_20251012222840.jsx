const SkeletonLoader = ({ count = 8, className = "", type = "grid" }) => {
  if (type === "grid") {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 ${className}`}>
        {Array.from({ length: count }).map((_, index) => (
          <div 
            key={index} 
            className="animate-pulse-float"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105">
              {/* Poster skeleton with shimmer effect */}
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
                <div className="absolute inset-0 bg-gray-800 opacity-80"></div>
              </div>
              
              {/* Content skeleton */}
              <div className="p-4 space-y-3">
                {/* Title skeleton */}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded-full animate-pulse-shimmer w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded-full animate-pulse-shimmer w-1/2"></div>
                </div>
                
                {/* Year and rating skeleton */}
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-gray-700 rounded-full animate-pulse-shimmer w-1/4"></div>
                  <div className="flex items-center space-x-1">
                    <div className="h-3 w-3 bg-gray-700 rounded-full animate-pulse-shimmer"></div>
                    <div className="h-3 bg-gray-700 rounded-full animate-pulse-shimmer w-8"></div>
                  </div>
                </div>
                
                {/* Quality badge skeleton */}
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-gray-700 rounded-full animate-pulse-shimmer w-12"></div>
                  <div className="h-5 bg-gray-700 rounded-full animate-pulse-shimmer w-16"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Single skeleton card
  return (
    <div 
      className={`animate-pulse-float ${className}`}
      style={{ animationDelay: `${Math.random() * 500}ms` }}
    >
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg">
        {/* Poster skeleton with shimmer effect */}
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer"></div>
          <div className="absolute inset-0 bg-gray-800 opacity-80"></div>
        </div>
        
        {/* Content skeleton */}
        <div className="p-4 space-y-3">
          {/* Title skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded-full animate-pulse-shimmer w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded-full animate-pulse-shimmer w-1/2"></div>
          </div>
          
          {/* Year and rating skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-3 bg-gray-700 rounded-full animate-pulse-shimmer w-1/4"></div>
            <div className="flex items-center space-x-1">
              <div className="h-3 w-3 bg-gray-700 rounded-full animate-pulse-shimmer"></div>
              <div className="h-3 bg-gray-700 rounded-full animate-pulse-shimmer w-8"></div>
            </div>
          </div>
          
          {/* Quality badge skeleton */}
          <div className="flex justify-between items-center">
            <div className="h-5 bg-gray-700 rounded-full animate-pulse-shimmer w-12"></div>
            <div className="h-5 bg-gray-700 rounded-full animate-pulse-shimmer w-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
