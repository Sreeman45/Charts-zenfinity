import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProcessedBatteryData } from '@/types/battery';

interface AmpereHourChartProps {
  data: ProcessedBatteryData[];
}

export const AmpereHourChart = ({ data }: AmpereHourChartProps) => {
  const scatterData = useMemo(() => {
    return data.map((item) => ({
      voltage: item.voltage,
      ampereHours: item.cumulativeAh,
      current: item.current,
      soc: item.soc,
      timestamp: new Date(item.timestamp).toLocaleString(),
      charging: item.current < 0,
      discharging: item.current > 0
    }));
  }, [data]);

  const chargingData = scatterData.filter(item => item.charging);
  const dischargingData = scatterData.filter(item => item.discharging);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.timestamp}</p>
          <p>Voltage: {data.voltage.toFixed(2)} V</p>
          <p>Cumulative Ah: {data.ampereHours.toFixed(3)} Ah</p>
          <p>Current: {data.current.toFixed(2)} A</p>
          <p>SOC: {data.soc.toFixed(1)}%</p>
          <p>State: {data.charging ? 'Charging' : 'Discharging'}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ampere-Hours vs Voltage Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">
          Relationship between cumulative ampere-hours and voltage during charging/discharging cycles
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="voltage"
              name="Voltage"
              unit="V"
              domain={['dataMin - 1', 'dataMax + 1']}
            />
            <YAxis
              type="number"
              dataKey="ampereHours"
              name="Cumulative Ah"
              unit="Ah"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <Scatter
              name="Charging"
              data={chargingData}
              fill="#10b981"
              fillOpacity={0.6}
            />
            
            <Scatter
              name="Discharging"
              data={dischargingData}
              fill="#ef4444"
              fillOpacity={0.6}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};