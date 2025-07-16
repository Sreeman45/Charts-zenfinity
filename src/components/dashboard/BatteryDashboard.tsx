import { useEffect } from 'react';
import { useBatteryData } from '@/hooks/useBatteryData';
import { MetricsCard } from './MetricsCard';
import { InteractiveChart } from './InteractiveChart';
import { ChatInterface } from '../chat/ChatInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Battery, 
  Zap, 
  Gauge, 
  TrendingUp, 
  RefreshCw, 
  AlertTriangle,
  Activity,
  Calendar
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const BatteryDashboard = () => {
  const { processedData, insights, loading, error, selectedYear, refetch, changeYear } = useBatteryData();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 p-6 w-full">
        <div className="container mx-auto">
          <Alert variant="destructive" className="bg-red-900/50 border-red-700">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-200">
              Error loading battery data: {error}
              <Button onClick={refetch} variant="outline" size="sm" className="ml-2">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const currentData = processedData[processedData.length - 1];

  return (
    <div className="min-h-screen bg-slate-900 w-full">
      <div className="container mx-auto p-6 space-y-6 max-w-none">
       
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Electric Battery Dashboard</h1>
            <p className="text-slate-400">
              Real-time battery performance analytics with graphs
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedYear} onValueChange={changeYear}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="2021" className="text-white hover:bg-slate-700">2021</SelectItem>
                <SelectItem value="2022" className="text-white hover:bg-slate-700">2022</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={refetch} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

       
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            title="Current Voltage"
            value={currentData?.voltage || 0}
            unit="V"
            icon={Zap}
            trend={currentData?.voltage > 50 ? 'up' : 'down'}
          />
          <MetricsCard
            title="State of Charge"
            value={currentData?.soc || 0}
            unit="%"
            icon={Battery}
            trend={currentData?.soc > 50 ? 'up' : 'down'}
          />
          <MetricsCard
            title="Current Draw"
            value={Math.abs(currentData?.current || 0)}
            unit="A"
            icon={Activity}
            trend={currentData?.current > 0 ? 'up' : 'down'}
          />
          <MetricsCard
            title="Power"
            value={Math.abs(currentData?.power || 0)}
            unit="W"
            icon={Gauge}
            trend={currentData?.power > 0 ? 'up' : 'down'}
          />
        </div>

     
        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricsCard
              title="Total Energy Consumed"
              value={insights.totalEnergyConsumed}
              unit="kWh"
              icon={TrendingUp}
            />
            <MetricsCard
              title="Peak Current"
              value={insights.peakCurrent}
              unit="A"
              icon={Activity}
            />
            <MetricsCard
              title="Charging Cycles"
              value={insights.chargingCycles}
              icon={RefreshCw}
            />
            <MetricsCard
              title="System Efficiency"
              value={insights.efficiency}
              unit="%"
              icon={Gauge}
            />
          </div>
        )}

      
        <div className="space-y-6">
      
          <div>
            {loading ? (
              <Card className="bg-slate-800/50 border-slate-700 h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
                  <p className="text-slate-300">Loading battery data...</p>
                </div>
              </Card>
            ) : (
              <InteractiveChart
                data={processedData}
                title={`Battery Performance Overview - ${selectedYear}`}
                height={500}
              />
            )}
          </div>

          <div className="w-full">
            <ChatInterface insights={insights} />
          </div>
        </div>

        
        {insights && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-300">Average Voltage</p>
                    <p className="text-2xl font-bold text-white">{insights.averageVoltage.toFixed(2)}V</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-300">Average SOC</p>
                    <p className="text-2xl font-bold text-white">{insights.averageSOC.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Min Voltage:</span>
                    <span className="font-medium text-white">{insights.minVoltage.toFixed(2)}V</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Max Voltage:</span>
                    <span className="font-medium text-white">{insights.maxVoltage.toFixed(2)}V</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Peak Current:</span>
                    <span className="font-medium text-white">{insights.peakCurrent.toFixed(2)}A</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Energy Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Energy Consumed:</span>
                    <span className="font-medium text-white">{insights.totalEnergyConsumed.toFixed(3)} kWh</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Energy Generated:</span>
                    <span className="font-medium text-white">{insights.totalEnergyGenerated.toFixed(3)} kWh</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Net Balance:</span>
                    <span className="font-medium text-white">
                      {(insights.totalEnergyGenerated - insights.totalEnergyConsumed).toFixed(3)} kWh
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Efficiency:</span>
                    <span className="font-medium text-white">{insights.efficiency.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-700">
                  <div className="flex justify-between text-slate-300">
                    <span>Charging Cycles:</span>
                    <span className="font-medium text-white">{insights.chargingCycles}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};