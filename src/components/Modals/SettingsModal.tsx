import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'react-feather';
import { useSettings } from '../../context/SettingsContext';
import { LLMServer } from '../../types/settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, addServer, removeServer, updateServer } = useSettings();
  const [newServer, setNewServer] = useState<Partial<LLMServer>>({
    name: '',
    url: '',
    type: 'custom'
  });

  const handleServerSelect = (serverId: string) => {
    updateSettings({
      ...settings,
      selectedServer: serverId
    });
  };

  if (!isOpen) return null;

  const handleAddServer = () => {
    if (newServer.name && newServer.url) {
      addServer(newServer as Omit<LLMServer, 'id'>);
      setNewServer({ name: '', url: '', type: 'custom' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#2D2D2D] rounded-lg w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Active Server Selection */}
          <div>
            <h3 className="text-white text-lg mb-2">Active Server</h3>
            <select 
              value={settings.selectedServer}
              onChange={(e) => handleServerSelect(e.target.value)}
              className="w-full bg-[#1E1E1E] text-white p-2 rounded border border-gray-700"
            >
              {settings.servers.map(server => (
                <option key={server.id} value={server.id}>
                  {server.name} ({server.type})
                </option>
              ))}
            </select>
          </div>

          {/* Server Management */}
          <div>
            <h3 className="text-white text-lg mb-4">LLM Servers</h3>
            
            {/* Server List */}
            <div className="space-y-4 mb-4">
              {settings.servers.map(server => (
                <div key={server.id} className="flex flex-col p-3 bg-[#1E1E1E] rounded">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={server.name}
                        onChange={(e) => updateServer(server.id, { name: e.target.value })}
                        className="bg-transparent text-white w-full mb-2"
                      />
                      <input
                        type="text"
                        value={server.url}
                        onChange={(e) => updateServer(server.id, { url: e.target.value })}
                        className="bg-transparent text-gray-400 w-full text-sm"
                      />
                    </div>
                    <select
                      value={server.type}
                      onChange={(e) => updateServer(server.id, { 
                        type: e.target.value as LLMServer['type']
                      })}
                      className="bg-[#2D2D2D] text-white p-2 rounded"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="lmstudio">LM Studio</option>
                      <option value="custom">Custom</option>
                    </select>
                    {server.type !== 'openai' && (
                      <button
                        onClick={() => removeServer(server.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                  
                  {/* API Key Input */}
                  <div className="mt-2">
                    <input
                      type="password"
                      placeholder="API Key (optional)"
                      value={server.apiKey || ''}
                      onChange={(e) => updateServer(server.id, { apiKey: e.target.value })}
                      className="w-full bg-[#2D2D2D] text-white p-2 rounded border border-gray-700"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Server */}
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Server Name"
                  value={newServer.name}
                  onChange={(e) => setNewServer(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#1E1E1E] text-white p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Server URL"
                  value={newServer.url}
                  onChange={(e) => setNewServer(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full bg-[#1E1E1E] text-white p-2 rounded"
                />
              </div>
              <button
                onClick={handleAddServer}
                className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Other settings... */}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white hover:bg-gray-700 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 