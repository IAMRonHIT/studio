
"use client";

import type { ChatMessage, ActiveView } from '@/types'; // Added ChatMessage
import { useState, useEffect, useRef, useCallback } from 'react';
import { AiChatPanel } from './AiChatPanel';
import { ControlBar } from './ControlBar';
import { ThinSidebar } from './ThinSidebar';
import { BrowserView } from './views/BrowserView';
import { DevelopView } from './views/DevelopView';
import { ToolsView } from './views/ToolsView';
import { cn } from '@/lib/utils';
import { PanelLeftClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIdeContext } from '@/contexts/IdeContext'; // Import useIdeContext

const MIN_PANEL_WIDTH_PERCENT = 15;
const MAX_PANEL_WIDTH_PERCENT = 80;
const DEFAULT_PANEL_WIDTH_PERCENT = 45;

export function RonAILayout() {
  const [activePanel, setActivePanel] = useState<ActiveView | null>(null);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  
  const [panelWidth, setPanelWidth] = useState<number>(DEFAULT_PANEL_WIDTH_PERCENT);
  const [isResizing, setIsResizing] = useState(false);
  const [initialMouseX, setInitialMouseX] = useState(0);
  const [initialPanelWidthPx, setInitialPanelWidthPx] = useState(0);

  const panelContainerRef = useRef<HTMLDivElement>(null); 
  const slidablePanelRef = useRef<HTMLDivElement>(null); 

  const { setIdeCode, setActiveDevelopTab, setIsExternalUpdate } = useIdeContext(); // Consume IDE context

  useEffect(() => {
    setIsPanelVisible(activePanel !== null);
    if (activePanel === null) {
      // setPanelWidth(DEFAULT_PANEL_WIDTH_PERCENT); 
    }
  }, [activePanel]);

  const togglePanel = (panel: ActiveView) => {
    if (activePanel === panel) {
      setActivePanel(null);
    } else {
      setActivePanel(panel);
      if (!isPanelVisible) {
        setPanelWidth(prev => Math.max(prev, DEFAULT_PANEL_WIDTH_PERCENT));
      }
    }
  };

  const closePanel = () => {
    setActivePanel(null);
  };

  const handleMouseDownOnResizer = useCallback((e: React.MouseEvent) => {
    if (!isPanelVisible || !slidablePanelRef.current) return;
    e.preventDefault();
    setIsResizing(true);
    setInitialMouseX(e.clientX);
    setInitialPanelWidthPx(slidablePanelRef.current.offsetWidth);
  }, [isPanelVisible]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !isPanelVisible || !panelContainerRef.current) return;

      const deltaX = e.clientX - initialMouseX;
      const newPixelWidth = initialPanelWidthPx + deltaX;
      
      const containerWidth = panelContainerRef.current.offsetWidth;
      if (containerWidth > 0) {
        let newPercentageWidth = (newPixelWidth / containerWidth) * 100;
        newPercentageWidth = Math.max(MIN_PANEL_WIDTH_PERCENT, Math.min(newPercentageWidth, MAX_PANEL_WIDTH_PERCENT));
        setPanelWidth(newPercentageWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, initialMouseX, initialPanelWidthPx, isPanelVisible]);

  const handleToolPreviewRequest = useCallback((action: ChatMessage['previewAction']) => {
    if (!action) return;
    setActivePanel(action.targetPanel);
    
    // Ensure panel is visible and has some width if it was closed
    if (action.targetPanel && activePanel !== action.targetPanel) {
        setIsPanelVisible(true);
        setPanelWidth(prev => Math.max(prev, DEFAULT_PANEL_WIDTH_PERCENT));
    }


    if (action.targetPanel === 'develop') {
      setIsExternalUpdate(true); // Signal that the IDE update is from an external source for animation
      setIdeCode(action.code);
      setActiveDevelopTab(action.targetDevelopTab);
    }
    // Add logic for other targetPanel types if needed in the future
    // e.g., if (action.targetPanel === 'tools') { ... }
  }, [setActivePanel, setIdeCode, setActiveDevelopTab, setIsExternalUpdate, activePanel]);


  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <div className="flex flex-1 min-h-0 pb-16"> {/* pb-16 for control bar height */}
        <ThinSidebar activePanel={activePanel} onSelectPanel={togglePanel} />

        <div id="panel-chat-container" ref={panelContainerRef} className="flex flex-1 h-full overflow-hidden">
          {/* Sliding Panel Area (where DevelopView, BrowserView, etc. are rendered) */}
          <div
            ref={slidablePanelRef}
            className={cn(
              "h-full bg-background flex flex-col relative border-r border-border", 
              !isResizing && "transition-all duration-300 ease-in-out", // Applied transition for width and potentially opacity/transform later
              isPanelVisible ? "p-0" : "p-0 w-0 overflow-hidden" // Control visibility and width
            )}
            style={{ width: isPanelVisible ? `${panelWidth}%` : '0px' }}
          >
            {activePanel && ( // Only render content if activePanel is set
              <>
                <div className="flex-shrink-0 p-2 border-b border-border bg-muted/30 flex justify-between items-center">
                  <span className="font-semibold text-sm capitalize text-foreground">{activePanel}</span>
                  <Button variant="ghost" size="icon" onClick={closePanel} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                    <PanelLeftClose className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden"> 
                  {activePanel === 'browser' && <BrowserView />}
                  {activePanel === 'develop' && <DevelopView />}
                  {activePanel === 'tools' && <ToolsView />}
                </div>
              </>
            )}
          </div>

          {/* Resizer Handle */}
          {isPanelVisible && activePanel && ( // Only show resizer if panel is visible and active
            <div
              onMouseDown={handleMouseDownOnResizer}
              className="w-1.5 cursor-col-resize bg-border hover:bg-primary/30 flex-shrink-0 flex items-center justify-center group"
              title="Resize panel"
            >
               <div className="w-px h-12 bg-muted-foreground/30 group-hover:bg-primary transition-colors duration-150"></div>
            </div>
          )}

          {/* AI Chat Panel - takes remaining space */}
          <div className="flex-1 h-full min-w-0"> 
            <AiChatPanel activeView={activePanel} onToolPreviewRequest={handleToolPreviewRequest} />
          </div>
        </div>
      </div>
      <ControlBar />
    </div>
  );
}
