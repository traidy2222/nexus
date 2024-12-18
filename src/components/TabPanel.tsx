import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Globe, Book, Terminal } from 'react-feather';
import JupyterNotebook from './Jupyter/JupyterNotebook';
import Browser from './Browser/Browser';
import { useTerminal } from '../contexts/TerminalContext';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const TabPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('browser');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const { logs } = useTerminal();
  const terminalRef = useRef<HTMLDivElement>(null);
  
  const tabs: Tab[] = [
    { id: 'browser', label: 'Web Browser', icon: <Globe size={16} /> },
    { id: 'jupyter', label: 'Jupyter Notebook', icon: <Book size={16} /> },
  ];

  // Auto-scroll terminal to bottom when new logs are added
  useEffect(() => {
    if (terminalRef.current && isTerminalOpen) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, isTerminalOpen]);

  return (
    <div className="h-full flex flex-col">
      {/* Tab Header */}
      <div className="h-12 bg-[#2D2D2D] border-b border-gray-700 flex items-center px-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 h-12 flex items-center justify-center gap-2 border-b-2 ${
              activeTab === tab.id
                ? 'text-blue-400 border-blue-400'
                : 'text-gray-400 border-transparent'
            } hover:text-blue-300 transition-colors`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Tab Content */}
        <div className="flex-1 overflow-auto min-h-0">
          {activeTab === 'browser' && <Browser />}
          {activeTab === 'jupyter' && <JupyterNotebook />}
        </div>

        {/* Terminal */}
        <div className="bg-[#1E1E1E] border-t border-gray-700">
          {/* Terminal Header */}
          <div 
            className="flex items-center justify-between px-4 py-2 bg-[#2D2D2D] border-b border-gray-700 cursor-pointer"
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
          >
            <div className="flex items-center gap-2 text-gray-300">
              <Terminal size={16} />
              <span>Terminal</span>
            </div>
            {isTerminalOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </div>

          {/* Terminal Content */}
          <div 
            ref={terminalRef}
            className={`transition-all duration-200 overflow-auto ${
              isTerminalOpen ? 'h-40' : 'h-0'
            }`}
          >
            <div className="p-4 font-mono text-sm text-gray-300">
              {logs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabPanel; 