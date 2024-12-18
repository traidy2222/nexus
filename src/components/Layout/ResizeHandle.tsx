import React from 'react';

interface ResizeHandleProps {
  onResize: (movementX: number) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ onResize }) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    document.body.style.cursor = 'col-resize';
    
    const handleMouseMove = (e: MouseEvent) => {
      onResize(e.movementX);
    };
    
    const handleMouseUp = () => {
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className="w-1 hover:w-2 bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-all"
      onMouseDown={handleMouseDown}
    />
  );
};

export default ResizeHandle; 