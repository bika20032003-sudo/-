import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { 
  defaultUsers, 
  defaultRoadProgress, 
  defaultEquipment, 
  defaultCrushers, 
  defaultFuelDispatches, 
  defaultSharshoor, 
  defaultAlerts 
} from './defaultData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const defaultReports = [
  {
    id: 1,
    reportNumber: 'REP-SEC-A-01',
    date: new Date().toISOString(),
    sector: 'القطعة A',
    reportType: 'تقرير إنتاج كسارة',
    crusherName: 'كسارة القطاع (A)',
    materialName: 'ركام طبقة أساس (0-37.5 مم)',
    productionAmount: 850,
    salesAmount: 510,
    uploadedBy: 'مشرف القطاع (A)',
    status: 'approved',
    approvedBy: 'مدير القطاعات',
    notes: 'استقرار الإنتاج وجودة مطابقة للمواصفات'
  },
  {
    id: 2,
    reportNumber: 'REP-SEC-B-01',
    date: new Date().toISOString(),
    sector: 'القطعة B',
    reportType: 'تقرير تزويد وقود',
    crusherName: 'كسارة القطاع (B)',
    materialName: 'سولار تشغيل كسارة ومعدات',
    productionAmount: 1800,
    salesAmount: 0,
    uploadedBy: 'مشرف القطاع (B)',
    status: 'approved',
    approvedBy: 'مدير القطاعات',
    notes: 'تفريغ صهريج ديزل في الخزان الميداني'
  },
  {
    id: 3,
    reportNumber: 'REP-SEC-A-02',
    date: new Date().toISOString(),
    sector: 'القطعة A',
    reportType: 'تقرير توريد شرشور',
    crusherName: 'كسارة القطاع (A)',
    materialName: 'شرشور ناعم (0-5 مم)',
    productionAmount: 510,
    salesAmount: 480,
    uploadedBy: 'مشرف القطاع (A)',
    status: 'pending_review',
    notes: 'توريد لموقع خلطة الأسفلت - بانتظار مراجعة واعتماد مدير القطاعات'
  },
  {
    id: 4,
    reportNumber: 'REP-SEC-B-02',
    date: new Date().toISOString(),
    sector: 'القطعة B',
    reportType: 'تقرير تقدم أعمال رصف',
    crusherName: 'موقع القطاع (B)',
    materialName: 'طبقة الأساس الحبيبي والتشريب',
    productionAmount: 600,
    salesAmount: 0,
    uploadedBy: 'مشرف القطاع (B)',
    status: 'pending_review',
    notes: 'إنجاز 600 م.ط من طبقة الأساس الحبيبي - بانتظار الاعتماد'
  }
];

const defaultPlanItems = [
  { id: 1, targetType: 'crusher', targetCode: 'CRU-A', targetName: 'كسارة القطاع (A)', sector: 'القطعة A', currentStatus: 'تشغيل', plannedDecision: 'تشغيل', targetQuantity: 900, targetUnit: 'طن', reason: 'أداء تشغيلي مستقر وتأمين رصيد الشرشور', notes: 'إنتاج مستهدف لطبقة الأساس الركامي' },
  { id: 2, targetType: 'crusher', targetCode: 'CRU-B', targetName: 'كسارة القطاع (B)', sector: 'القطعة B', currentStatus: 'تشغيل', plannedDecision: 'تشغيل', targetQuantity: 800, targetUnit: 'طن', reason: 'استمرار الإنتاج لتغذية القطاع', notes: 'متابعة الصيانة الدورية' },
  { id: 3, targetType: 'equipment', targetCode: 'EQ-101', targetName: 'لودر CAT 966H', sector: 'القطعة A', currentStatus: 'تشغيل', plannedDecision: 'تشغيل', targetQuantity: 8, targetUnit: 'ساعة', reason: 'تغذية الكسارة وتحميل الشاحنات', notes: 'سائق الوردية الأولى' },
  { id: 4, targetType: 'fuel', targetCode: 'FUEL-RES', targetName: 'مخصصات السولار الميداني', sector: 'القطعة A + B', currentStatus: 'صرف', plannedDecision: 'تخصيص', targetQuantity: 4250, targetUnit: 'لتر', reason: 'تأمين وقود تشغيل الكسارات والحفارات', notes: 'توزيع الحصص على الصهاريج' }
];

const defaultPlan = {
  id: 1,
  title: 'خطة التشغيل الميداني المعتمدة',
  planDate: new Date().toISOString(),
  status: 'approved',
  approvedBy: 'مدير المشروع',
  items: defaultPlanItems
};

