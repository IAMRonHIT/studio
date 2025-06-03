
"use client";

import type { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';
import { Bot, User, Code, FileText, Eye, Download, Send as SendIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import React, { useState } from 'react';

export function ChatMessageItem({ message }: { message: ChatMessage }) {
  const isUser = message.sender === 'user';
  const Icon = isUser ? User : Bot;
  const { toast } = useToast();
  const [critiqueText, setCritiqueText] = useState('');

  const handleGeneratePreview = () => {
    toast({
      title: "Preview Generation",
      description: "Requesting tool preview... (mock action)",
    });
  };

  const handleImplementLocally = () => {
    toast({
      title: "Local Implementation",
      description: "Preparing for local implementation... (mock action)",
    });
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
      description: `Your critique: "${critiqueText}" has been noted (mock action).`,
    });
    setCritiqueText(''); // Clear textarea after mock submission
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
              <CardFooter className="p-2 flex flex-col space-y-2.5">
                <div className="flex space-x-2 w-full">
                  <Button
                    size="sm"
                    className="flex-1 text-xs py-1 h-auto bg-gradient-to-b from-[hsl(250_70%_25%)] to-[hsl(var(--primary))] hover:from-[hsl(250_70%_25%)] hover:to-[hsl(var(--primary)/0.9)] text-primary-foreground"
                    onClick={handleGeneratePreview}
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    Generate Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs py-1 h-auto bg-gradient-to-b from-[hsl(250_70%_25%)] to-[hsl(var(--primary))] hover:from-[hsl(250_70%_25%)] hover:to-[hsl(var(--primary)/0.9)] text-primary-foreground"
                    onClick={handleImplementLocally}
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Implement Locally
                  </Button>
                </div>
                <div className="w-full space-y-1.5">
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
              </CardFooter>
            </Card>
          )}
          {message.codeCompletion && (
             <Card className="mt-2 bg-background/20 dark:bg-black/30 border-border/50 backdrop-blur-sm">
              <CardHeader className="p-2">
                 <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-foreground/80" />
                  <CardTitle className="text-xs font-semibold text-foreground/80">Code Completion</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                <pre className="text-xs bg-muted/20 p-2 rounded overflow-x-auto"><code className="text-foreground">{message.codeCompletion}</code></pre>
              </CardContent>
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
