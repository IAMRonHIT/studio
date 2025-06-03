
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string | null; // Allow null for initial client-side rendering
  toolSuggestion?: string;
  reasoning?: string;
  codeCompletion?: string;
}

export type ActiveView = 'browser' | 'develop' | 'tools';