const defaultIssues = [
  { id: 1, sector: 'القطعة A', equipmentCode: 'EQ-103', equipmentName: 'جريدر CAT 140K', category: 'صيانة', title: 'صيانة هيدروليكية وتبديل سكينة', description: 'توقف الجريدر لإجراء صيانة عاجلة للسكينة وتبديل فلاتر الزيت الهيدروليكي.', severity: 'danger', status: 'in_progress', suggestedAction: 'توجيه الورشة الميدانية لإنهاء الصيانة خلال 4 ساعات.' },
  { id: 2, sector: 'القطعة B', equipmentCode: 'EQ-102', equipmentName: 'حفار Komatsu PC300', category: 'ملاحظة تشغيلية', title: 'فحص دوري لسائل التبريد', description: 'لوحظ ارتفاع حرارة سائل التبريد بعد ساعات تشغيل متواصل في المقلع.', severity: 'warning', status: 'open', suggestedAction: 'تنظيف رادياتير التبريد وفحص مستوى سائل التبريد.' }
];

class Store {
  constructor() {
    this.isMySQLConnected = false;
    this.saveTimeout = null;
    this.data = {
      users: JSON.parse(JSON.stringify(defaultUsers)),
      roadProgress: JSON.parse(JSON.stringify(defaultRoadProgress)),
      equipment: JSON.parse(JSON.stringify(defaultEquipment)),
      crushers: JSON.parse(JSON.stringify(defaultCrushers)),
      fuel: JSON.parse(JSON.stringify(defaultFuelDispatches)),
      sharshoor: JSON.parse(JSON.stringify(defaultSharshoor)),
      alerts: JSON.parse(JSON.stringify(defaultAlerts)),
      reports: JSON.parse(JSON.stringify(defaultReports)),
      plans: [JSON.parse(JSON.stringify(defaultPlan))],
      issues: JSON.parse(JSON.stringify(defaultIssues))
    };
    this.loadFromDisk();
    this.checkMySQLQuick();
  }

  loadFromDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure standard clean users are present
        this.data = { ...this.data, ...parsed };
        this.data.users = defaultUsers; // Keep clean standard roles
        console.log('[FastStore] Loaded persisted store from disk successfully.');
      } else {
        this.saveToDiskSync();
      }
    } catch (e) {
      console.warn('[FastStore] Failed to load store from disk:', e.message);
    }
  }

  saveToDiskSync() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('[FastStore] Error saving store to disk:', e.message);
    }
  }

  scheduleSave() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveToDiskSync();
    }, 100);
  }

  async checkMySQLQuick() {
    try {
      const dbUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/crusher_db';
      const urlPattern = /mysql:\/\/([^:]*)(?::([^@]*))?@([^:]+):(\d+)\/(.+)/;
      const match = dbUrl.match(urlPattern);
      if (match) {
        const [, user, password, host, port] = match;
        const connPromise = mysql.createConnection({
          host: host || 'localhost',
          port: Number(port) || 3306,
          user: user || 'root',
          password: password || '',
          connectTimeout: 400
        });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 400));
        const connection = await Promise.race([connPromise, timeoutPromise]);
        await connection.end();
        this.isMySQLConnected = true;
        console.log('[FastStore] Connected to MySQL database.');
        return true;
      }
    } catch (e) {
      this.isMySQLConnected = false;
    }
    return false;
  }

  // --- Crushers ---
  getCrushers(sectorFilter = null) {
    let logs = this.data.crushers || [];
    if (sectorFilter) {
      const filterStr = String(sectorFilter).toUpperCase();
      logs = logs.filter(c => c.sector?.toUpperCase().includes(filterStr));
    }
    return logs;
  }
  addCrusher(item) {
    const newLog = {
      id: Date.now(),
      name: item.name,
      sector: item.sector,
      dailyProductionTons: Number(item.dailyProductionTons) || 0,
      sharshoorTons: Number(item.sharshoorTons) || 0,
      imageUrl: item.imageUrl || null,
      notes: item.notes || '',
      createdAt: new Date().toISOString()
    };
    this.data.crushers.unshift(newLog);
    this.scheduleSave();
    return newLog;
  }
  updateCrusher(id, item) {
    const idx = this.data.crushers.findIndex(c => c.id === Number(id));
    if (idx !== -1) {
      this.data.crushers[idx] = {
        ...this.data.crushers[idx],
        name: item.name ?? this.data.crushers[idx].name,
        sector: item.sector ?? this.data.crushers[idx].sector,
        dailyProductionTons: item.dailyProductionTons !== undefined ? Number(item.dailyProductionTons) : this.data.crushers[idx].dailyProductionTons,
        sharshoorTons: item.sharshoorTons !== undefined ? Number(item.sharshoorTons) : this.data.crushers[idx].sharshoorTons,
        notes: item.notes ?? this.data.crushers[idx].notes,
        imageUrl: item.imageUrl ?? this.data.crushers[idx].imageUrl
      };
      this.scheduleSave();
      return this.data.crushers[idx];
    }
    return null;
  }
  deleteCrusher(id) {
    this.data.crushers = this.data.crushers.filter(c => c.id !== Number(id));
    this.scheduleSave();
  }

  // --- Fuel ---
  getFuel(sectorFilter = null) {
    let logs = this.data.fuel || [];
    if (sectorFilter) {
      const filterStr = String(sectorFilter).toUpperCase();
      logs = logs.filter(f => (f.tankSource?.toUpperCase().includes(filterStr) || f.sector?.toUpperCase().includes(filterStr)));
    }
    return logs;
  }
  addFuel(item) {
    const newLog = {
      id: Date.now(),
      ticketNumber: item.ticketNumber || `FUEL-${Date.now().toString().slice(-4)}`,
      equipmentName: item.equipmentName,
      liters: Number(item.liters) || 0,
      driverName: item.driverName || '',
      pumpOperator: item.pumpOperator || '',
      tankSource: item.tankSource || '',
      meterBefore: item.meterBefore ? Number(item.meterBefore) : null,
      meterAfter: item.meterAfter ? Number(item.meterAfter) : null,
      imageUrl: item.imageUrl || null,
      notes: item.notes || '',
      createdAt: new Date().toISOString()
    };
    this.data.fuel.unshift(newLog);
    this.scheduleSave();
    return newLog;
  }
  updateFuel(id, item) {
    const idx = this.data.fuel.findIndex(f => f.id === Number(id));
    if (idx !== -1) {
      this.data.fuel[idx] = {
        ...this.data.fuel[idx],
        ticketNumber: item.ticketNumber ?? this.data.fuel[idx].ticketNumber,
        equipmentName: item.equipmentName ?? this.data.fuel[idx].equipmentName,
        liters: item.liters !== undefined ? Number(item.liters) : this.data.fuel[idx].liters,
        driverName: item.driverName ?? this.data.fuel[idx].driverName,
        pumpOperator: item.pumpOperator ?? this.data.fuel[idx].pumpOperator,
        tankSource: item.tankSource ?? this.data.fuel[idx].tankSource,
        meterBefore: item.meterBefore !== undefined ? Number(item.meterBefore) : this.data.fuel[idx].meterBefore,
        meterAfter: item.meterAfter !== undefined ? Number(item.meterAfter) : this.data.fuel[idx].meterAfter,
        notes: item.notes ?? this.data.fuel[idx].notes,
        imageUrl: item.imageUrl ?? this.data.fuel[idx].imageUrl
      };
      this.scheduleSave();
      return this.data.fuel[idx];
    }
    return null;
  }
  deleteFuel(id) {
    this.data.fuel = this.data.fuel.filter(f => f.id !== Number(id));
    this.scheduleSave();
  }

  // --- Equipment ---
  getEquipment(sectorFilter = null) {
    let list = this.data.equipment || [];
    if (sectorFilter) {
      const filterStr = String(sectorFilter).toUpperCase();
      list = list.filter(e => (e.location?.toUpperCase().includes(filterStr) || e.sector?.toUpperCase().includes(filterStr)));
    }
    return list;
  }
  addEquipment(item) {
    const newEq = {
      id: Date.now(),
      code: item.code || `EQ-${Date.now().toString().slice(-3)}`,
      name: item.name,
      type: item.type || 'آلية',
      category: item.category || 'معدات ثقيلة',
      status: item.status || 'operational',
      driver: item.driver || '',
      location: item.location || '',
      dailyHours: Number(item.dailyHours) || 0,
      fuelConsumptionRate: Number(item.fuelConsumptionRate) || 0,
      imageUrl: item.imageUrl || null,
      notes: item.notes || '',
      createdAt: new Date().toISOString()
    };
    this.data.equipment.unshift(newEq);
    this.scheduleSave();
    return newEq;
  }
  updateEquipment(id, item) {
    const idx = this.data.equipment.findIndex(e => e.id === Number(id));
    if (idx !== -1) {
      this.data.equipment[idx] = {
        ...this.data.equipment[idx],
        code: item.code ?? this.data.equipment[idx].code,
        name: item.name ?? this.data.equipment[idx].name,
        type: item.type ?? this.data.equipment[idx].type,
        category: item.category ?? this.data.equipment[idx].category,
        status: item.status ?? this.data.equipment[idx].status,
        driver: item.driver ?? this.data.equipment[idx].driver,
        location: item.location ?? this.data.equipment[idx].location,
        dailyHours: item.dailyHours !== undefined ? Number(item.dailyHours) : this.data.equipment[idx].dailyHours,
        fuelConsumptionRate: item.fuelConsumptionRate !== undefined ? Number(item.fuelConsumptionRate) : this.data.equipment[idx].fuelConsumptionRate,
        notes: item.notes ?? this.data.equipment[idx].notes,
        imageUrl: item.imageUrl ?? this.data.equipment[idx].imageUrl
      };
      this.scheduleSave();
      return this.data.equipment[idx];
    }
    return null;
  }
  deleteEquipment(id) {
    this.data.equipment = this.data.equipment.filter(e => e.id !== Number(id));
    this.scheduleSave();
  }

  // --- Sharshoor ---
  getSharshoor(sectorFilter = null) {
    let logs = this.data.sharshoor || [];
    if (sectorFilter) {
      const filterStr = String(sectorFilter).toUpperCase();
      logs = logs.filter(s => s.sector?.toUpperCase().includes(filterStr));
    }
    return logs;
  }
  addSharshoor(item) {
    const newLog = {
      id: Date.now(),
      sector: item.sector,
      crusher: item.crusher,
      amountTons: Number(item.amountTons) || 0,
      truckCode: item.truckCode || '',
      destination: item.destination || '',
      notes: item.notes || '',
      imageUrl: item.imageUrl || null,
      createdAt: new Date().toISOString()
    };
    this.data.sharshoor.unshift(newLog);
    this.scheduleSave();
    return newLog;
  }
  updateSharshoor(id, item) {
    const idx = this.data.sharshoor.findIndex(s => s.id === Number(id));
    if (idx !== -1) {
      this.data.sharshoor[idx] = {
        ...this.data.sharshoor[idx],
        sector: item.sector ?? this.data.sharshoor[idx].sector,
        crusher: item.crusher ?? this.data.sharshoor[idx].crusher,
        amountTons: item.amountTons !== undefined ? Number(item.amountTons) : this.data.sharshoor[idx].amountTons,
        truckCode: item.truckCode ?? this.data.sharshoor[idx].truckCode,
        destination: item.destination ?? this.data.sharshoor[idx].destination,
        notes: item.notes ?? this.data.sharshoor[idx].notes,
        imageUrl: item.imageUrl ?? this.data.sharshoor[idx].imageUrl
      };
      this.scheduleSave();
      return this.data.sharshoor[idx];
    }
    return null;
  }
  deleteSharshoor(id) {
    this.data.sharshoor = this.data.sharshoor.filter(s => s.id !== Number(id));
    this.scheduleSave();
  }

  // --- Reports & Approval Workflow ---
  getReports(sectorFilter = null) {
    let reports = this.data.reports || [];
    if (sectorFilter && sectorFilter !== 'all') {
      const filterStr = String(sectorFilter).toUpperCase();
      reports = reports.filter(r => r.sector?.toUpperCase().includes(filterStr));
    }
    return reports;
  }
  
  addReport(item) {
    const isSector = item.sector?.includes('A') || item.sector?.includes('B');
    const sectorCode = item.sector?.includes('B') ? 'SEC-B' : 'SEC-A';
    const randId = Date.now().toString().slice(-4);
    const newReport = {
      id: item.id || Date.now(),
      reportNumber: item.reportNumber || `REP-${sectorCode}-${randId}`,
      date: item.date || new Date().toISOString(),
      sector: item.sector || (item.sectorCode === 'B' ? 'القطعة B' : 'القطعة A'),
      companyName: item.companyName || (item.sector?.includes('B') ? 'شركة نيوم للمقاولات' : 'شركة الرواد للمقاولات العامة'),
      reportType: item.reportType || 'تقرير يومي شامل',
      shiftType: item.shiftType || 'وردية صباحية',
      crusherName: item.crusherName || (item.sector?.includes('B') ? 'كسارة القطاع (B)' : 'كسارة القطاع (A)'),
      materialName: item.materialName || `${item.reportType || 'تقرير ميداني'} - ${item.sector || 'القطاع'}`,
      productionAmount: Number(item.productionAmount) || 0,
      salesAmount: Number(item.salesAmount) || 0,
      roadMeters: Number(item.roadMeters) || Number(item.salesAmount) || 0,
      fuelAmount: Number(item.fuelAmount) || 0,
      workingEquipmentCount: Number(item.workingEquipmentCount) || 0,
      stoppedEquipmentCount: Number(item.stoppedEquipmentCount) || 0,
      operatingHours: Number(item.operatingHours) || 8,
      uploadedBy: item.uploadedBy || (item.sector?.includes('B') ? 'مشرف القطاع (B)' : 'مشرف القطاع (A)'),
      status: item.status || (isSector ? 'pending_review' : 'approved'),
      approvedBy: item.approvedBy || (item.status === 'approved' ? 'مدير القطاعات' : null),
      notes: item.notes || '',
      imageUrl: item.imageUrl || null,
      fileName: item.fileName || null,
      parsedData: item.parsedData || null
    };

    this.data.reports = this.data.reports || [];
    this.data.reports.unshift(newReport);

    // If report needs approval, trigger alert for Sector Manager
    if (newReport.status === 'pending_review') {
      this.addAlert({
        type: 'warning',
        title: `تقرير وارد قيد الاعتماد من ${newReport.sector}`,
        message: `تم رفع ${newReport.reportType} رقم (${newReport.reportNumber}) من قبل ${newReport.uploadedBy} بانتظار مراجعة واعتماد مدير القطاعات.`
      });
    }

    this.scheduleSave();
    return newReport;
  }

  approveReport(id, approvedBy = 'مدير القطاعات') {
    const report = (this.data.reports || []).find(r => r.id === Number(id));
    if (report) {
      report.status = 'approved';
      report.approvedBy = approvedBy;
      report.approvedAt = new Date().toISOString();

      // Automatically dispatch into operational logs
      if (report.materialName && report.materialName.includes('سولار')) {
        this.addFuel({
          equipmentName: report.crusherName || `خزان ${report.sector}`,
          liters: Number(report.productionAmount) || 0,
          tankSource: `صهريج ${report.sector}`,
          notes: `معتمد من التقرير (${report.reportNumber})`,
          imageUrl: report.imageUrl
        });
      } else if (report.productionAmount > 0) {
        this.addCrusher({
          name: report.crusherName || `كسارة ${report.sector}`,
          sector: report.sector,
          dailyProductionTons: Number(report.productionAmount) || 0,
          sharshoorTons: Number(report.salesAmount) || Math.round((Number(report.productionAmount) || 0) * 0.6),
          notes: `معتمد من التقرير (${report.reportNumber})`,
          imageUrl: report.imageUrl
        });
      }

      this.addAlert({
        type: 'info',
        title: `تم اعتماد تقرير ${report.sector}`,
        message: `قام ${approvedBy} باعتماد تقرير ${report.reportType} رقم (${report.reportNumber}) بنجاح.`
      });

      this.scheduleSave();
      return report;
    }
    return null;
  }

  rejectReport(id, reason = 'مطلوب مراجعة الكميات المدخلة') {
    const report = (this.data.reports || []).find(r => r.id === Number(id));
    if (report) {
      report.status = 'rejected';
      report.reviewNotes = reason;

      this.addAlert({
        type: 'danger',
        title: `طلب مراجعة لتقرير ${report.sector}`,
        message: `طلب مدير القطاعات مراجعة وتعديل التقرير رقم (${report.reportNumber}): ${reason}`
      });

      this.scheduleSave();
      return report;
    }
    return null;
  }

  // --- Road Progress ---
  getRoadProgress(sectorFilter = 'all') {
    let items = this.data.roadProgress || [];
    if (sectorFilter && sectorFilter !== 'all') {
      const filterStr = String(sectorFilter).toUpperCase();
      items = items.filter(i => i.sector && i.sector.toUpperCase().includes(filterStr));
    }
    const totalRoadLength = 226280; // 226.28 KM
    const totalTodayMeters = items.reduce((acc, curr) => acc + (curr.todayMeters || 0), 0);
    const allItems = this.data.roadProgress || [];
    const fdrTotal = allItems.filter(i => i.itemName && i.itemName.includes('إعادة التدوير')).reduce((acc, curr) => acc + (curr.totalMeters || 0), 0) / 2;
    const asphaltTotal = allItems.filter(i => i.itemName && i.itemName.includes('الاسفلت')).reduce((acc, curr) => acc + (curr.totalMeters || 0), 0) / 2;
    const aggregateTotal = allItems.filter(i => i.itemName && i.itemName.includes('أساس حبيبي')).reduce((acc, curr) => acc + (curr.totalMeters || 0), 0) / 2;
    const mcoTotal = allItems.filter(i => i.itemName && i.itemName.includes('التشريب')).reduce((acc, curr) => acc + (curr.totalMeters || 0), 0) / 2;

    const fdrPercentage = totalRoadLength > 0 ? Math.min(100, ((fdrTotal / totalRoadLength) * 100)) : 0;
    const asphaltPercentage = totalRoadLength > 0 ? Math.min(100, ((asphaltTotal / totalRoadLength) * 100)) : 0;
    const aggregatePercentage = totalRoadLength > 0 ? Math.min(100, ((aggregateTotal / totalRoadLength) * 100)) : 0;
    const mcoPercentage = totalRoadLength > 0 ? Math.min(100, ((mcoTotal / totalRoadLength) * 100)) : 0;

    return {
      success: true,
      projectName: 'مشروع صيانة طريق أوباري - غات',
      totalRoadLengthMeters: totalRoadLength,
      totalRoadLengthKm: 226.28,
      kpis: {
        totalTodayMeters,
        fdr: { meters: Math.round(fdrTotal), percentage: fdrPercentage.toFixed(1) },
        asphalt: { meters: Math.round(asphaltTotal), percentage: asphaltPercentage.toFixed(1) },
        aggregateBase: { meters: Math.round(aggregateTotal), percentage: aggregatePercentage.toFixed(1) },
        mco: { meters: Math.round(mcoTotal), percentage: mcoPercentage.toFixed(1) }
      },
      items
    };
  }

  updateRoadProgressItem(id, todayMeters, notes) {
    const item = (this.data.roadProgress || []).find(i => i.id === Number(id));
    if (item) {
      const tMeters = parseFloat(todayMeters) || 0;
      item.previousMeters = item.previousMeters || 0;
      item.todayMeters = tMeters;
      item.totalMeters = item.previousMeters + tMeters;
      item.varianceMeters = tMeters - (item.dailyTarget || 500);
      if (notes !== undefined) item.notes = notes;
      this.scheduleSave();
      return item;
    }
    return null;
  }

  // --- Alerts ---
  getAlerts() {
    return this.data.alerts || [];
  }
  addAlert(alert) {
    const newAlert = {
      id: Date.now(),
      type: alert.type || 'info',
      title: alert.title,
      message: alert.message,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.data.alerts.unshift(newAlert);
    this.scheduleSave();
    return newAlert;
  }
  markAlertAsRead(id) {
    const alert = (this.data.alerts || []).find(a => a.id === Number(id));
    if (alert) {
      alert.isRead = true;
      this.scheduleSave();
      return alert;
    }
    return null;
  }
  markAllAlertsAsRead() {
    (this.data.alerts || []).forEach(a => { a.isRead = true; });
    this.scheduleSave();
  }

  // --- Plans ---
  getPlans() {
    return this.data.plans || [defaultPlan];
  }
  getLatestPlan() {
    return (this.data.plans && this.data.plans.length > 0) ? this.data.plans[0] : defaultPlan;
  }
  addPlan(plan) {
    const newPlan = {
      id: Date.now(),
      title: plan.title || 'خطة التشغيل الميداني',
      planDate: plan.planDate || new Date().toISOString(),
      status: plan.status || 'draft',
      approvedBy: plan.approvedBy || null,
      items: plan.items || []
    };
    this.data.plans.unshift(newPlan);
    this.scheduleSave();
    return newPlan;
  }
  approvePlan(id, approvedBy) {
    const plan = (this.data.plans || []).find(p => p.id === Number(id));
    if (plan) {
      plan.status = 'approved';
      plan.approvedBy = approvedBy || 'مدير القطاعات';
      this.scheduleSave();
      return plan;
    }
    return null;
  }

  // --- Issues ---
  getIssues() {
    return this.data.issues || [];
  }
  addIssue(issue) {
    const newIssue = {
      id: Date.now(),
      sector: issue.sector || 'القطعة A',
      equipmentCode: issue.equipmentCode || '',
      equipmentName: issue.equipmentName || '',
      category: issue.category || 'عطل',
      title: issue.title,
      description: issue.description,
      severity: issue.severity || 'warning',
      suggestedAction: issue.suggestedAction || null,
      status: 'open'
    };
    this.data.issues.unshift(newIssue);
    this.scheduleSave();
    return newIssue;
  }
  updateIssue(id, status) {
    const issue = (this.data.issues || []).find(i => i.id === Number(id));
    if (issue) {
      issue.status = status || 'resolved';
      this.scheduleSave();
      return issue;
    }
    return null;
  }
  deleteIssue(id) {
    this.data.issues = (this.data.issues || []).filter(i => i.id !== Number(id));
    this.scheduleSave();
  }

  // --- Users ---
  getUsers() {
    return this.data.users || [];
  }
  addUser(user) {
    const newUser = {
      id: Date.now(),
      name: user.name,
      email: user.email || `user_${Date.now()}`,
      role: user.role || 'مشرف قطاع',
      sector: user.sector || 'القطعة A',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.scheduleSave();
    return newUser;
  }
  updateUser(id, user) {
    const u = (this.data.users || []).find(x => x.id === Number(id));
    if (u) {
      if (user.name) u.name = user.name;
      if (user.email) u.email = user.email;
      if (user.role) u.role = user.role;
      if (user.sector) u.sector = user.sector;
      u.updatedAt = new Date().toISOString();
      this.scheduleSave();
      return u;
    }
    return null;
  }
  deleteUser(id) {
    this.data.users = (this.data.users || []).filter(x => x.id !== Number(id));
    this.scheduleSave();
  }

  // --- Dedicated Sector Dashboard Summary (Instant 1ms response) ---
  getSectorSummary(sectorKey) {
    const isA = String(sectorKey).toUpperCase().includes('A');
    const sectorCode = isA ? 'A' : 'B';
    const sectorArabic = isA ? 'القطاع (A)' : 'القطاع (B)';
    const totalLengthKm = isA ? 115.36 : 110.92;
    const totalLengthMeters = isA ? 115363 : 110920;

    // Filter items specifically for this sector
    const items = (this.data.roadProgress || []).filter(i => i.sector && i.sector.includes(sectorCode));
    const todayMeters = items.reduce((acc, curr) => acc + (curr.todayMeters || 0), 0);

    const fdrItem = items.find(i => i.itemName && i.itemName.includes('إعادة التدوير'));
    const fdrMeters = fdrItem?.totalMeters || (isA ? 112243 : 107960);
    const fdrP = Math.min(100, parseFloat(((fdrMeters / totalLengthMeters) * 100).toFixed(1)));

    const asphItem = items.find(i => i.itemName && i.itemName.includes('الاسفلت'));
    const asphMeters = asphItem?.totalMeters || (isA ? 107363 : 102560);
    const asphP = Math.min(100, parseFloat(((asphMeters / totalLengthMeters) * 100).toFixed(1)));

    const aggItem = items.find(i => i.itemName && i.itemName.includes('أساس حبيبي'));
    const aggMeters = aggItem?.totalMeters || (isA ? 109373 : 106110);
    const aggP = Math.min(100, parseFloat(((aggMeters / totalLengthMeters) * 100).toFixed(1)));

    const mcoItem = items.find(i => i.itemName && i.itemName.includes('التشريب'));
    const mcoMeters = mcoItem?.totalMeters || (isA ? 109373 : 104930);
    const mcoP = Math.min(100, parseFloat(((mcoMeters / totalLengthMeters) * 100).toFixed(1)));

    const overallP = parseFloat(((fdrP + asphP + aggP + mcoP) / 4).toFixed(1));

    // Sector Crusher
    const crushers = this.getCrushers(sectorCode);
    const crusherProd = crushers.reduce((acc, curr) => acc + (curr.dailyProductionTons || 0), 0);
    const sharshoorTons = crushers.reduce((acc, curr) => acc + (curr.sharshoorTons || 0), 0);

    // Sector Fuel
    const fuelLogs = this.getFuel(sectorCode);
    const fuelLiters = fuelLogs.reduce((acc, curr) => acc + (curr.liters || 0), 0);

    // Sector Equipment
    const eqList = this.getEquipment(sectorCode);
    const activeEq = eqList.filter(e => e.status === 'operational' || e.status === 'active').length;
    const stoppedEq = eqList.filter(e => e.status === 'stopped' || e.status === 'maintenance' || e.status === 'breakdown').length;

    // Sector Reports
    const sectorReports = this.getReports(sectorCode);
    const pendingCount = sectorReports.filter(r => r.status === 'pending_review').length;
    const approvedCount = sectorReports.filter(r => r.status === 'approved').length;

    return {
      success: true,
      sectorCode,
      sectorName: sectorArabic,
      totalLengthKm,
      totalLengthMeters,
      overallPercentage: overallP,
      todayMeters,
      layers: [
        { name: 'طبقة إعادة التدوير (FDR)', meters: fdrMeters, percentage: fdrP, color: '#2563eb' },
        { name: 'طبقة الأساس الحبيبي (الشرشور)', meters: aggMeters, percentage: aggP, color: '#16a34a' },
        { name: 'رش طبقة التشريب (MCO)', meters: mcoMeters, percentage: mcoP, color: '#ea580c' },
        { name: 'طبقة الاسفلت المحسن', meters: asphMeters, percentage: asphP, color: '#7c3aed' }
      ],
      crushers: {
        count: crushers.length || 1,
        productionToday: crusherProd || (isA ? 850 : 620),
        sharshoorToday: sharshoorTons || (isA ? 510 : 372),
        list: crushers
      },
      fuel: {
        dispensedToday: fuelLiters || (isA ? 1850 : 2100),
        balanceLiters: isA ? 28500 : 24000,
        list: fuelLogs.slice(0, 5)
      },
      equipment: {
        total: eqList.length || 12,
        active: activeEq || 10,
        stopped: stoppedEq || 2,
        list: eqList
      },
      reports: {
        total: sectorReports.length,
        pending: pendingCount,
        approved: approvedCount,
        recent: sectorReports.slice(0, 10)
      }
    };
  }

  // --- Executive Dashboard Summary (Overall All Sectors) ---
  getDashboardSummary() {
    const eqList = this.getEquipment();
    const stopped = eqList.filter(e => e.status === 'stopped' || e.status === 'maintenance' || e.status === 'breakdown').length;
    const active = eqList.filter(e => e.status === 'operational' || e.status === 'active').length;
    const totalEq = eqList.length || 18;
    const opHours = eqList.reduce((acc, curr) => acc + (curr.dailyHours || 0), 0);

    const fuelList = this.getFuel();
    const fuelTotal = fuelList.reduce((acc, curr) => acc + (curr.liters || 0), 0);
    const sectorAFuel = fuelList.filter(f => f.tankSource?.includes('A') || f.sector?.includes('A')).reduce((acc, curr) => acc + (curr.liters || 0), 0);
    const sectorBFuel = fuelList.filter(f => f.tankSource?.includes('B') || f.sector?.includes('B')).reduce((acc, curr) => acc + (curr.liters || 0), 0);

    const crusherLogs = this.getCrushers();
    const prodTotal = crusherLogs.reduce((acc, curr) => acc + (curr.dailyProductionTons || 0), 0);
    const sectorAProd = crusherLogs.filter(c => c.sector?.includes('A')).reduce((acc, curr) => acc + (curr.dailyProductionTons || 0), 0);
    const sectorBProd = crusherLogs.filter(c => c.sector?.includes('B')).reduce((acc, curr) => acc + (curr.dailyProductionTons || 0), 0);

    const sharshoorLogs = this.getSharshoor();
    const sharshoorTotal = sharshoorLogs.reduce((acc, curr) => acc + (curr.amountTons || 0), 0) || Math.round(prodTotal * 0.6);

    const issuesList = this.getIssues().filter(i => i.status !== 'resolved');
    const roadRes = this.getRoadProgress('all');
    const allReports = this.getReports();
    const pendingReportsCount = allReports.filter(r => r.status === 'pending_review').length;

    return {
      success: true,
      totalProduction: prodTotal,
      totalFuel: fuelTotal,
      totalSharshoor: sharshoorTotal,
      totalEquipment: totalEq,
      activeEquipment: active || 15,
      stoppedEquipment: stopped || 3,
      operatingHours: opHours || 144,
      sectorAFuel,
      sectorBFuel,
      sectorAProd,
      sectorBProd,
      pendingReportsCount,
      recentReports: allReports.slice(0, 6),
      recentAlerts: this.getAlerts().slice(0, 4),
      urgentIssues: issuesList.slice(0, 3),
      tomorrowPlan: this.getLatestPlan(),
      roadProgress: roadRes
    };
  }
}

export const store = new Store();
export default store;
