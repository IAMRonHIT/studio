
"use client";

import { useState, useRef, useEffect, useContext } from 'react';
import type { ChatMessage, ActiveView } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Paperclip, Volume2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChatMessageItem } from './ChatMessageItem';

import { runTriageAgent, type TriageAgentInput, type TriageAgentOutput } from '@/ai/agents/triageAgent';
import { performDeepResearch, type DeepResearchInput } from '@/ai/flows/deep-research-flow'; // Keep for now
import { useIdeContext } from '@/contexts/IdeContext';

const initialMessageBase: Omit<ChatMessage, 'timestamp'> & { timestamp: string | null } = {
  id: String(Date.now()) + '-initial-ai',
  text: 'Hello! How can I help you with Ron AI tools today?',
  sender: 'ai',
  timestamp: null,
};

type GfrDemoStage = 'none' | 'light_mode_shown' | 'dark_mode_explained';

interface AiChatPanelProps {
  activeView: ActiveView | null;
  onToolPreviewRequest: (action: NonNullable<ChatMessage['previewAction']>) => void;
}

export function AiChatPanel({ activeView, onToolPreviewRequest }: AiChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessageBase]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deepResearchEnabled, setDeepResearchEnabled] = useState(false);
  const [gfrDemoStage, setGfrDemoStage] = useState<GfrDemoStage>('none'); // Kept for GFR demo interaction
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { setIdeCode, setActiveDevelopTab, setIsExternalUpdate } = useIdeContext();


  useEffect(() => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === initialMessageBase.id && msg.timestamp === null
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
      id: String(Date.now()) + '-user',
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    let aiResponse: ChatMessage | null = null;
    const aiMessageId = String(Date.now() + 1) + '-ai';

    // GFR Demo specific interactions (before general triage for these exact phrases)
    if (currentInput.toLowerCase().includes('gfr calculator') && gfrDemoStage === 'none') {
        // This will now be handled by the triageAgent directly if this exact phrase is used
        // but keeping the stage logic for multi-turn demo flow.
    } else if (currentInput.toLowerCase().includes('add dark mode to this') && gfrDemoStage === 'light_mode_shown') {
      aiResponse = {
        id: aiMessageId,
        text: "Excellent! This GFR calculator code already includes a theme toggle for dark mode. If you were to click the theme toggle button (moon icon) in its top-right corner in the Develop panel's preview, it would switch to dark mode. The CSS variables automatically adjust all the colors.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolSuggestion: "GFR Calculator (Dark Mode via Toggle)",
        reasoning: "The existing code in the Develop panel supports dark mode. Interact with the preview to see it."
      };
      setGfrDemoStage('dark_mode_explained');
    } else if (currentInput.includes('😍') && gfrDemoStage === 'dark_mode_explained') {
      aiResponse = {
        id: aiMessageId,
        text: "Glad you like it! Let me know if there's anything else I can assist with. The code is still available in the Develop panel if you'd like to make further changes.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setGfrDemoStage('none'); 
    }


    if (!aiResponse) { // If not handled by GFR demo specific turns
        if (gfrDemoStage !== 'none' && !currentInput.toLowerCase().includes('gfr calculator')) {
            setGfrDemoStage('none'); // Reset GFR demo stage if user moves on
        }
      try {
        if (deepResearchEnabled) {
          const researchInput: DeepResearchInput = { query: currentInput };
          const researchResult = await performDeepResearch(researchInput);
          
          let formattedResearchText = `**Research Summary for "${currentInput}"**\n\n**Summary:**\n${researchResult.summary}\n\n`;
          if (researchResult.keyPoints && researchResult.keyPoints.length > 0) {
            formattedResearchText += `**Key Points:**\n${researchResult.keyPoints.map(p => `- ${p}`).join('\n')}\n\n`;
          }
          if (researchResult.sources && researchResult.sources.length > 0) {
            formattedResearchText += `**Potential Sources (AI Generated - Verify Accuracy):**\n${researchResult.sources.map(s => `- ${s.title}${s.url ? ` (${s.url})` : ''}`).join('\n')}`;
          } else {
            formattedResearchText += "**Sources:**\nNo specific sources were cited by the AI for this research.";
          }

          aiResponse = {
            id: aiMessageId,
            text: formattedResearchText,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        } else {
          const triageInput: TriageAgentInput = { prompt: currentInput };
          const triageResult: TriageAgentOutput = await runTriageAgent(triageInput);

          aiResponse = {
            id: aiMessageId,
            text: triageResult.text,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            toolSuggestion: triageResult.toolSuggestion,
            reasoning: triageResult.reasoning,
            inputRequirements: triageResult.inputRequirements,
            outputData: triageResult.outputData,
            previewAction: triageResult.previewAction ? {
                code: triageResult.previewAction.code,
                targetPanel: triageResult.previewAction.targetPanel as ActiveView,
                targetDevelopTab: triageResult.previewAction.targetDevelopTab as 'editor' | 'preview' | 'terminal',
            } : undefined,
          };

          if (triageResult.generatedCode) {
            setIsExternalUpdate(true); 
            setIdeCode(triageResult.generatedCode); 
            setActiveDevelopTab('preview'); // Switch to preview for non-technical users
          }
          
          // Handle GFR demo stage based on triage agent output
          if (triageResult.toolSuggestion === "GFR Calculator" && triageResult.previewAction) {
            setGfrDemoStage('light_mode_shown');
          }
        }
      } catch (error) {
        console.error("AI agent/flow error:", error);
        aiResponse = {
          id: aiMessageId,
          text: "Sorry, I encountered an error trying to process your request.",
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
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
            <ChatMessageItem key={msg.id} message={msg} onToolPreviewRequest={onToolPreviewRequest} />
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-center justify-start space-x-2 mb-2">
          <Switch
            id="deep-research"
            checked={deepResearchEnabled}
            onCheckedChange={setDeepResearchEnabled}
            disabled={isLoading}
            className="
              data-[state=checked]:bg-primary
              data-[state=unchecked]:bg-input
              data-[state=unchecked]:[&>span]:bg-primary 
              data-[state=checked]:[&>span]:bg-black 
            "
          />
          <Label htmlFor="deep-research" className="text-sm text-muted-foreground select-none">
            Deep Research
          </Label>
        </div>

        <div className="flex items-center space-x-2">
           <Button
            variant="outline"
            size="icon"
            title="Attach file"
            className="bg-white text-[hsl(250_70%_25%)] border-[hsl(250_70%_25%)] hover:bg-[hsl(250_70%_25%)]/10 hover:text-[hsl(250_70%_25%)]"
            disabled={isLoading}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            title="Text-to-Speech"
            className="bg-white text-[hsl(250_70%_25%)] border-[hsl(250_70%_25%)] hover:bg-[hsl(250_70%_25%)]/10 hover:text-[hsl(250_70%_25%)]"
            disabled={isLoading}
          >
            <Volume2 className="h-5 w-5" />
          </Button>
          <Input
            type="text"
            placeholder="Want to change anything? Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            className="flex-1 bg-input focus:ring-primary"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading}
            className="bg-gradient-to-b from-[hsl(250_70%_25%)] to-[hsl(var(--primary))] hover:from-[hsl(250_70%_25%)] hover:to-[hsl(var(--primary)/0.9)] text-primary-foreground"
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center px-2 pt-1">
          AI responses are generated by Project Mariner and may sometimes be inaccurate or incomplete. Please verify important information.
        </p>
      </div>
    </div>
  );
}
