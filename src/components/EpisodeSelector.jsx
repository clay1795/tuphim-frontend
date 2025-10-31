import { useState } from "react";
import PropTypes from 'prop-types';

// Episode Selector Component - Reusable for both VideoPlayer and MovieDetail
const EpisodeSelector = ({ 
  episodes, 
  currentEpisode, 
  currentServer, 
  onEpisodeChange, 
  maxVisible = 12,
  showAudioIndicators = true,
  className = ""
}) => {
  const [showAll, setShowAll] = useState(false);
  const totalEpisodes = episodes.length;
  
  // If episodes <= maxVisible, show all
  if (totalEpisodes <= maxVisible) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {episodes.map((episode, episodeIndex) => {
          const hasDub = showAudioIndicators && !!episode?.link_dub;
          return (
            <button
              key={episodeIndex}
              onClick={() => onEpisodeChange(currentServer, episodeIndex)}
              className={`px-3 py-1 rounded-full text-sm ring-1 ring-[#44475A] transition-colors relative ${
                currentEpisode === episodeIndex
                  ? "bg-[#FFC94A] text-black"
                  : "bg-[#272A3A] hover:bg-[#44475A]"
              }`}
              title={`Tập ${episodeIndex + 1}${hasDub ? " - Có thuyết minh" : " - Chỉ có phụ đề"}`}
            >
              {episodeIndex + 1}
              {hasDub && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FFC94A] rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // For many episodes, show smart pagination
  const getVisibleEpisodes = () => {
    if (showAll) {
      return episodes;
    }
    
    // Show current episode and surrounding episodes
    const start = Math.max(0, currentEpisode - Math.floor(maxVisible / 2));
    const end = Math.min(totalEpisodes, start + maxVisible);
    const actualStart = Math.max(0, end - maxVisible);
    
    return episodes.slice(actualStart, end).map((episode, index) => ({
      episode,
      originalIndex: actualStart + index
    }));
  };

  const visibleEpisodes = getVisibleEpisodes();

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Episode Grid */}
      <div className="flex flex-wrap gap-2">
        {!showAll && currentEpisode > Math.floor(maxVisible / 2) && (
          <button
            onClick={() => onEpisodeChange(currentServer, 0)}
            className="px-3 py-1 rounded-full text-sm ring-1 ring-[#44475A] bg-[#272A3A] hover:bg-[#44475A]"
          >
            « 1
          </button>
        )}
        
        {!showAll && currentEpisode > Math.floor(maxVisible / 2) + 1 && (
          <span className="px-2 py-1 text-[#F5F5F5]/60 text-sm">...</span>
        )}
        
        {visibleEpisodes.map((item, index) => {
          const episodeIndex = showAll ? index : item.originalIndex;
          const episode = showAll ? episodes[index] : item.episode;
          const isCurrent = currentEpisode === episodeIndex;
          const hasDub = showAudioIndicators && !!episode?.link_dub;
          
          return (
            <button
              key={episodeIndex}
              onClick={() => onEpisodeChange(currentServer, episodeIndex)}
              className={`px-3 py-1 rounded-full text-sm ring-1 ring-[#44475A] transition-colors relative ${
                isCurrent
                  ? "bg-[#FFC94A] text-black"
                  : "bg-[#272A3A] hover:bg-[#44475A]"
              }`}
              title={`Tập ${episodeIndex + 1}${hasDub ? " - Có thuyết minh" : " - Chỉ có phụ đề"}`}
            >
              {episodeIndex + 1}
              {hasDub && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FFC94A] rounded-full"></span>
              )}
            </button>
          );
        })}
        
        {!showAll && currentEpisode < totalEpisodes - Math.floor(maxVisible / 2) - 1 && (
          <span className="px-2 py-1 text-[#F5F5F5]/60 text-sm">...</span>
        )}
        
        {!showAll && currentEpisode < totalEpisodes - Math.floor(maxVisible / 2) && (
          <button
            onClick={() => onEpisodeChange(currentServer, totalEpisodes - 1)}
            className="px-3 py-1 rounded-full text-sm ring-1 ring-[#44475A] bg-[#272A3A] hover:bg-[#44475A]"
          >
            {totalEpisodes} »
          </button>
        )}
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="text-[#F5F5F5]/60 text-sm">
          Tập {currentEpisode + 1} / {totalEpisodes}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-3 py-1 rounded-full text-sm ring-1 ring-[#44475A] bg-[#272A3A] hover:bg-[#44475A] transition-colors"
          >
            {showAll ? "Thu gọn" : `Xem tất cả (${totalEpisodes})`}
          </button>
          {totalEpisodes > 20 && (
            <button
              onClick={() => {
                const randomEpisode = Math.floor(Math.random() * totalEpisodes);
                onEpisodeChange(currentServer, randomEpisode);
              }}
              className="px-3 py-1 rounded-full text-sm ring-1 ring-[#44475A] bg-[#272A3A] hover:bg-[#44475A] transition-colors"
              title="Tập ngẫu nhiên"
            >
              🎲 Ngẫu nhiên
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// PropTypes for EpisodeSelector
EpisodeSelector.propTypes = {
  episodes: PropTypes.array.isRequired,
  currentEpisode: PropTypes.number.isRequired,
  currentServer: PropTypes.number.isRequired,
  onEpisodeChange: PropTypes.func.isRequired,
  maxVisible: PropTypes.number,
  showAudioIndicators: PropTypes.bool,
  className: PropTypes.string
};

export default EpisodeSelector;
