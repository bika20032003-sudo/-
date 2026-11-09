export type EquipmentStatus = 'operational' | 'breakdown' | 'maintenance' | 'idle';

export interface Equipment {
  id: string;
  code: string;
  name: string;
  type: string;
  category: 'heavy' | 'transport' | 'earthwork' | 'paving' | 'service' | 'excavator' | 'truck' | 'loader' | 'generator' | 'other';
  status: EquipmentStatus;
  driver: string;
  location: string;
  sector?: 'المرحلة الأولى' | 'المرحلة الثانية' | string;
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
  sector: 'المرحلة الأولى' | 'المرحلة الثانية' | string;
  reportType: 'تقرير يومي شامل' | 'تقرير الأعمال المستهدفة' | 'تقرير كميات الوقود اليومية' | 'تقرير إنجاز المرحلتين' | 'تقرير دوري مجمع' | string;
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
  category: 'truck' | 'excavator' | 'fuel' | 'paving' | 'other';
  iconType: string;
  color: string;
}
