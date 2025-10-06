import { CosmeticCalendar } from './components/CosmeticCalendar';
import { WeeklyRoutine } from './components/WeeklyRoutine';
import { Toaster } from './components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Calendar, Clock } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <Tabs defaultValue="calendar" className="space-y-6">
          <div className="flex items-center justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Kalendarz Kosmetyków
              </TabsTrigger>
              <TabsTrigger value="routine" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Rutyna Tygodniowa
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="calendar" className="mt-0">
            <CosmeticCalendar />
          </TabsContent>
          
          <TabsContent value="routine" className="mt-0">
            <WeeklyRoutine />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}