import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';


interface MetricsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
}

export const MetricsCard = ({ 
  title, 
  value, 
  unit, 
  icon: Icon, 

}: MetricsCardProps) => {
 

  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-blue-400" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-bold text-white">
            {typeof value === 'number' ? value.toFixed(2) : value}
          </div>
          {unit && (
            <div className="text-sm text-slate-400">{unit}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};