
"use client";

import type { ActiveView } from '@/types';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LayoutGrid, Code2, Wrench, MessageSquare } from 'lucide-react';
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
      <div className="w-16 bg-primary-foreground dark:bg-stone-900 flex flex-col items-center py-4 space-y-3 border-r border-border shadow-md">
        {/* Placeholder for a logo or main app icon if needed */}
        {/* <div className="p-2 mb-4">
          <MessageSquare className="h-7 w-7 text-primary" />
        </div> */}
        {sidebarItems.map((item) => (
          <Tooltip key={item.name}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSelectPanel(item.name)}
                className={cn(
                  "h-10 w-10 rounded-lg",
                  activePanel === item.name
                    ? "bg-primary/20 text-primary dark:bg-primary dark:text-primary-foreground"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/80 dark:hover:text-primary-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
