
"use client";

import { useState } from 'react';
import type { ActiveView } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LayoutGrid, Code2, Wrench, ArrowLeft, ArrowRight, RefreshCw, Search } from 'lucide-react';
import { BrowserView } from './views/BrowserView';
import { DevelopView } from './views/DevelopView';
import { ToolsView } from './views/ToolsView';

const tabs: { name: ActiveView; label: string; icon: React.ElementType }[] = [
  { name: 'browser', label: 'Browser', icon: LayoutGrid },
  { name: 'develop', label: 'Develop', icon: Code2 },
  { name: 'tools', label: 'Tools', icon: Wrench },
];

export function BrowserIdeTabs({ activeView, setActiveView }: { activeView: ActiveView; setActiveView: (view: ActiveView) => void; }) {
  const [url, setUrl] = useState('https://g.co/gemini/share/b0be5206eb8');

  return (
    <div className="flex flex-col h-full bg-background border-r border-border shadow-md">
      {/* Header Bar */}
      <div className="bg-gray-800 dark:bg-stone-900 p-2 text-white flex flex-col gap-2">
        {/* Tabs */}
        <div className="flex items-center space-x-1">
          {tabs.map((tab) => (
            <Button
              key={tab.name}
              variant={activeView === tab.name ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveView(tab.name)}
              className={`px-3 py-1.5 h-auto text-xs rounded-t-md rounded-b-none
                ${activeView === tab.name 
                  ? 'bg-background text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:bg-muted/20 hover:text-foreground'
                }
                ${activeView === tab.name ? '' : 'border-b-2 border-transparent'}`}
            >
              <tab.icon className="h-3.5 w-3.5 mr-1.5" />
              {tab.label}
            </Button>
          ))}
        </div>
        {/* Navigation and URL Bar */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"><ArrowRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"><RefreshCw className="h-4 w-4" /></Button>
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 h-7 text-xs bg-gray-700 dark:bg-stone-800 border-transparent focus:border-primary focus:ring-primary"
            placeholder="Enter URL"
          />
          <Button variant="default" size="sm" className="h-7 bg-primary hover:bg-primary/90 text-primary-foreground px-2.5">
            <Search className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden min-h-0">
        {activeView === 'browser' && <BrowserView />}
        {activeView === 'develop' && <DevelopView />}
        {activeView === 'tools' && <ToolsView />}
      </div>
    </div>
  );
}
