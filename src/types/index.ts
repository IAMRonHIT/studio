
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  toolSuggestion?: string;
  reasoning?: string;
  codeCompletion?: string;
}

export type ActiveView = 'browser' | 'develop' | 'tools';
