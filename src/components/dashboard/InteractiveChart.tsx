import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { ProcessedBatteryData } from '@/types/battery';

interface InteractiveChartProps {
  data: ProcessedBatteryData[];
  title: string;
  height?: number;
}

export const InteractiveChart = ({ data, title, height = 500 }: InteractiveChartProps) => {
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState({
    voltage: true,
    current: true,
    soc: true,
    power: false
  });

  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp).toLocaleDateString(),
      formattedTime: new Date(item.timestamp).toLocaleString()
    }));
  }, [data]);

  const handleBrushChange = (domain: any) => {
    if (domain && domain.startIndex !== undefined && domain.endIndex !== undefined) {
      setZoomDomain([domain.startIndex, domain.endIndex]);
    }
  };

  const resetZoom = () => {
    setZoomDomain(null);
  };

  const toggleMetric = (metric: keyof typeof selectedMetrics) => {
    setSelectedMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 p-3 border border-slate-600 rounded-lg shadow-lg">
          <p className="font-semibold text-white">{data.formattedTime}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)} {getUnit(entry.dataKey)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getUnit = (dataKey: string) => {
    switch (dataKey) {
      case 'voltage': return 'V';
      case 'current': return 'A';
      case 'soc': return '%';
      case 'power': return 'W';
      default: return '';
    }
  };

  return (
    <Card className="w-full bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">{title}</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {Object.entries(selectedMetrics).map(([key, enabled]) => (
                <Button
                  key={key}
                  variant={enabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleMetric(key as keyof typeof selectedMetrics)}
                  className={`text-xs ${enabled 
                    ? key === 'current' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600'
                  }`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Button>
              ))}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetZoom}
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <div style={{ minWidth: Math.max(1200, chartData.length * 2) }}>
            <ResponsiveContainer width="100%" height={height}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis 
                  dataKey="timestamp" 
                  type="category"
                  stroke="#94a3b8"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={Math.floor(chartData.length / 30)}
                />
                <YAxis yAxisId="left" orientation="left" stroke="#94a3b8" />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
            
                {selectedMetrics.voltage && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="voltage"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    name="Voltage"
                  />
                )}
            
                {selectedMetrics.current && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="current"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    name="Current"
                  />
                )}
            
                {selectedMetrics.soc && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="soc"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="SOC"
                  />
                )}
            
                {selectedMetrics.power && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="power"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    name="Power"
                  />
                )}
            
              
                <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="5 5" yAxisId="left" />
                <ReferenceLine y={80} stroke="#10b981" strokeDasharray="5 5" yAxisId="left" />
            
                <Brush
                  dataKey="timestamp"
                  height={30}
                  stroke="#10b981"
                  startIndex={zoomDomain ? zoomDomain[0] : 0}
                  endIndex={zoomDomain ? zoomDomain[1] : chartData.length - 1}
                  onChange={handleBrushChange}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};