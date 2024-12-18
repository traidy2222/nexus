import React, { createContext, useContext, useState, useCallback } from 'react';

interface TerminalContextType {
  logs: string[];
  addLog: (log: string) => void;
  clearLogs: () => void;
}

const TerminalContext = createContext<TerminalContextType>({
  logs: [],
  addLog: () => {},
  clearLogs: () => {}
});

export const useTerminal = () => useContext(TerminalContext);

export const TerminalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<string[]>([
    '> Initializing connection...',
    '> Connected to LM Studio server'
  ]);

  const addLog = useCallback((log: string) => {
    setLogs(prev => [...prev, log]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return (
    <TerminalContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </TerminalContext.Provider>
  );
}; 