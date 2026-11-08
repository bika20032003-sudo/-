import { 
  Equipment, 
  ReportItem, 
  AlertNotification, 
  TomorrowPlanItem, 
  FuelLog, 
  CrusherData,
  ConstructionProgress,
  FuelDispatch,
  CrusherStock
} from '../types';

export const initialDailySummary = {
  workingEquipment: { total: 0, sectorA: 0, sectorB: 0, max: 0 },
  stoppedEquipment: { total: 0, sectorA: 0, sectorB: 0 },
  operatingHours: { total: 0, sectorA: 0, sectorB: 0, change: '0%' },
  solarConsumption: { total: 0, sectorA: 0, sectorB: 0, change: '0%' },
  totalProduction: { total: 0, sectorA: 0, sectorB: 0, change: '0%' },
  sharshoor: { total: 0, sectorA: 0, sectorB: 0 }
};

export const solarTrend7Days: { date: string; sectorA: number; sectorB: number }[] = [];

export const solarByEquipmentType: { name: string; value: number; percentage: number; color: string }[] = [];

export const initialRecentReports: ReportItem[] = [];

export const initialAlerts: AlertNotification[] = [];

export const initialTomorrowPlan: TomorrowPlanItem[] = [];

export const initialEquipment: Equipment[] = [];

export const initialEquipmentList: Equipment[] = [];

export const initialCrushers: CrusherStock[] = [];

export const initialCrusherStocks: CrusherStock[] = [];

export const initialFuelLogs: FuelDispatch[] = [];

export const initialRoadProgress: ConstructionProgress[] = [];
