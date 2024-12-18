import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-[#1E1E1E] text-white h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-semibold">Chat Interface</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {/* Chat history list goes here */}
      </div>
      <div className="p-4 border-t border-gray-700">
        <button className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg">
          New Chat
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 