export type EquipmentStatus = 'operational' | 'breakdown' | 'maintenance' | 'idle';

export interface Equipment {
  id: string;
  code: string;
  name: string;
  type: string;
  category: 'heavy' | 'transport' | 'earthwork' | 'paving' | 'service' | 'crusher' | 'excavator' | 'truck' | 'loader' | 'generator' | 'other';
  status: EquipmentStatus;
  driver: string;
  location: string;
  sector?: 'القطعة A' | 'القطعة B' | string;
  dailyHours: number;
  fuelConsumption?: number;
  fuelConsumptionRate?: number;
  notes?: string;
}

export interface FuelDispatch {
  id: string;
  ticketNumber: string;
  date: string;
  time?: string;
  equipmentId?: string;
  equipmentName: string;
  liters: number;
  driverName: string;
  pumpOperator?: string;
  tankSource?: string;
  meterBefore: number;
  meterAfter: number;
  sector?: string;
  type?: 'صرف' | 'وارد';
}

export interface FuelLog extends FuelDispatch {}

export interface CrusherStock {
  id: string;
  crusherName: string;
  name?: string;
  location: string;
  dailyProductionM3?: number;
  dailyProductionTons?: number;
  totalStockM3?: number;
  totalStockTons?: number;
  sharshoorTons?: number;
  aggregateType?: string;
  sector?: string;
  status: 'active' | 'maintenance' | 'stopped' | 'idle';
  lastUpdated?: string;
}

export interface CrusherData extends CrusherStock {}

export interface ConstructionProgress {
  id: string;
  sectorName: string;
  workType: 'FDR' | 'BaseCourse' | 'AsphaltPaving' | 'Subgrade' | 'Leveling';
  startStationKm: number;
  endStationKm: number;
  dailyLengthM: number;
  dailyAreaM2: number;
  totalTargetKm: number;
  achievedKm: number;
  date: string;
  engineerInCharge: string;
}

export interface ReportItem {
  id: string;
  date: string;
  sector: 'A' | 'B';
  reportType: 'حركة المعدات' | 'السولار' | 'الكسارات' | 'الشرشور' | 'الوقود' | 'تقرير مجمع';
  status: 'معتمد' | 'قيد المراجعة' | 'مرفوض';
  author: string;
  fileSize?: string;
}

export interface AlertNotification {
  id: string;
  type: 'warning' | 'info' | 'danger';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface TomorrowPlanItem {
  id: string;
  title: string;
  target: string;
  category: 'crusher' | 'truck' | 'excavator' | 'fuel' | 'other';
  iconType: string;
  color: string;
}
