
"use client"; // Ensure this is at the top

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Folder, File, ChevronRight, PanelLeftClose, PanelRightClose, TerminalIcon, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockFileStructure = [
  { name: 'src', type: 'folder', children: [
    { name: 'components', type: 'folder', children: [
      { name: 'Button.tsx', type: 'file' },
      { name: 'Modal.tsx', type: 'file' },
    ]},
    { name: 'pages', type: 'folder', children: [
      { name: 'index.tsx', type: 'file' },
      { name: 'about.tsx', type: 'file' },
    ]},
    { name: 'App.tsx', type: 'file' },
  ]},
  { name: 'public', type: 'folder', children: [
    { name: 'index.html', type: 'file' },
  ]},
  { name: 'package.json', type: 'file' },
];

const mockCode = `
import React, { useState } from 'react';

function Greeting({ name }) {
  const [greeting, setGreeting] = useState(\`Hello, \${name}!\`);

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow">
      <h1 className="text-2xl font-bold text-purple-600">
        {greeting}
      </h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setGreeting(\`Hello, \${e.target.value}!\`)}
        className="mt-2 p-2 border rounded w-full"
        placeholder="Enter a name"
      />
    </div>
  );
}

export default Greeting;
`;

interface FileTreeItemProps {
  item: { name: string; type: 'folder' | 'file'; children?: FileTreeItemProps['item'][] };
  level?: number;
  onFileSelect: (fileName: string) => void;
}

const FileTreeItem = ({ item, level = 0, onFileSelect }: FileTreeItemProps) => {
  const [isOpen, setIsOpen] = useState(item.type === 'folder' && level < 1); // Keep top-level folders open
  const Icon = item.type === 'folder' ? Folder : File;
  const hasChildren = item.children && item.children.length > 0;

  const handleToggle = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else if (item.type === 'file') {
      onFileSelect(item.name);
    }
  };

  return (
    <div>
      <div
        className="flex items-center space-x-2 p-1.5 hover:bg-secondary rounded-md cursor-pointer"
        style={{ paddingLeft: `${level * 0.8 + 0.5}rem` }}
        onClick={handleToggle}
      >
        {hasChildren ? (
          <ChevronRight className={cn('h-4 w-4 transform transition-transform shrink-0', isOpen ? 'rotate-90' : '')} />
        ) : (
          <div className="w-4 h-4 shrink-0" /> // Placeholder for alignment
        )}
        <Icon className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm text-foreground truncate">{item.name}</span>
      </div>
      {isOpen && hasChildren && (
        <div>
          {item.children.map((child, index) => (
            <FileTreeItem key={index} item={child} level={level + 1} onFileSelect={onFileSelect} />
          ))}
        </div>
      )}
    </div>
  );
};


export function DevelopView() {
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState('App.tsx'); // Default selected file

  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
  };

  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      <div className="flex-1 flex min-h-0">
        {/* File Explorer */}
        <div
          className={cn(
            "bg-secondary/30 border-r border-border flex flex-col transition-all duration-300 ease-in-out",
            isExplorerOpen ? "w-[250px] min-w-[200px]" : "w-0 overflow-hidden"
          )}
        >
          {isExplorerOpen && (
            <>
              <div className="p-2 border-b border-border flex justify-between items-center sticky top-0 bg-secondary/30 z-10">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase">File Explorer</h3>
              </div>
              <ScrollArea className="flex-1 p-1.5">
                {mockFileStructure.map((item, index) => (
                  <FileTreeItem key={index} item={item} onFileSelect={handleFileSelect} />
                ))}
              </ScrollArea>
            </>
          )}
        </div>

        {/* Code Editor and Terminal */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor Controls */}
          <div className="p-2 bg-secondary/30 border-b border-border flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setIsExplorerOpen(!isExplorerOpen)} className="h-7 w-7">
              {isExplorerOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
            </Button>
            <span className="text-sm font-medium text-foreground truncate flex-1">{selectedFile}</span>
            <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs">
              <Play className="h-3.5 w-3.5 mr-1.5" /> Preview
            </Button>
          </div>
          {/* Code Editor */}
          <ScrollArea className="flex-1 bg-background p-0.5">
            <pre className="text-sm p-3 rounded-md bg-muted/20 overflow-x-auto h-full">
              <code className="font-mono whitespace-pre">{`// Displaying content for: ${selectedFile}\n${mockCode}`}</code>
            </pre>
          </ScrollArea>

          {/* Terminal */}
          <div className="h-1/3 min-h-[150px] bg-secondary/50 border-t border-border flex flex-col">
             <div className="flex items-center gap-2 text-xs text-muted-foreground p-1.5 border-b border-border">
                <TerminalIcon className="h-3.5 w-3.5" />
                <span>TERMINAL</span>
                <Button variant="ghost" size="icon" className="ml-auto h-5 w-5"><span className="text-base">+</span></Button>
             </div>
            <ScrollArea className="flex-1">
              <div className="text-xs font-mono text-muted-foreground p-2">
                <p>$ npm install</p>
                <p>...</p>
                <p>$ npm start</p>
                <p className="text-green-400">Compiled successfully!</p>
                <p>You can now view your app in the browser.</p>
                <p>  Local:            http://localhost:3000</p>
                <p>  On Your Network:  http://192.168.1.10:3000</p>
                <p className="text-foreground mt-2">$ <span className="animate-pulse">▋</span></p>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
