
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Folder, File, ChevronRight, PanelLeftClose, PanelRightClose, Eye, TerminalIcon, Code2Icon } from 'lucide-react';
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
    if (item.type === 'file' || (item.type === 'folder' && !isOpen)) {
      onFileSelect(item.name, item.content);
    } else if (item.type === 'folder' && isOpen) {
      onFileSelect(item.name, undefined);
    }
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
  const [selectedFileName, setSelectedFileName] = useState('IDE Editor');
  const { ideCode, setIdeCode, activeDevelopTab, setActiveDevelopTab, isExternalUpdate, setIsExternalUpdate } = useIdeContext();

  const [animatedIdeCode, setAnimatedIdeCode] = useState('');
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingSpeed = 15;
  const animatedIdeCodeRef = useRef(animatedIdeCode);

  useEffect(() => {
    animatedIdeCodeRef.current = animatedIdeCode;
  }, [animatedIdeCode]);

  useEffect(() => {
    if (isExternalUpdate && ideCode !== animatedIdeCodeRef.current) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setAnimatedIdeCode('');

      let index = 0;
      const typeCharacter = () => {
        if (index < ideCode.length) {
          setAnimatedIdeCode(prev => prev + ideCode[index]);
          index++;
          typingTimeoutRef.current = setTimeout(typeCharacter, typingSpeed);
        } else {
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
           if (animatedIdeCodeRef.current !== ideCode) {
            setAnimatedIdeCode(ideCode);
          }
          setIsExternalUpdate(false);
        }
      };
      typingTimeoutRef.current = setTimeout(typeCharacter, typingSpeed);

    } else if (!isExternalUpdate && ideCode !== animatedIdeCodeRef.current) {
       if (typingTimeoutRef.current) {
         clearTimeout(typingTimeoutRef.current);
       }
      setAnimatedIdeCode(ideCode);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideCode, isExternalUpdate]);

  const handleFileSelect = (fileName: string, fileContent?: string) => {
    setSelectedFileName(fileName);
    if (fileContent) {
      setIsExternalUpdate(true);
      setIdeCode(fileContent);
      setActiveDevelopTab('editor');
    }
  };

  const handleEditorChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsExternalUpdate(false);
    const newCode = event.target.value;
    setAnimatedIdeCode(newCode);
    setIdeCode(newCode);
  };

  return (
    // Root div of DevelopView: flex-1 to take space from parent in RonAILayout, flex-col to manage children
    <div className="flex-1 flex flex-col bg-background text-foreground min-h-0"> {/* Added min-h-0 */}
      {/* File Explorer and Main Content Area: flex-1 to take space from DevelopView root, min-h-0 for internal scroll */}
      <div className="flex-1 flex min-h-0">
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

        {/* Editor/Tabs area container: flex-1 to take remaining horizontal space, flex-col for vertical layout */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header for selected file name: fixed height */}
          <div className="p-2 bg-secondary/30 border-b border-border flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setIsExplorerOpen(!isExplorerOpen)} className="h-7 w-7">
              {isExplorerOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
            </Button>
            <span className="text-sm font-medium text-foreground truncate flex-1">
              {selectedFileName || (activeDevelopTab === 'editor' ? "Editor" : activeDevelopTab === 'preview' ? "Preview" : "Terminal" )}
            </span>
          </div>

          {/* Explicit flex container for Tabs component: flex-1 to take remaining vertical space, flex-col */}
          <div className="flex-1 flex flex-col min-h-0">
            <Tabs value={activeDevelopTab} onValueChange={(value) => setActiveDevelopTab(value as 'editor'|'preview'|'terminal')} className="flex-1 flex flex-col min-h-0">
              <TabsList className="mx-2 mt-2 self-start"> {/* Fixed height */}
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

              {/* TabsContent for Editor: flex-1 to take space from Tabs, flex-col, no top margin */}
              <TabsContent value="editor" className="flex-1 flex flex-col min-h-0 mt-0">
                <Textarea
                  value={animatedIdeCode}
                  onChange={handleEditorChange}
                  className="flex-1 w-full text-sm font-mono bg-muted/20 border-0 focus:ring-0 resize-none p-3 rounded-md"
                  placeholder="Code will appear here..."
                />
              </TabsContent>

              {/* TabsContent for Preview: flex-1 to take space from Tabs, flex-col, no top margin */}
              <TabsContent value="preview" className="flex-1 flex flex-col min-h-0 mt-0">
                <iframe
                  srcDoc={animatedIdeCode}
                  title="Preview"
                  className="flex-1 w-full border-0 rounded-md bg-white" // iframe is flex-1 to fill its parent
                  sandbox="allow-scripts allow-same-origin"
                />
              </TabsContent>

              {/* TabsContent for Terminal: flex-1 to take space from Tabs, flex-col, no top margin */}
              <TabsContent value="terminal" className="flex-1 flex flex-col min-h-0 mt-0">
                <ScrollArea className="flex-1 bg-secondary/50 rounded-md"> {/* ScrollArea is flex-1 */}
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
