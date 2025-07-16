import { useState, useCallback } from 'react';
import { BatteryData, ProcessedBatteryData, BatteryInsights } from '@/types/battery';
import { fetchBatteryData } from '@/services/batteryApi';

export const useBatteryData = () => {
  const [rawData, setRawData] = useState<BatteryData[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedBatteryData[]>([]);
  const [insights, setInsights] = useState<BatteryInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('2022');

  const loadData = useCallback(async (year?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBatteryData(year);
      setRawData(data);
      
      const processed = processData(data);
      setProcessedData(processed);
      
      const calculatedInsights = calculateInsights(processed);
      setInsights(calculatedInsights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  const processData = (data: BatteryData[]): ProcessedBatteryData[] => {
    let cumulativeAh = 0;
    let cumulativeEnergy = 0;
    
    return data.map((item, index) => {
      const timeInterval = index > 0 ? 
        (new Date(item.timestamp).getTime() - new Date(data[index - 1].timestamp).getTime()) / (1000 * 3600) : 
        1; // 1 hour in hours
      
      const ampereHours = Math.abs(item.current) * timeInterval;
      cumulativeAh += ampereHours;
      
      const power = item.power || item.voltage * item.current;
      const energyKWh = Math.abs(power) * timeInterval / 1000;
      cumulativeEnergy += energyKWh;
      
      return {
        ...item,
        ampereHours,
        cumulativeAh,
        power,
        energyKWh,
        cumulativeEnergy
      };
    });
  };

  const calculateInsights = (data: ProcessedBatteryData[]): BatteryInsights => {
    if (data.length === 0) {
      return {
        totalEnergyConsumed: 0,
        totalEnergyGenerated: 0,
        averageVoltage: 0,
        peakCurrent: 0,
        minVoltage: 0,
        maxVoltage: 0,
        averageSOC: 0,
        chargingCycles: 0,
        efficiency: 0
      };
    }

    const voltages = data.map(d => d.voltage);
    const currents = data.map(d => d.current);
    const socs = data.map(d => d.soc);
    
    const totalEnergyConsumed = data
      .filter(d => d.current > 0)
      .reduce((sum, d) => sum + d.energyKWh, 0);
    
    const totalEnergyGenerated = data
      .filter(d => d.current < 0)
      .reduce((sum, d) => sum + Math.abs(d.energyKWh), 0);
    
    // Count charging cycles (SOC drops below 20% then charges above 80%)
    let chargingCycles = 0;
    let inLowSOC = false;
    
    for (const item of data) {
      if (!inLowSOC && item.soc < 20) {
        inLowSOC = true;
      } else if (inLowSOC && item.soc > 80) {
        chargingCycles++;
        inLowSOC = false;
      }
    }

    return {
      totalEnergyConsumed,
      totalEnergyGenerated,
      averageVoltage: voltages.reduce((a, b) => a + b, 0) / voltages.length,
      peakCurrent: Math.max(...currents.map(Math.abs)),
      minVoltage: Math.min(...voltages),
      maxVoltage: Math.max(...voltages),
      averageSOC: socs.reduce((a, b) => a + b, 0) / socs.length,
      chargingCycles,
      efficiency: totalEnergyGenerated > 0 ? (totalEnergyConsumed / totalEnergyGenerated) * 100 : 0
    };
  };

  const refetch = useCallback(() => {
    loadData(selectedYear);
  }, [loadData, selectedYear]);

  const changeYear = useCallback((year: string) => {
    setSelectedYear(year);
    loadData(year);
  }, [loadData]);

  return {
    rawData,
    processedData,
    insights,
    loading,
    error,
    selectedYear,
    refetch,
    changeYear
  };
};