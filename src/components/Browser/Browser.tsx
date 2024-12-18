import React from 'react';

const Browser: React.FC = () => {
  return (
    <div className="h-full w-full bg-[#1E1E1E] text-gray-300 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 flex-1 bg-[#2D2D2D] rounded px-4 flex items-center">
          https://cursor.sh
        </div>
      </div>
      <div className="flex-1">
        {/* Browser content will go here */}
        <div className="text-center text-gray-500 mt-8">
          Browser component placeholder
        </div>
      </div>
    </div>
  );
};

export default Browser; 