
import type { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';
import { Bot, User, Code, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ChatMessageItem({ message }: { message: ChatMessage }) {
  const isUser = message.sender === 'user';
  const Icon = isUser ? User : Bot;

  return (
    <div className={cn('flex mb-4', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('flex items-end gap-2 max-w-[80%]', isUser ? 'flex-row-reverse' : 'flex-row')}>
        <Icon className={cn(
          'h-6 w-6 rounded-full p-0.5 shrink-0',
          isUser
            ? 'bg-gradient-to-b from-[hsl(250_70%_25%)] to-[hsl(var(--primary))] text-primary-foreground'
            : 'bg-black/20 backdrop-blur-md border border-white/10 text-secondary-foreground'
        )} />
        <div
          className={cn(
            'p-3 rounded-lg shadow-md',
            isUser
              ? 'bg-gradient-to-r from-[hsl(250_70%_25%)] to-[hsl(var(--primary))] text-primary-foreground rounded-br-none'
              : 'bg-gradient-to-b from-black/5 via-black/15 to-black/25 backdrop-blur-md border border-white/10 text-secondary-foreground rounded-bl-none'
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
          {message.toolSuggestion && (
            <Card className="mt-2 bg-background/10 border-border/50">
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
            </Card>
          )}
          {message.codeCompletion && (
             <Card className="mt-2 bg-background/10 border-border/50">
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
