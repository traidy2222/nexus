import React, { createContext, useContext, useState, useEffect } from 'react';
import { Settings, LLMServer } from '../types/settings';

const defaultSettings: Settings = {
  selectedServer: 'openai',
  servers: [
    {
      id: 'openai',
      name: 'OpenAI',
      url: 'https://api.openai.com/v1',
      type: 'openai'
    },
    {
      id: 'lmstudio',
      name: 'LM Studio',
      url: 'http://localhost:1234/v1',
      type: 'lmstudio'
    }
  ],
  theme: 'dark'
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Settings) => void;
  addServer: (server: Omit<LLMServer, 'id'>) => void;
  removeServer: (id: string) => void;
  updateServer: (id: string, updates: Partial<LLMServer>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load settings from localStorage only on client side
  useEffect(() => {
    const saved = localStorage.getItem('chatSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
    setIsInitialized(true);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('chatSettings', JSON.stringify(settings));
    }
  }, [settings, isInitialized]);

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
  };

  const addServer = (server: Omit<LLMServer, 'id'>) => {
    setSettings(prev => ({
      ...prev,
      servers: [...prev.servers, { ...server, id: crypto.randomUUID() }]
    }));
  };

  const removeServer = (id: string) => {
    setSettings(prev => ({
      ...prev,
      servers: prev.servers.filter(server => server.id !== id)
    }));
  };

  const updateServer = (id: string, updates: Partial<LLMServer>) => {
    setSettings(prev => ({
      ...prev,
      servers: prev.servers.map(server => 
        server.id === id ? { ...server, ...updates } : server
      )
    }));
  };

  // Don't render children until we've initialized settings from localStorage
  if (!isInitialized) {
    return null;
  }

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      addServer, 
      removeServer, 
      updateServer 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 