
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Folder, File, ChevronRight, PanelLeftClose, PanelRightClose, Play, Eye, TerminalIcon, Code2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIdeContext } from '@/contexts/IdeContext';

const mockFileStructure = [
  { name: 'src', type: 'folder', children: [
    { name: 'components', type: 'folder', children: [
      { name: 'Button.tsx', type: 'file', content: "// Button.tsx code..." },
      { name: 'Modal.tsx', type: 'file', content: "// Modal.tsx code..." },
    ]},
    { name: 'pages', type: 'folder', children: [
      { name: 'index.tsx', type: 'file', content: "// index.tsx code..." },
      { name: 'about.tsx', type: 'file', content: "// about.tsx code..." },
    ]},
    { name: 'App.tsx', type: 'file', content: "// App.tsx code..." },
  ]},
  { name: 'public', type: 'folder', children: [
    { name: 'index.html', type: 'file', content: "<!-- index.html code -->" },
  ]},
  { name: 'package.json', type: 'file', content: "{ \"name\": \"my-app\" }" },
];

interface FileTreeItemData {
  name: string;
  type: 'folder' | 'file';
  content?: string;
  children?: FileTreeItemData[];
}

interface FileTreeItemProps {
  item: FileTreeItemData;
  level?: number;
  onFileSelect: (fileName: string, fileContent?: string) => void;
}

const FileTreeItem = ({ item, level = 0, onFileSelect }: FileTreeItemProps) => {
  const [isOpen, setIsOpen] = useState(item.type === 'folder' && level < 1);
  const Icon = item.type === 'folder' ? Folder : File;
  const hasChildren = item.children && item.children.length > 0;

  const handleToggle = () => {
    if (item.type === 'folder') {
      setIsOpen(!isOpen);
    }
    onFileSelect(item.name, item.content);
  };

  return (
    <div>
      <div
        className="flex items-center space-x-2 p-1.5 hover:bg-secondary rounded-md cursor-pointer"
        style={{ paddingLeft: `${level * 0.8 + 0.5}rem` }}
        onClick={handleToggle}
      >
        {item.type === 'folder' && (
          <ChevronRight className={cn('h-4 w-4 transform transition-transform shrink-0', isOpen ? 'rotate-90' : '')} />
        )}
        <Icon className={cn("h-4 w-4 text-primary shrink-0", item.type === 'file' && 'ml-4')} />
        <span className="text-sm text-foreground truncate">{item.name}</span>
      </div>
      {isOpen && hasChildren && (
        <div>
          {item.children!.map((child, index) => (
            <FileTreeItem key={index} item={child} level={level + 1} onFileSelect={onFileSelect} />
          ))}
        </div>
      )}
    </div>
  );
};


export function DevelopView() {
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [selectedFileName, setSelectedFileName] = useState('GFR_Calculator.html'); // Default selected file name
  const { ideCode, setIdeCode, activeDevelopTab, setActiveDevelopTab } = useIdeContext();
  const [iframeKey, setIframeKey] = useState(0); // Key to force iframe refresh

  useEffect(() => {
    // When ideCode changes (e.g., from AI chat), force iframe to re-render
    setIframeKey(prevKey => prevKey + 1);
  }, [ideCode]);


  const handleFileSelect = (fileName: string, fileContent?: string) => {
    setSelectedFileName(fileName);
    if (fileContent) {
      // For this demo, if it's a file from the tree with mock content,
      // we set the IDE code to that. Otherwise, GFR code remains.
      // A real IDE would load actual file content.
      setIdeCode(fileContent);
      setActiveDevelopTab('editor');
    } else if (fileName === 'GFR_Calculator.html') {
      // If GFR_Calculator.html (not in tree but representing context) is "selected"
      // ensure context's ideCode is shown (which it should be already)
      // and switch to preview if AI set it.
    }
  };
  
  const handleEditorChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIdeCode(event.target.value);
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

        {/* Main Content Area: Editor and Tabs (Preview/Terminal) */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor Controls */}
          <div className="p-2 bg-secondary/30 border-b border-border flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setIsExplorerOpen(!isExplorerOpen)} className="h-7 w-7">
              {isExplorerOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
            </Button>
            <span className="text-sm font-medium text-foreground truncate flex-1">{selectedFileName}</span>
            {/* The "Play" button is removed as preview is now a tab */}
          </div>
          
          {/* Editor Area */}
          <div className="flex-1 flex flex-col min-h-0">
            <Tabs value={activeDevelopTab} onValueChange={(value) => setActiveDevelopTab(value as 'editor'|'preview'|'terminal')} className="flex-1 flex flex-col min-h-0">
              <TabsList className="mx-2 mt-2 self-start">
                <TabsTrigger value="editor" className="text-xs px-3 py-1 h-auto">
                  <Code2Icon className="h-3.5 w-3.5 mr-1.5" />Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="text-xs px-3 py-1 h-auto">
                  <Eye className="h-3.5 w-3.5 mr-1.5" />Preview
                </TabsTrigger>
                <TabsTrigger value="terminal" className="text-xs px-3 py-1 h-auto">
                  <TerminalIcon className="h-3.5 w-3.5 mr-1.5" />Terminal
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="flex-1 flex flex-col min-h-0 p-0.5 mt-0">
                <Textarea
                  value={ideCode}
                  onChange={handleEditorChange}
                  className="flex-1 w-full h-full text-sm font-mono bg-muted/20 border-0 focus:ring-0 resize-none p-3 rounded-md"
                  placeholder="Write your code here..."
                />
              </TabsContent>

              <TabsContent value="preview" className="flex-1 p-0.5 mt-0">
                <iframe
                  key={iframeKey} // Force re-render on code change
                  srcDoc={ideCode}
                  title="Preview"
                  className="w-full h-full border-0 rounded-md bg-white"
                  sandbox="allow-scripts allow-same-origin"
                />
              </TabsContent>
              
              <TabsContent value="terminal" className="flex-1 mt-0 p-0.5">
                <ScrollArea className="h-full bg-secondary/50 rounded-md">
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
