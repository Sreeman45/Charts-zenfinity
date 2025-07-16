import { BatteryData } from '@/types/battery';

export const fetchBatteryData = async (year?: string): Promise<BatteryData[]> => {
  try {
    const url = year 
      ? `https://batterydemoapi-521905205220.asia-south1.run.app/battery-data?year=${year}`
      : 'https://batterydemoapi-521905205220.asia-south1.run.app/battery-data';
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the data to match our expected format
    return data.map((item: any) => ({
      timestamp: item.timestamp || item.time || new Date().toISOString(),
      voltage: parseFloat(item.voltage) || 0,
      current: parseFloat(item.current) || 0,
      soc: parseFloat(item.soc) || 0,
      temperature: item.temperature ? parseFloat(item.temperature) : undefined,
      power: item.power ? parseFloat(item.power) : undefined
    }));
  } catch (error) {
    console.error('Error fetching battery data:', error);
    // Return mock data for demonstration
    return generateMockData(year);
  }
};

const generateMockData = (year?: string): BatteryData[] => {
  const data: BatteryData[] = [];
  const startYear = year ? parseInt(year) : 2024;
  const startTime = new Date(`${startYear}-01-01T00:00:00Z`);
  
  // Generate 12 months of data with 4 data points per day (every 6 hours)
  const totalDataPoints = 365 * 4; // 1460 data points for full year
  
  for (let i = 0; i < totalDataPoints; i++) {
    const timestamp = new Date(startTime.getTime() + i * 6 * 3600000); // 6 hour intervals
    const hour = timestamp.getHours();
    const dayOfYear = Math.floor((timestamp.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24));
    
    // Simulate realistic battery behavior with seasonal variations
    let soc = 100;
    let voltage = 52;
    let current = 0;
    
    // Add seasonal variation
    const seasonalFactor = Math.sin((dayOfYear / 365) * 2 * Math.PI) * 0.1 + 1;
    
    // Discharge cycles during day
    if (hour >= 6 && hour <= 18) {
      soc = Math.max(20, (100 - (hour - 6) * 6 + Math.random() * 10) * seasonalFactor);
      voltage = 45 + (soc / 100) * 10 + Math.random() * 2;
      current = Math.random() * 25 * seasonalFactor; // Discharge current
    }
    // Charging cycles during night
    else if (hour >= 19 || hour <= 5) {
      soc = Math.min(100, (20 + (hour >= 19 ? hour - 19 : hour + 5) * 10 + Math.random() * 5) * seasonalFactor);
      voltage = 50 + (soc / 100) * 8 + Math.random() * 2;
      current = -(Math.random() * 15 * seasonalFactor); // Charge current (negative)
    }
    
    data.push({
      timestamp: timestamp.toISOString(),
      voltage: parseFloat(voltage.toFixed(2)),
      current: parseFloat(current.toFixed(2)),
      soc: parseFloat(soc.toFixed(1)),
      temperature: parseFloat((25 + Math.random() * 10).toFixed(1)),
      power: parseFloat((voltage * current).toFixed(2))
    });
  }
  
  return data;
};