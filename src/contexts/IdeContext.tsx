
"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useState, useMemo }
from 'react';

// NOTE: This default HTML is intentionally kept minimal for faster initial typing animation.
// The full GFR calculator HTML is provided by AiChatPanel during the demo.
const INITIAL_IDE_CODE_DEFAULT = `
<!DOCTYPE html>
<html>
<head>
    <title>IDE Preview</title>
</head>
<body>
    <h1>Welcome to the IDE</h1>
    <p>Code from AI will appear here.</p>
</body>
</html>
`;


interface IdeContextType {
  ideCode: string;
  setIdeCode: Dispatch<SetStateAction<string>>;
  activeDevelopTab: 'editor' | 'preview' | 'terminal';
  setActiveDevelopTab: Dispatch<SetStateAction<'editor' | 'preview' | 'terminal'>>;
  // Flag to indicate if the code update is from an external source (like AI) vs. user typing in IDE
  isExternalUpdate: boolean;
  setIsExternalUpdate: Dispatch<SetStateAction<boolean>>;
}

const IdeContext = createContext<IdeContextType | undefined>(undefined);

export function IdeProvider({ children }: { children: ReactNode }) {
  const [ideCode, setIdeCode] = useState<string>(INITIAL_IDE_CODE_DEFAULT);
  const [activeDevelopTab, setActiveDevelopTab] = useState<'editor' | 'preview' | 'terminal'>('editor');
  const [isExternalUpdate, setIsExternalUpdate] = useState<boolean>(true); // Initially true for default code

  const contextValue = useMemo(() => ({
    ideCode,
    setIdeCode,
    activeDevelopTab,
    setActiveDevelopTab,
    isExternalUpdate,
    setIsExternalUpdate,
  }), [ideCode, activeDevelopTab, isExternalUpdate]);

  return (
    <IdeContext.Provider value={contextValue}>
      {children}
    </IdeContext.Provider>
  );
}

export function useIdeContext() {
  const context = useContext(IdeContext);
  if (context === undefined) {
    throw new Error('useIdeContext must be used within an IdeProvider');
  }
  return context;
}
