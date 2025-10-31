import PropTypes from 'prop-types';

// Audio Type Selector Component - Reusable for both VideoPlayer and MovieDetail
const AudioTypeSelector = ({ 
  audioType, 
  onAudioChange, 
  hasDubVersion = false,
  showInfo = true,
  className = ""
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="text-[#F5F5F5]/60 text-sm">Audio:</span>
        <div className="flex gap-2">
          <button
            onClick={() => onAudioChange("subtitle")}
            className={`px-3 py-1 rounded-full ring-1 text-xs transition-colors ${
              audioType === "subtitle" 
                ? "bg-[#FFC94A] text-black ring-[#FFC94A]" 
                : "bg-transparent ring-[#44475A] hover:bg-[#272A3A]"
            }`}
          >
            Phụ đề
          </button>
          {hasDubVersion && (
            <button
              onClick={() => onAudioChange("dub")}
              className={`px-3 py-1 rounded-full ring-1 text-xs transition-colors ${
                audioType === "dub" 
                  ? "bg-[#FFC94A] text-black ring-[#FFC94A]" 
                  : "bg-transparent ring-[#44475A] hover:bg-[#272A3A]"
              }`}
            >
              Thuyết minh
            </button>
          )}
        </div>
      </div>
      
      {showInfo && (
        <div className="flex items-center gap-2">
          <span className="text-[#F5F5F5]/40 text-xs">
            ({audioType === "subtitle" ? "Có phụ đề tiếng Việt" : "Lồng tiếng Việt"})
          </span>
          {hasDubVersion ? (
            <span className="text-[#FFC94A]/60 text-xs">
              ✓ Có thuyết minh
            </span>
          ) : (
            <span className="text-[#F5F5F5]/30 text-xs">
              • Chỉ có phụ đề
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// PropTypes for AudioTypeSelector
AudioTypeSelector.propTypes = {
  audioType: PropTypes.string.isRequired,
  onAudioChange: PropTypes.func.isRequired,
  hasDubVersion: PropTypes.bool,
  showInfo: PropTypes.bool,
  className: PropTypes.string
};

export default AudioTypeSelector;
