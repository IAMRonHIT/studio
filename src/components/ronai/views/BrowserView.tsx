
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, FileText, Users } from 'lucide-react';
import Image from 'next/image';

export function BrowserView() {
  const quickAccessItems = [
    { name: 'Patient Intake Form', icon: FileText, hint: "medical form" },
    { name: 'Appointment Scheduler', icon: Briefcase, hint: "calendar schedule" },
    { name: 'Clinical Guidelines', icon: Users, hint: "doctor patient" },
  ];

  return (
    <div className="h-full flex flex-col bg-zinc-100 dark:bg-gray-800 p-4 md:p-6 overflow-auto">
      {/* Main Content */}
      <div className="flex-1 w-full">
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
              <Card key={index} className="bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow rounded-lg overflow-hidden">
                <CardContent className="p-0 flex flex-col items-center text-center">
                  <div className="p-6">
                    <item.icon className="h-12 w-12 text-primary mb-4" />
                    <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{item.name}</h4>
                  </div>
                  <div className="w-full h-48 relative">
                    <Image 
                      src={`https://placehold.co/300x200.png`} 
                      alt={item.name} 
                      layout="fill" 
                      objectFit="cover" 
                      className="rounded-b-lg" 
                      data-ai-hint={item.hint} 
                    />
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
              <div className="md:w-1/2">
                 <Image src="https://placehold.co/600x400.png" alt="Healthcare illustration" width={600} height={400} className="object-cover w-full h-full" data-ai-hint="medical technology" />
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
