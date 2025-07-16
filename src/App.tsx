import { BatteryDashboard } from '@/components/dashboard/BatteryDashboard';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <div className="min-h-screen w-screen bg-slate-900">
      <BatteryDashboard />
      <Toaster />
    </div>
  );
}

export default App;