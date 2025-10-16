import React, { useState, useEffect } from 'react';

const MovieAnimation = ({ children, delay = 0.1, duration = 0.5 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const animationStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`
  };

  return (
    <div style={animationStyle}>
      {children}
    </div>
  );
};

export default MovieAnimation;
