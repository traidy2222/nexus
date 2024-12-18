import React, { useEffect, useState } from 'react';
import Chat from '../components/Chat';
import TabPanel from '../components/TabPanel';
import { CodeActAgent } from '../agents/CodeActAgent';
import { initializeLLM } from '../api/llm';
import { Settings, LLMServer } from '../types/settings';

const IndexPage = () => {
  const [agent, setAgent] = useState<CodeActAgent | null>(null);
  const [settings, setSettings] = useState<Settings>({
    selectedServer: 'lmstudio',
    servers: [
      { id: 'lmstudio', name: 'LM Studio', url: 'http://localhost:1234/v1', type: 'lmstudio' },
      { id: 'openai', name: 'OpenAI', url: 'https://api.openai.com/v1', type: 'openai' }
    ],
    theme: 'dark'
  });

  useEffect(() => {
    console.log('Initializing agent...');
    const llm = initializeLLM(settings);
    const newAgent = new CodeActAgent();
    newAgent.updateSettings(settings, llm);
    setAgent(newAgent);
  }, [settings.selectedServer]);

  const handleSettingsChange = (newSettings: Settings) => {
    setSettings(newSettings);
  };

  if (!agent) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen flex">
      {/* Left Panel - Chat */}
      <div className="w-1/2 border-r border-gray-700">
        <Chat
          agent={agent}
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />
      </div>

      {/* Right Panel - Browser/Jupyter */}
      <div className="w-1/2">
        <TabPanel />
      </div>
    </div>
  );
};

export default IndexPage; 