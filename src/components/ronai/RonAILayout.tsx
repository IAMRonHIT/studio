
"use client";

import { useState, useEffect } from 'react';
import type { ActiveView } from '@/types';
import { AiChatPanel } from './AiChatPanel';
import { ControlBar } from './ControlBar';
import { ThinSidebar } from './ThinSidebar';
import { BrowserView } from './views/BrowserView';
import { DevelopView } from './views/DevelopView';
import { ToolsView } from './views/ToolsView';
import { cn } from '@/lib/utils';
import { PanelLeftClose, PanelRightClose } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RonAILayout() {
  const [activePanel, setActivePanel] = useState<ActiveView | null>(null);
  const [isPanelVisible, setIsPanelVisible] = useState(false);

  useEffect(() => {
    setIsPanelVisible(activePanel !== null);
  }, [activePanel]);

  const togglePanel = (panel: ActiveView) => {
    if (activePanel === panel) {
      setActivePanel(null);
    } else {
      setActivePanel(panel);
    }
  };

  const closePanel = () => {
    setActivePanel(null);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <div className="flex flex-1 min-h-0 pb-16"> {/* pb-16 for control bar height */}
        <ThinSidebar activePanel={activePanel} onSelectPanel={togglePanel} />

        {/* Sliding Panel Area */}
        <div
          className={cn(
            "h-full bg-background transition-all duration-300 ease-in-out flex flex-col relative border-r border-border",
            isPanelVisible ? "w-[45%] p-0" : "w-0 p-0 overflow-hidden"
          )}
        >
          {activePanel && (
            <div className="flex-shrink-0 p-2 border-b border-border bg-muted/30 flex justify-between items-center">
              <span className="font-semibold text-sm capitalize">{activePanel}</span>
              <Button variant="ghost" size="icon" onClick={closePanel} className="h-7 w-7">
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex-1 overflow-auto">
            {activePanel === 'browser' && <BrowserView />}
            {activePanel === 'develop' && <DevelopView />}
            {activePanel === 'tools' && <ToolsView />}
          </div>
        </div>

        {/* AI Chat Panel - takes remaining space */}
        <div className="flex-1 h-full min-w-0"> {/* Added min-w-0 to prevent chat from shrinking too much */}
          <AiChatPanel activeView={activePanel} />
        </div>
      </div>
      <ControlBar />
    </div>
  );
}
