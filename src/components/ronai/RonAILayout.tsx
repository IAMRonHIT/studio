
"use client";

import { useState } from 'react';
import type { ActiveView } from '@/types';
import { BrowserIdeTabs } from './BrowserIdeTabs';
import { AiChatPanel } from './AiChatPanel';
import { ControlBar } from './ControlBar';

export function RonAILayout() {
  const [activeView, setActiveView] = useState<ActiveView>('browser');

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <div className="flex flex-1 min-h-0 pt-0 pb-16"> {/* pb-16 for control bar height */}
        {/* Left Panel (Browser/IDE) - 65% */}
        <div className="w-[65%] h-full">
          <BrowserIdeTabs activeView={activeView} setActiveView={setActiveView} />
        </div>
        {/* Right Panel (AI Chat) - 35% */}
        <div className="w-[35%] h-full">
          <AiChatPanel activeView={activeView} />
        </div>
      </div>
      <ControlBar />
    </div>
  );
}
