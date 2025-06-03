
"use client";

import { useState, useRef, useEffect } from 'react';
import type { ChatMessage, ActiveView } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { ChatMessageItem } from './ChatMessageItem';
import { suggestTool, type SuggestToolInput } from '@/ai/flows/ai-tool-selector';
import { aiCodeCompletion, type AiCodeCompletionInput } from '@/ai/flows/ai-code-completion';

const initialMessageBase: Omit<ChatMessage, 'timestamp'> & { timestamp: string | null } = {
  id: '0',
  text: 'Hello! How can I help you with Ron AI tools today?',
  sender: 'ai',
  timestamp: null, 
};

export function AiChatPanel({ activeView }: { activeView: ActiveView | null }) { // Allow activeView to be null
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessageBase]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === '0' && msg.timestamp === null
          ? { ...msg, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          : msg
      )
    );
  }, []); 

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const newUserMessage: ChatMessage = {
      id: String(Date.now()), 
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    let aiResponse: ChatMessage | null = null;
    const aiMessageId = String(Date.now() + 1); 

    try {
      // Prioritize code completion if the 'develop' panel is active and query suggests coding
      if (activeView === 'develop' && (input.toLowerCase().includes('code') || input.toLowerCase().includes('write') || input.toLowerCase().includes('function') || input.toLowerCase().includes('implement'))) {
        const completionInput: AiCodeCompletionInput = {
          codeSnippet: "/* Current editor content could be passed here if integrated */\nconsole.log('Hello');", // Placeholder
          programmingLanguage: "javascript", // Placeholder
          cursorPosition: 0, // Placeholder
        };
        const result = await aiCodeCompletion({ ...completionInput, codeSnippet: `// User wants: ${input}\n`});
        aiResponse = {
          id: aiMessageId,
          text: `Here's some code based on your request:`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          codeCompletion: result.completedCode,
        };
      } else { // Otherwise, default to tool suggestion
        const toolInput: SuggestToolInput = { prompt: input };
        const result = await suggestTool(toolInput);
        aiResponse = {
          id: aiMessageId,
          text: `Based on your request, I have a suggestion for the '${result.toolSuggestion}' tool.`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          toolSuggestion: result.toolSuggestion,
          reasoning: result.reasoning,
        };
      }
    } catch (error) {
      console.error("AI flow error:", error);
      aiResponse = {
        id: aiMessageId,
        text: "Sorry, I encountered an error trying to process your request.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }
    
    if (aiResponse) {
       setMessages((prev) => [...prev, aiResponse!]);
    }
    setIsLoading(false);
  };


  return (
    <div className="flex flex-col h-full bg-background border-l border-border shadow-lg">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground">AI Chat</h2>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessageItem key={msg.id} message={msg} />
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border space-y-2">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Want to change anything? Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            className="flex-1 bg-input focus:ring-primary"
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center px-2">
          AI responses are generated by Project Mariner and may sometimes be inaccurate or incomplete. Please verify important information.
        </p>
      </div>
    </div>
  );
}
