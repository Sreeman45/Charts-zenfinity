export interface BatteryData {
  timestamp: string;
  voltage: number;
  current: number;
  soc: number; // State of Charge
  temperature?: number;
  power?: number;
}

export interface ProcessedBatteryData extends BatteryData {
  ampereHours: number;
  cumulativeAh: number;
  power: number;
  energyKWh: number;
  cumulativeEnergy: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'assistant';
}

export interface BatteryInsights {
  totalEnergyConsumed: number;
  totalEnergyGenerated: number;
  averageVoltage: number;
  peakCurrent: number;
  minVoltage: number;
  maxVoltage: number;
  averageSOC: number;
  chargingCycles: number;
  efficiency: number;
}