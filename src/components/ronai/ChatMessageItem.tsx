
"use client";

import type { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';
import { Bot, User, FileText, Eye, Download, Send as SendIcon, ThumbsDown, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect } from 'react';

type SuggestionStage = 'initial' | 'preview_shown' | 'critiquing' | 'dismissed';

interface ChatMessageItemProps {
  message: ChatMessage;
  onToolPreviewRequest: (action: NonNullable<ChatMessage['previewAction']>) => void;
}

export function ChatMessageItem({ message, onToolPreviewRequest }: ChatMessageItemProps) {
  const isUser = message.sender === 'user';
  const Icon = isUser ? User : Bot;
  const { toast } = useToast();
  const [critiqueText, setCritiqueText] = useState('');
  const [suggestionStage, setSuggestionStage] = useState<SuggestionStage>('initial');
  // Mock preview content within the card is no longer the primary mechanism
  // const [mockPreviewContent, setMockPreviewContent] = useState<string | null>(null);

  useEffect(() => {
    if (message.toolSuggestion) {
      setSuggestionStage('initial');
      // setMockPreviewContent(null);
    }
  }, [message.toolSuggestion]);

  const handleGeneratePreview = () => {
    if (message.previewAction && onToolPreviewRequest) {
      onToolPreviewRequest(message.previewAction);
      setSuggestionStage('dismissed'); // Assuming 'dismissed' means handled and card UI changes
    } else {
      toast({
        title: "Preview Action Unavailable",
        description: `No preview action defined for ${message.toolSuggestion}.`,
        variant: "destructive",
      });
    }
  };

  const handleNoThanks = () => {
    toast({
      title: "Suggestion Dismissed",
      description: `You've dismissed the suggestion for ${message.toolSuggestion}.`,
    });
    setSuggestionStage('dismissed');
  };

  const handleImplementLocally = () => {
    // This would ideally also use onToolPreviewRequest or a similar mechanism
    // if "implement locally" means loading into the IDE editor.
    if (message.previewAction && onToolPreviewRequest) {
        // Modify the action to target the editor
        const editorAction = {
            ...message.previewAction,
            targetDevelopTab: 'editor' as 'editor' | 'preview' | 'terminal'
        };
        onToolPreviewRequest(editorAction);
        toast({
          title: "Local Implementation",
          description: `${message.toolSuggestion} code has been loaded into the Develop panel editor.`,
        });
    } else {
        toast({
          title: "Local Implementation Failed",
          description: `Could not load ${message.toolSuggestion} into the editor.`,
           variant: "destructive",
        });
    }
    setSuggestionStage('dismissed'); 
  };

  const handleCritiqueOrSuggest = () => {
    setSuggestionStage('critiquing');
  };

  const handleSubmitCritique = () => {
    if (!critiqueText.trim()) {
      toast({
        title: "Critique Submission Failed",
        description: "Please enter your critique before submitting.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Critique Submitted",
      description: `Your critique for ${message.toolSuggestion}: "${critiqueText}" has been noted (mock action).`,
    });
    setCritiqueText('');
    setSuggestionStage('preview_shown'); // Or back to 'initial' if critique means re-evaluating
  };

  const renderToolSuggestionContent = () => {
    if (suggestionStage === 'dismissed' && message.previewAction) {
      // If dismissed because preview was generated, show a different message or hide actions.
      return <p className="text-xs text-foreground/70 p-2">Preview requested. Check the Develop panel.</p>;
    }
    if (suggestionStage === 'dismissed') {
       return <p className="text-xs text-foreground/70 p-2">Suggestion dismissed.</p>;
    }


    return (
      <>
        {/* Input/Output Requirements Display */}
        {message.inputRequirements && (
          <CardContent className="p-2 pt-1 text-xs border-t border-border/30 mt-2">
            <h5 className="text-xs font-semibold text-foreground/80 mb-0.5">Input Requirements:</h5>
            <pre className="text-xs text-foreground/70 whitespace-pre-wrap bg-black/10 dark:bg-black/20 p-1.5 rounded-sm overflow-x-auto">{message.inputRequirements}</pre>
          </CardContent>
        )}
        {message.outputData && (
          <CardContent className="p-2 pt-1 text-xs border-t border-border/30 mt-1.5">
            <h5 className="text-xs font-semibold text-foreground/80 mb-0.5">Output Data:</h5>
            <pre className="text-xs text-foreground/70 whitespace-pre-wrap bg-black/10 dark:bg-black/20 p-1.5 rounded-sm overflow-x-auto">{message.outputData}</pre>
          </CardContent>
        )}
        
        {/* Action Buttons Footer */}
        <CardFooter className="p-2 flex flex-col space-y-2.5 mt-2 border-t border-border/30">
          {suggestionStage === 'initial' && (
            <div className="flex space-x-2 w-full">
              <Button
                size="sm"
                className="flex-1 text-xs py-1 h-auto bg-gradient-to-b from-[hsl(250_70%_25%)] to-[hsl(var(--primary))] hover:from-[hsl(250_70%_25%)] hover:to-[hsl(var(--primary)/0.9)] text-primary-foreground"
                onClick={handleGeneratePreview}
                disabled={!message.previewAction} // Disable if no preview action defined
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                Generate Preview
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs py-1 h-auto border-muted-foreground/30 hover:bg-muted/20 text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
                onClick={handleNoThanks}
              >
                <ThumbsDown className="mr-1.5 h-3.5 w-3.5" />
                No Thanks
              </Button>
            </div>
          )}

          {(suggestionStage === 'preview_shown' || suggestionStage === 'critiquing') && (
            // 'preview_shown' state might be less relevant now if preview opens main panel
            // For now, keeping this flow if user somehow gets here (e.g., future non-panel preview)
            <div className="flex space-x-2 w-full">
              <Button
                size="sm"
                className="flex-1 text-xs py-1 h-auto bg-gradient-to-b from-[hsl(250_70%_25%)] to-[hsl(var(--primary))] hover:from-[hsl(250_70%_25%)] hover:to-[hsl(var(--primary)/0.9)] text-primary-foreground"
                onClick={handleImplementLocally}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Looks Good, Implement!
              </Button>
              {suggestionStage === 'preview_shown' && (
                 <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs py-1 h-auto border-primary/40 hover:bg-primary/10 text-primary/80 hover:text-primary hover:border-primary/70"
                    onClick={handleCritiqueOrSuggest}
                  >
                    <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                    Critique / Suggest
                  </Button>
              )}
            </div>
          )}

          {suggestionStage === 'critiquing' && (
            <div className="w-full space-y-1.5 pt-2 border-t border-border/30">
              <Textarea
                placeholder="Add critique or suggestions for the AI..."
                className="text-xs bg-background/50 dark:bg-black/40 border-border/70 focus:ring-primary p-1.5 min-h-[40px]"
                rows={2}
                value={critiqueText}
                onChange={(e) => setCritiqueText(e.target.value)}
              />
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs py-1 h-auto border-primary/40 hover:bg-primary/10 text-primary/80 hover:text-primary hover:border-primary/70"
                onClick={handleSubmitCritique}
              >
                <SendIcon className="mr-1.5 h-3.5 w-3.5" />
                Submit Critique
              </Button>
            </div>
          )}
        </CardFooter>
      </>
    );
  };

  return (
    <div className={cn('flex mb-4', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('flex items-end gap-2 max-w-[80%]', isUser ? 'flex-row-reverse' : 'flex-row')}>
        <Icon className={cn(
          'h-6 w-6 rounded-full p-0.5 shrink-0',
          isUser
            ? 'bg-gradient-to-b from-[hsl(250_70%_25%)] to-[hsl(var(--primary))] text-primary-foreground'
            : 'bg-neutral-500/50 backdrop-blur-md border border-white/10 text-secondary-foreground'
        )} />
        <div
          className={cn(
            'p-3 rounded-lg shadow-md',
            isUser
              ? 'bg-gradient-to-r from-[hsl(250_70%_25%)] to-[hsl(var(--primary))] text-primary-foreground rounded-br-none'
              : 'bg-gradient-to-b from-neutral-400/60 via-neutral-600/80 to-black/90 backdrop-blur-md border border-white/10 text-secondary-foreground rounded-bl-none'
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
          {message.toolSuggestion && (
            <Card className="mt-2 bg-background/20 dark:bg-black/30 border-border/50 backdrop-blur-sm">
              <CardHeader className="p-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-foreground/80" />
                  <CardTitle className="text-xs font-semibold text-foreground/80">Tool Suggestion</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-2 text-xs">
                <p className="font-medium text-foreground">{message.toolSuggestion}</p>
                {message.reasoning && <p className="mt-1 text-foreground/70">{message.reasoning}</p>}
              </CardContent>
              {renderToolSuggestionContent()}
            </Card>
          )}
          <p className={cn('text-xs mt-1.5', isUser ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70 text-left')}>
            {message.timestamp}
          </p>
        </div>
      </div>
    </div>
  );
}

