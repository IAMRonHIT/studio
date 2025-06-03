
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string | null; // Allow null for initial client-side rendering
  toolSuggestion?: string;
  reasoning?: string;
  // codeCompletion?: string; // This was removed from display, but might still be useful
  inputRequirements?: string;
  outputData?: string;
  previewAction?: {
    code: string;
    targetPanel: ActiveView;
    targetDevelopTab: 'editor' | 'preview' | 'terminal';
  };
}

export type ActiveView = 'browser' | 'develop' | 'tools';

