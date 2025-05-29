
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, FileJson, Zap } from 'lucide-react';

export function ToolsView() {
  const [formDescription, setFormDescription] = useState('');
  const [generatedForm, setGeneratedForm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateForm = async () => {
    if (!formDescription.trim()) {
      setGeneratedForm(JSON.stringify({ error: "Please describe the form you want to generate." }, null, 2));
      return;
    }
    setIsLoading(true);
    // Mock AI call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockJsonResponse = {
      title: "Patient Intake Form",
      fields: [
        { name: "fullName", label: "Full Name", type: "text", required: true },
        { name: "dob", label: "Date of Birth", type: "date", required: true },
        { name: "email", label: "Email Address", type: "email", required: false },
        { name: "phone", label: "Phone Number", type: "tel", required: false },
        { name: "reasonForVisit", label: "Reason for Visit", type: "textarea", required: true },
        { name: "medicalHistory", label: "Brief Medical History", type: "textarea", required: false },
      ],
      description: `Generated based on: "${formDescription}"`
    };
    setGeneratedForm(JSON.stringify(mockJsonResponse, null, 2));
    setIsLoading(false);
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 space-y-6 bg-background text-foreground overflow-y-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Zap className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-semibold">AI Form Generator</CardTitle>
              <CardDescription>Describe the form you need, and our AI will help generate a structure for it.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., 'Create a patient intake form with fields for full name, date of birth, contact information, and reason for visit...'"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            className="min-h-[120px] text-sm focus:ring-primary"
            disabled={isLoading}
          />
          <Button onClick={handleGenerateForm} disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/80">
            {isLoading ? (
              <>
                <Bot className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Generate Form
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedForm && (
        <Card className="flex-1 flex flex-col min-h-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <FileJson className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">Generated Form Structure (JSON)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ScrollArea className="h-full max-h-[400px] md:max-h-full p-1 rounded-md bg-muted/30">
              <pre className="text-xs p-3 whitespace-pre-wrap break-all">{generatedForm}</pre>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">This is a mock output. Integrate with a real AI service for actual form generation.</p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
