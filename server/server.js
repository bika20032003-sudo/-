import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool, { testDbConnection } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── 1. ملخص المؤشرات العامة ───────────────────────────────────
app.get('/api/summary', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM project_summary LIMIT 1');
    if (rows.length > 0) {
      const s = rows[0];
      return res.json({
        projectTitle: s.project_title,
        agency: s.agency_name,
        initiative: s.initiative,
        totalLengthKm: Number(s.total_length_km),
        overallProgress: Number(s.overall_progress),
        plannedProgress: Number(s.planned_progress),
        totalBudgetLyd: Number(s.total_budget_lyd),
        spentBudgetLyd: Number(s.spent_budget_lyd),
        activeContractorsCount: s.active_contractors_count,
        totalFleetMachinery: s.total_fleet_machinery,
        totalWorkforce: s.total_workforce,
        asphaltPavedKm: Number(s.asphalt_paved_km),
        solarPolesTotal: s.solar_poles_total,
        lastUpdated: s.updated_at
      });
    }
    return res.status(404).json({ error: 'Summary not found' });
  } catch (error) {
    console.error('Error in /api/summary:', error);
    return res.status(500).json({ error: 'Database query failed' });
  }
});

// ── 2. قطاعات الطريق الـ 4 ────────────────────────────────────
app.get('/api/sectors', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sectors ORDER BY id ASC');
    const formatted = rows.map(sec => ({
      id: sec.sector_code,
      name: sec.name,
      lengthKm: Number(sec.length_km),
      progress: Number(sec.progress_rate),
      contractor: sec.contractor_name,
      residentEngineer: sec.resident_engineer,
      status: sec.status,
      statusColor: sec.status_color,
      asphaltThicknessCm: Number(sec.asphalt_thickness_cm),
      solarPolesInstalled: sec.solar_poles_installed,
      machineryCount: sec.machinery_count,
      activeWorkers: sec.active_workers,
      image: sec.image_url,
      notes: sec.technical_notes
    }));
    return res.json(formatted);
  } catch (error) {
    console.error('Error in /api/sectors:', error);
    return res.status(500).json({ error: 'Database query failed' });
  }
});

// ── 3. الشركات والآليات الميدانية ──────────────────────────────
app.get('/api/contractors', async (req, res) => {
  try {
    const [contractorsRows] = await pool.query('SELECT * FROM contractors ORDER BY id ASC');
    const [machineryRows] = await pool.query('SELECT * FROM machinery_fleet ORDER BY id ASC');

    const result = contractorsRows.map(c => {
      const machinery = machineryRows
        .filter(m => m.contractor_id === c.id)
        .map(m => ({
          type: m.machinery_type,
          count: m.count,
          status: m.operational_status
        }));

      return {
        id: c.code,
        name: c.name,
        sector: c.assigned_sector,
        contractValue: c.contract_value_formatted,
        completion: Number(c.completion_rate),
        qualityScore: c.quality_score,
        machinery: machinery
      };
    });

    return res.json(result);
  } catch (error) {
    console.error('Error in /api/contractors:', error);
    return res.status(500).json({ error: 'Database query failed' });
  }
});

// ── 4. السجل التاريخي للإنجاز الشهري ──────────────────────────
app.get('/api/progress-history', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM monthly_progress_history ORDER BY order_index ASC');
    const formatted = rows.map(r => ({
      month: r.month_name,
      planned: Number(r.planned_progress),
      actual: Number(r.actual_progress),
      budget: Number(r.budget_spent_millions)
    }));
    return res.json(formatted);
  } catch (error) {
    console.error('Error in /api/progress-history:', error);
    return res.status(500).json({ error: 'Database query failed' });
  }
});

// ── 5. فحص صحة الخادم وقاعدة البيانات ─────────────────────────
app.get('/api/health', async (req, res) => {
  const dbStatus = await testDbConnection();
  return res.json({
    status: 'ok',
    database: dbStatus ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ── تشغيل الخادم ──────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`🚀 خادم البوابة الإلكترونية يعمل على المنفذ: http://localhost:${PORT}`);
  await testDbConnection();
});
