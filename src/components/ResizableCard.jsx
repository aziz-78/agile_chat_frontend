import React, { useState, useRef } from 'react';

const ResizableCard = ({ 
  initialWidth = 300, 
  initialHeight = 200, 
  minWidth = 100, 
  minHeight = 100,
  maxWidth = 800,
  maxHeight = 600,
  children,
  className = ''
}) => {
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight
  });
  const cardRef = useRef(null);
  const resizingRef = useRef(false);
  
  const handleMouseDown = (e) => {
    // Only trigger resizing when clicking near the bottom-right corner
    const rect = cardRef.current.getBoundingClientRect();
    const cornerSize = 20; // Size of the "corner" area in pixels
    
    if (
      e.clientX > rect.right - cornerSize && 
      e.clientY > rect.bottom - cornerSize
    ) {
      resizingRef.current = true;
      e.preventDefault();
    }
  };
  
  const handleMouseMove = (e) => {
    if (!resizingRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const newWidth = Math.max(minWidth, Math.min(maxWidth, e.clientX - rect.left));
    const newHeight = Math.max(minHeight, Math.min(maxHeight, e.clientY - rect.top));
    
    setDimensions({
      width: newWidth,
      height: newHeight
    });
  };
  
  const handleMouseUp = () => {
    resizingRef.current = false;
  };
  
  React.useEffect(() => {
    // Add event listeners to document to handle mouse movements outside the card
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  
  return (
    <div
      ref={cardRef}
      className={`relative bg-white rounded-lg shadow-md overflow-hidden ${className}`}
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        cursor: resizingRef.current ? 'nwse-resize' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
      
      {/* Resize handle indicator */}
      <div 
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize" 
        style={{
          background: 'linear-gradient(135deg, transparent 50%, #cbd5e0 50%)'
        }}
      />
    </div>
  );
};

export default ResizableCard;