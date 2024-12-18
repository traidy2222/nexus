import React from 'react';
import { HelpCircle } from 'react-feather';

const KeyboardHelp: React.FC = () => {
  const shortcuts = [
    { keys: ['Ctrl/⌘', 'Enter'], description: 'Execute cell' },
    { keys: ['Shift', 'Enter'], description: 'Execute cell and create new one' },
    { keys: ['Ctrl/⌘', 'M'], description: 'Toggle markdown/code' },
    { keys: ['Ctrl/⌘', '↑/↓'], description: 'Move cell up/down' },
    { keys: ['Ctrl/⌘', 'D'], description: 'Delete cell' },
  ];

  return (
    <div className="relative group">
      <button className="p-2 text-gray-400 hover:text-white">
        <HelpCircle size={16} />
      </button>
      <div className="absolute right-0 top-full mt-2 bg-gray-800 rounded-lg shadow-lg p-4 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <h3 className="text-white font-semibold mb-2">Keyboard Shortcuts</h3>
        <div className="space-y-2">
          {shortcuts.map(({ keys, description }) => (
            <div key={description} className="flex justify-between text-sm">
              <div className="flex gap-1">
                {keys.map(key => (
                  <kbd key={key} className="px-2 py-1 bg-gray-700 rounded text-white">
                    {key}
                  </kbd>
                ))}
              </div>
              <span className="text-gray-300">{description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KeyboardHelp; 