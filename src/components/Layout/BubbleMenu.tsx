import React, { useState } from 'react';
import { 
  Settings, 
  MessageSquare, 
  Code, 
  Image, 
  HelpCircle,
  Menu
} from 'react-feather'; // We'll need to install react-feather

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  action: () => void;
}

const BubbleMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems: MenuItem[] = [
    {
      icon: <MessageSquare size={20} />,
      label: 'Chat',
      action: () => console.log('Chat clicked'),
    },
    {
      icon: <Code size={20} />,
      label: 'Code',
      action: () => console.log('Code clicked'),
    },
    {
      icon: <Image size={20} />,
      label: 'Image',
      action: () => console.log('Image clicked'),
    },
    {
      icon: <Settings size={20} />,
      label: 'Settings',
      action: () => console.log('Settings clicked'),
    },
    {
      icon: <HelpCircle size={20} />,
      label: 'Help',
      action: () => console.log('Help clicked'),
    },
  ];

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50">
      <div className="relative">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Menu Items */}
        <div className={`absolute left-12 top-1/2 -translate-y-1/2 space-y-2 transition-all duration-200 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}>
          {menuItems.map((item, index) => (
            <div key={index} className="group relative">
              <button
                onClick={item.action}
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
              >
                {item.icon}
              </button>
              
              {/* Tooltip */}
              <div className="absolute left-12 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BubbleMenu; 