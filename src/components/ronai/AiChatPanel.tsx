
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

const initialMessages: ChatMessage[] = [
  {
    id: '0',
    text: 'Hello! How can I help you with Ron AI tools today?',
    sender: 'ai',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

export function AiChatPanel({ activeView }: { activeView: ActiveView }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
      id: String(messages.length + 1),
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    let aiResponse: ChatMessage | null = null;

    try {
      if (activeView === 'develop' && (input.toLowerCase().includes('code') || input.toLowerCase().includes('write') || input.toLowerCase().includes('function'))) {
        const completionInput: AiCodeCompletionInput = {
          codeSnippet: "/* Current editor content could be passed here if integrated */\nconsole.log('Hello');",
          programmingLanguage: "javascript", // This could be dynamic
          cursorPosition: 0, // This could be dynamic
        };
        // For code completion, the prompt is in the input message itself.
        // We'll augment the AI flow to use the user's message as the primary driver for code generation.
        // The provided aiCodeCompletionFlow has a prompt template that takes codeSnippet, language, cursorPosition.
        // We'll make the user input the 'codeSnippet' effectively for a chat-based completion.
        const result = await aiCodeCompletion({ ...completionInput, codeSnippet: `// User wants: ${input}\n`});
        aiResponse = {
          id: String(messages.length + 2),
          text: `Here's some code based on your request:`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          codeCompletion: result.completedCode,
        };
      } else {
        const toolInput: SuggestToolInput = { prompt: input };
        const result = await suggestTool(toolInput);
        aiResponse = {
          id: String(messages.length + 2),
          text: `Based on your request, I have a suggestion.`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          toolSuggestion: result.toolSuggestion,
          reasoning: result.reasoning,
        };
      }
    } catch (error) {
      console.error("AI flow error:", error);
      aiResponse = {
        id: String(messages.length + 2),
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
