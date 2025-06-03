
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Briefcase, FileText, Users, ArrowLeft, ArrowRight, RefreshCw, Search } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { generateImage, type GenerateImageInput } from '@/ai/flows/generate-image-flow';
import { Skeleton } from '@/components/ui/skeleton'; 

interface QuickAccessItem {
  name: string;
  icon: React.ElementType;
  hint: string;
  prompt: string; 
  imageUrl?: string | null; 
}

const initialQuickAccessItemsData: Omit<QuickAccessItem, 'imageUrl'>[] = [
  { name: 'Patient Intake Form', icon: FileText, hint: "medical form", prompt: "Stylized icon representing a patient intake form, clean and professional design for a healthcare application." },
  { name: 'Appointment Scheduler', icon: Briefcase, hint: "calendar schedule", prompt: "Modern digital interface for an appointment scheduler or a calendar application, clear and intuitive." },
  { name: 'Clinical Guidelines', icon: Users, hint: "doctor patient", prompt: "Abstract illustration symbolizing clinical guidelines or a doctor consulting a patient, conveying trust and knowledge." },
];

const featuredResourceInitialData = {
  prompt: "Futuristic illustration of advanced medical technology and diagnostics, conveying innovation, precision, and a hopeful outlook.",
  hint: "medical technology",
  imageUrl: null as string | null,
};

export function BrowserView() {
  const [quickAccessItems, setQuickAccessItems] = useState<QuickAccessItem[]>(
    initialQuickAccessItemsData.map(item => ({ ...item, imageUrl: null }))
  );
  const [featuredResourceImageUrl, setFeaturedResourceImageUrl] = useState<string | null>(featuredResourceInitialData.imageUrl);
  
  const [isLoadingItems, setIsLoadingItems] = useState(initialQuickAccessItemsData.map(() => true));
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [url, setUrl] = useState('https://g.co/gemini/share/b0be5206eb8');


  useEffect(() => {
    const fetchImages = async () => {
      const updatedItemsPromises = initialQuickAccessItemsData.map(async (itemData, index) => {
        try {
          const input: GenerateImageInput = { prompt: itemData.prompt };
          const result = await generateImage(input);
          return { ...itemData, imageUrl: result.imageDataUri };
        } catch (error) {
          console.error(`Failed to generate image for ${itemData.name}:`, error);
          return { ...itemData, imageUrl: `https://placehold.co/300x200.png?text=Error` }; 
        } finally {
          setIsLoadingItems(prev => {
            const newLoading = [...prev];
            newLoading[index] = false;
            return newLoading;
          });
        }
      });
      const resolvedItems = await Promise.all(updatedItemsPromises);
      setQuickAccessItems(resolvedItems);

      try {
        const input: GenerateImageInput = { prompt: featuredResourceInitialData.prompt };
        const result = await generateImage(input);
        setFeaturedResourceImageUrl(result.imageDataUri);
      } catch (error) {
        console.error('Failed to generate image for featured resource:', error);
        setFeaturedResourceImageUrl(`https://placehold.co/600x400.png?text=Error`);
      } finally {
        setIsLoadingFeatured(false);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Navigation and URL Bar */}
      <div className="bg-muted/30 dark:bg-stone-800 p-2 text-foreground border-b border-border">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"><ArrowRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"><RefreshCw className="h-4 w-4" /></Button>
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 h-7 text-xs bg-background dark:bg-stone-700 border-input focus:border-primary focus:ring-primary"
            placeholder="Enter URL"
          />
          <Button variant="default" size="sm" className="h-7 bg-primary hover:bg-primary/90 text-primary-foreground px-2.5">
            <Search className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-auto bg-zinc-100 dark:bg-neutral-800">
        <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white shadow-xl rounded-lg mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Welcome to Ron AI Tool Filing System</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              Access all your healthcare tools, forms, assessments, and educational resources in one organized platform.
            </p>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickAccessItems.map((item, index) => (
              <Card key={item.name} className="bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow rounded-lg overflow-hidden">
                <CardContent className="p-0 flex flex-col items-center text-center">
                  <div className="p-6">
                    <item.icon className="h-12 w-12 text-primary mb-4" />
                    <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{item.name}</h4>
                  </div>
                  <div className="w-full h-48 relative">
                    {isLoadingItems[index] ? (
                      <Skeleton className="w-full h-full rounded-b-lg" />
                    ) : (
                      <Image
                        src={item.imageUrl || `https://placehold.co/300x200.png?text=Fallback`}
                        alt={item.name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-b-lg"
                        data-ai-hint={item.hint}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="mt-10">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Featured Resource</h3>
          <Card className="bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 h-64 md:h-auto relative">
                 {isLoadingFeatured ? (
                    <Skeleton className="w-full h-full" />
                 ) : (
                    <Image 
                      src={featuredResourceImageUrl || `https://placehold.co/600x400.png?text=Fallback`} 
                      alt="Healthcare illustration" 
                      layout="fill"
                      objectFit="cover" 
                      className="object-cover w-full h-full" 
                      data-ai-hint={featuredResourceInitialData.hint} 
                    />
                 )}
              </div>
              <div className="md:w-1/2 p-6 flex flex-col justify-center">
                <h4 className="text-xl font-bold text-primary mb-2">Advanced Diagnostics</h4>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Explore our latest tools and techniques for more accurate and faster patient diagnostics. Empower your practice with cutting-edge technology.
                </p>
                <button className="mt-auto bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors self-start">
                  Learn More
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
