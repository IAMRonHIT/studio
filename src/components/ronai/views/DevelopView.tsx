
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Folder, File, ChevronRight } from 'lucide-react';

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

const FileTreeItem = ({ item, level = 0 }: { item: any, level?: number }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const Icon = item.type === 'folder' ? Folder : File;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center space-x-2 p-1.5 hover:bg-secondary rounded-md cursor-pointer"
        style={{ paddingLeft: `${level * 1 + 0.5}rem` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {hasChildren && <ChevronRight className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-90' : ''}`} />}
        {!hasChildren && <div className="w-4 h-4" />} {/* Placeholder for alignment */}
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-sm text-foreground">{item.name}</span>
      </div>
      {isOpen && hasChildren && (
        <div>
          {item.children.map((child: any, index: number) => (
            <FileTreeItem key={index} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};


export function DevelopView() {
  return (
    <div className="h-full flex flex-col bg-background text-foreground p-1">
      <div className="flex-1 flex min-h-0">
        {/* File Explorer */}
        <div className="w-1/4 min-w-[200px] bg-secondary/30 p-2 rounded-l-md overflow-y-auto">
          <h3 className="text-sm font-semibold mb-2 px-1.5 text-muted-foreground">FILE EXPLORER</h3>
          <ScrollArea className="h-full">
            {mockFileStructure.map((item, index) => (
              <FileTreeItem key={index} item={item} />
            ))}
          </ScrollArea>
        </div>

        {/* Code Editor and Terminal */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor Controls */}
          <div className="p-2 bg-secondary/30 border-b border-border flex justify-end">
            <Button variant="outline" size="sm">Preview</Button>
          </div>
          {/* Code Editor */}
          <ScrollArea className="flex-1 bg-background p-1">
            <pre className="text-sm p-2 rounded-md bg-muted/20 overflow-x-auto">
              <code className="font-mono whitespace-pre">{mockCode}</code>
            </pre>
          </ScrollArea>

          {/* Terminal */}
          <div className="h-1/3 min-h-[150px] bg-secondary/50 p-2 rounded-b-r-md border-t border-border flex flex-col">
             <div className="flex items-center gap-2 text-xs text-muted-foreground p-1 border-b border-border mb-1">
                <span>TERMINAL</span>
                <span className="ml-auto">+</span>
             </div>
            <ScrollArea className="flex-1">
              <div className="text-xs font-mono text-muted-foreground p-1">
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
