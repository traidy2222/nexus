import React, { useState } from 'react';
import { 
  Settings, 
  MessageSquare, 
  Code, 
  Image, 
  HelpCircle,
  Plus
} from 'react-feather';
import SettingsModal from '../Modals/SettingsModal';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  action: () => void;
}

const VerticalNav: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      icon: <Plus size={20} />,
      label: 'New Chat',
      action: () => console.log('New Chat clicked'),
    },
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
      action: () => setIsSettingsOpen(true),
    },
    {
      icon: <HelpCircle size={20} />,
      label: 'Help',
      action: () => console.log('Help clicked'),
    },
  ];

  return (
    <>
      <nav className="w-16 bg-[#1E1E1E] border-r border-gray-700 flex flex-col items-center py-4">
        {navItems.map((item, index) => (
          <div key={index} className="group relative mb-4">
            <button
              onClick={item.action}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              {item.icon}
            </button>
            
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
              {item.label}
            </div>
          </div>
        ))}
      </nav>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};

export default VerticalNav; 