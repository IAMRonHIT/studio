
"use client";

import type { ActiveView } from '@/types';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LayoutGrid, Code2, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThinSidebarProps {
  activePanel: ActiveView | null;
  onSelectPanel: (panel: ActiveView) => void;
}

const sidebarItems: { name: ActiveView; label: string; icon: React.ElementType }[] = [
  { name: 'browser', label: 'Browser', icon: LayoutGrid },
  { name: 'develop', label: 'Develop', icon: Code2 },
  { name: 'tools', label: 'Tools', icon: Wrench },
];

export function ThinSidebar({ activePanel, onSelectPanel }: ThinSidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn(
        "w-16 flex flex-col items-center py-4 space-y-3 border-r border-border shadow-md",
        "bg-gradient-to-b from-[hsl(250_70%_25%)] to-[hsl(var(--primary))]" // Dark rich indigo to primary gradient
      )}>
        {sidebarItems.map((item) => (
          <Tooltip key={item.name}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSelectPanel(item.name)}
                className={cn(
                  "h-10 w-10 rounded-lg transition-colors duration-150",
                  activePanel === item.name
                    ? "bg-primary/40 text-white dark:bg-primary dark:text-primary-foreground"
                    : "text-purple-200 hover:bg-primary/30 hover:text-white dark:text-purple-300 dark:hover:bg-primary/50 dark:hover:text-primary-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2 bg-background text-foreground border-border shadow-lg">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
