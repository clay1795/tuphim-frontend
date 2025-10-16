import { useState } from 'react';
import PropTypes from 'prop-types';

const MovieTooltip = ({ children, content }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative flex items-center">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && (
        <div className="absolute z-10 px-3 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg shadow-sm top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap">
          {content}
          <div className="absolute text-gray-700 text-base -top-1 left-1/2 -translate-x-1/2">
            ▲
          </div>
        </div>
      )}
    </div>
  );
};

MovieTooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.string.isRequired,
};

export default MovieTooltip;
