
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Briefcase, FileText, Users } from 'lucide-react';
import Image from 'next/image';

export function BrowserView() {
  const quickAccessItems = [
    { name: 'Patient Intake Form', icon: FileText, hint: "medical form" },
    { name: 'Appointment Scheduler', icon: Briefcase, hint: "calendar schedule" },
    { name: 'Clinical Guidelines', icon: Users, hint: "doctor patient" },
  ];

  return (
    <div className="h-full flex bg-zinc-100 dark:bg-gray-800 p-1 overflow-auto">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-900 p-4 space-y-6 shadow-lg rounded-l-md">
        <div className="flex items-center space-x-2 p-2 bg-gradient-to-br from-purple-600 to-purple-800 rounded-md shadow-md">
          <div className="p-2 bg-white/20 rounded">
            <span className="text-2xl font-bold text-white">R</span>
          </div>
          <h2 className="text-lg font-semibold text-white">Ron AI Tool Filing System</h2>
        </div>
        <nav className="space-y-1">
          {[ "Tools", "Forms", "Assessments"].map((item) => (
            <a
              key={item}
              href="#"
              className="group flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {item}
              <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400" />
            </a>
          ))}
        </nav>
        <div className="mt-auto">
          <Image src="https://placehold.co/200x100.png" alt="Healthcare illustration" width={200} height={100} className="rounded-md" data-ai-hint="medical technology" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white shadow-xl rounded-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Welcome to Ron AI Tool Filing System</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              Access all your healthcare tools, forms, assessments, and educational resources in one organized platform.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickAccessItems.map((item, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow rounded-lg">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <item.icon className="h-10 w-10 text-primary mb-3" />
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">{item.name}</h4>
                   <Image src={`https://placehold.co/150x100.png`} alt={item.name} width={150} height={100} className="mt-2 rounded-md" data-ai-hint={item.hint} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
