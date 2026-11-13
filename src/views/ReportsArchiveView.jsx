import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Printer, Plus, RefreshCw, FileSpreadsheet, 
  CheckCircle2, Clock, AlertTriangle, Eye, Edit2, Trash2, 
  Building2, Milestone, Factory, Fuel, Truck, Layers, Filter, Calendar, Download, CalendarRange,
  FolderArchive, User, Users, ShieldCheck, Lock, Send
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { fastFetch } from '../utils/apiCache.js';
import { deleteReportFromIndexedDB } from '../utils/secureDatabase.js';
import { OfficialPrintModal } from '../components/OfficialPrintModal';
import { canAccessTwoPhaseReport, canAccessGeneralArchive, isReportOwnedByEngineer, isDevUser } from '../utils/permissionUtils';
import { deduplicateReportsList, sanitizeLocalReportsStorage, areReportsIdentical } from '../utils/reportDeduplication';
import { CreateReportModal } from '../components/CreateReportModal';
import { CreateTargetedWorksReportModal } from '../components/CreateTargetedWorksReportModal';
import { getAllSupervisors, canonicalizeUsername, getSupervisorInfo } from '../utils/supervisionTeam.js';

const OFFICIAL_ENGINEERS_FILTER_LIST = [
  { id: 'all', name: 'كافة المهندسين والمشرفين (عرض شامل)', role: 'الكل' },
  { id: 'salah_alarabi', name: 'م. صلاح العربي', role: 'مشرف المرحلة الأولى' },
  { id: 'issa_altahir', name: 'م. عيسى الطاهر', role: 'مشرف المرحلة الثانية' },
  { id: 'abrikaw', name: 'م. عبدالسلام ابريكاو', role: 'رئيس جهاز الإشراف' },
  { id: 'saleh_quality', name: 'م. صالح حماد', role: 'مسؤول الجودة' },
  { id: 'project_manager', name: 'م. عبدالرحمن الأنصاري', role: 'مدير المشروع' },
  { id: 'fuel_officer', name: 'مسؤول الوقود والمحروقات', role: 'المواقع 107 و240' },
  { id: 'honi', name: 'م. مروان الهوني', role: 'إشراف ميداني' }
];

const getOfficialForwardList = () => [
  { username: 'all', name: 'كافة أعضاء جهاز الإشراف (إحالة شاملة)', role: 'الإشراف العام' },
  ...getAllSupervisors()
];

export const ReportsArchiveView = ({ currentUser, onNavigateTab, initialMode = 'personal' }) => {
  // Check authorization for General Archive (مدير المشروع + م. صالح فقط)
  const canAccessGeneral = canAccessGeneralArchive(currentUser);

  // Archive Mode: 'general' (الأرشيف العام لكافة التقارير) | 'personal' (أرشيف تقاريري الخاصة)
  const [archiveMode, setArchiveMode] = useState(() => {
    if (canAccessGeneral) {
      return initialMode === 'general' ? 'general' : 'personal';
    }
    return 'personal';
  });

  // Filter states
  const [filterEngineer, setFilterEngineer] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Data state
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedReportForPrint, setSelectedReportForPrint] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewDetailsReport, setViewDetailsReport] = useState(null);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [editingTargetedReport, setEditingTargetedReport] = useState(null);

  // Referral / Forward State
  const [forwardModalReport, setForwardModalReport] = useState(null);
  const [forwardRecipient, setForwardRecipient] = useState('all');
  const [forwardNote, setForwardNote] = useState('');
  const [isForwarding, setIsForwarding] = useState(false);
  const [forwardSuccessMessage, setForwardSuccessMessage] = useState(null);

  // Edit Modal State
  const [editingReport, setEditingReport] = useState(null);
  const [editFormData, setEditFormData] = useState({
    reportNumber: '',
    date: '',
    sector: 'المرحلة الأولى',
    companyName: '',
    reportType: 'تقرير يومي شامل',
    materialName: '',
    productionAmount: 0,
    salesAmount: 0,
    roadMeters: 0,
    fuelAmount: 0,
    status: 'approved',
    notes: ''
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Sync mode if initialMode prop or permissions change
  useEffect(() => {
    if (!canAccessGeneral && archiveMode !== 'personal') {
      setArchiveMode('personal');
    } else if (canAccessGeneral && initialMode) {
      setArchiveMode(initialMode);
    }
  }, [canAccessGeneral, initialMode]);

  const handleOpenEdit = (r) => {
    if (r.isTargetedWorksReport || r.reportType === 'تقرير الأعمال المستهدفة') {
      setEditingTargetedReport(r);
      return;
    }
    setEditingReport(r);
    setEditFormData({
      reportNumber: r.reportNumber || '',
      date: (r.date || '').split('T')[0] || new Date().toISOString().split('T')[0],
      sector: r.sector || 'المرحلة الأولى',
      companyName: r.companyName || 'جهاز مشروعات المواصلات',
      reportType: r.reportType || 'تقرير يومي شامل',
      materialName: r.materialName || '',
      productionAmount: r.productionAmount || 0,
      salesAmount: r.salesAmount || 0,
      roadMeters: r.roadMeters || 0,
      fuelAmount: r.fuelAmount || 0,
      status: r.status || 'approved',
      notes: r.notes || ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingReport) return;
    setIsSavingEdit(true);
    try {
      const targetId = editingReport.id;
      const targetNum = editingReport.reportNumber;

      try {
        await fetch(`/api/reports/${targetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editFormData)
        });
      } catch (apiErr) {
        console.warn('API error, saving locally:', apiErr);
      }

      const updatedFull = { ...editingReport, ...editFormData };
      setReports(prev => prev.map(r => (String(r.id) === String(targetId) || String(r.reportNumber) === String(targetNum)) ? updatedFull : r));

      try {
        const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
        const updatedLocal = local.map(r => (String(r.id) === String(targetId) || String(r.reportNumber) === String(targetNum)) ? updatedFull : r);
        localStorage.setItem('local_reports', JSON.stringify(updatedLocal));

        if (editingReport.isExecutiveProgressReport || editingReport.reportCategory === 'executive' || (editingReport.reportType || '').includes('تنفيذي')) {
          localStorage.setItem('executive_progress_data', JSON.stringify(updatedFull));
          window.dispatchEvent(new CustomEvent('executive-progress-updated', { detail: updatedFull }));
        } else if (editingReport.isFuelReport || editingReport.reportCategory === 'fuel' || (editingReport.reportType || '').includes('وقود')) {
          localStorage.setItem('fuel_daily_report_data', JSON.stringify(updatedFull));
          window.dispatchEvent(new CustomEvent('fuel-updated', { detail: updatedFull }));
        } else if (editingReport.isTwoPhaseProgressReport || editingReport.reportCategory === 'two_phase' || (editingReport.reportType || '').includes('المرحلتين')) {
          localStorage.setItem('two_phase_report_data', JSON.stringify(updatedFull));
          window.dispatchEvent(new CustomEvent('two-phase-updated', { detail: updatedFull }));
        } else if (editingReport.isRoadProgressReport || editingReport.reportCategory === 'road' || (editingReport.reportType || '').includes('طريق')) {
          localStorage.setItem('road_daily_report_data', JSON.stringify(updatedFull));
          window.dispatchEvent(new CustomEvent('road-progress-updated', { detail: updatedFull }));
        }
      } catch (storageErr) {}

      window.dispatchEvent(new CustomEvent('report-updated', { detail: updatedFull }));
      window.dispatchEvent(new CustomEvent('reports-updated', { detail: updatedFull }));
      setEditingReport(null);
    } catch (err) {
      console.error('Failed to update report:', err);
      alert('حدث خطأ أثناء حفظ التعديلات.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Referral / Forward Report Handler
  const handleConfirmForward = async () => {
    if (!forwardModalReport) return;
    setIsForwarding(true);
    try {
      const rep = forwardModalReport;
      const forwardList = getOfficialForwardList();
      const isAll = forwardRecipient === 'all';
      const recipients = isAll
        ? forwardList.filter(u => u.username !== 'all')
        : [forwardList.find(u => u.username === forwardRecipient) || forwardList[1]];

      const senderCanon = canonicalizeUsername(currentUser?.username) || 'user';
      const senderInfo = getSupervisorInfo(senderCanon);
      const newMsgs = [];
      for (const targetUser of recipients) {
        const messagePayload = {
          id: 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
          fromUsername: senderCanon,
          fromName: currentUser?.name || senderInfo.name || 'جهاز الإشراف',
          fromRole: currentUser?.title || currentUser?.role || senderInfo.role || 'جهاز الإشراف',
          toUsername: targetUser.username,
          toName: targetUser.name,
          toRole: targetUser.role,
          type: 'إحالة تقرير رسمي معتمد',
          subject: `إحالة ${rep.title || rep.reportType || 'تقرير رسمي'} - رقم (${rep.reportNumber || rep.id})`,
          content: forwardNote.trim() || `نحيل إليكم رسمياً نسخة معتمدة من ${rep.title || rep.reportType || 'التقرير الميداني'} برقم (${rep.reportNumber || rep.id}) بموقع ${rep.sector || 'طريق أوباري - غات'} للإحاطة والمتابعة الهندسية.`,
          reportId: rep.id,
          reportNumber: rep.reportNumber,
          reportData: rep,
          createdAt: new Date().toISOString(),
          isRead: false
        };
        newMsgs.push(messagePayload);
        try {
          await fastFetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messagePayload)
          });
        } catch (_) {}
      }

      try {
        const locMsgs = JSON.parse(localStorage.getItem('system_messages') || '[]');
        localStorage.setItem('system_messages', JSON.stringify([...newMsgs, ...locMsgs]));
        const userMsgs = JSON.parse(localStorage.getItem('local_messages') || '[]');
        localStorage.setItem('local_messages', JSON.stringify([...newMsgs, ...userMsgs]));
      } catch (_) {}

      window.dispatchEvent(new CustomEvent('messages-updated'));

      // Record referral in local_reports
      try {
        const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
        const updatedLocal = local.map(r => {
          if (r.reportNumber === rep.reportNumber || String(r.id) === String(rep.id)) {
            return {
              ...r,
              referredTo: isAll ? 'كافة أعضاء جهاز الإشراف' : recipients[0].name,
              referredAt: new Date().toISOString(),
              referredBy: currentUser?.name || 'جهاز الإشراف'
            };
          }
          return r;
        });
        localStorage.setItem('local_reports', JSON.stringify(updatedLocal));
        window.dispatchEvent(new CustomEvent('report-updated', { detail: rep }));
      } catch (_) {}

      const repNameText = isAll ? 'كافة أعضاء جهاز الإشراف' : recipients[0].name;
      setForwardModalReport(null);
      setForwardNote('');
      setForwardSuccessMessage(`تمت إحالة التقرير رقم (${rep.reportNumber || rep.id}) بنجاح إلى (${repNameText})!`);
      setTimeout(() => setForwardSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error forwarding report:', err);
      alert('حدث خطأ أثناء إحالة التقرير.');
    } finally {
      setIsForwarding(false);
    }
  };

  // Fetch Reports
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const url = '/api/reports';
      
      const res = await fastFetch(url);
      let list = [];
      if (res && res.reports) {
        list = res.reports;
      } else if (Array.isArray(res)) {
        list = res;
      }
      
      // Proactively pull fuel report if not yet in reports list
      const hasFuel = list.some(r => r && (r.isFuelReport || r.reportType === 'تقرير كميات الوقود اليومية' || r.reportCategory === 'fuel'));
      if (!hasFuel) {
        try {
          const fuelRes = await fastFetch('/api/fuel-daily-report');
          if (fuelRes && fuelRes.data && (fuelRes.data.fuelItems || fuelRes.data.reportNumber)) {
            list.unshift({
              ...fuelRes.data,
              isFuelReport: true,
              reportType: 'تقرير كميات الوقود اليومية',
              reportCategory: 'fuel'
            });
          }
        } catch (_) {}
      }

      // Merge with locally created reports, filter deleted, and strictly deduplicate
      try {
        let deletedSet = new Set(JSON.parse(localStorage.getItem('deleted_report_ids') || '[]'));
        if (res && Array.isArray(res.deletedReportIds)) {
          res.deletedReportIds.forEach(id => deletedSet.add(String(id)));
        }

        // Active server reports must never be suppressed by a stale blacklist
        list.forEach(r => {
          if (r?.id) deletedSet.delete(String(r.id));
          if (r?.reportNumber) deletedSet.delete(String(r.reportNumber));
        });
        localStorage.setItem('deleted_report_ids', JSON.stringify(Array.from(deletedSet)));

        const local = sanitizeLocalReportsStorage();
        local.forEach(r => {
          if (r?.id) deletedSet.delete(String(r.id));
          if (r?.reportNumber) deletedSet.delete(String(r.reportNumber));
        });

        // Merge backend list with sanitized local reports
        const combined = [...local, ...list].filter(r => 
          r && 
          !deletedSet.has(String(r.id)) && 
          !deletedSet.has(String(r.reportNumber))
        );

        // Strict composite deduplication: guarantees no duplicates by ID, Report Number, or (Date + Type + Sector)
        list = deduplicateReportsList(combined);
      } catch (storageErr) {
        console.warn('Storage error in archive:', storageErr);
      }

      setReports(list);
    } catch (err) {
      console.error('Failed to load reports archive', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically update archive mode & refresh reports when currentUser changes
  useEffect(() => {
    const canGen = canAccessGeneralArchive(currentUser);
    setArchiveMode(canGen ? 'general' : 'personal');
    fetchReports();
  }, [currentUser]);

  useEffect(() => {
    fetchReports();
    const handleGlobalDelete = (e) => {
      const delId = e.detail?.id;
      const delNum = e.detail?.reportNumber;
      if (delId || delNum) {
        setReports(prev => prev.filter(r => String(r.id) !== delId && String(r.reportNumber) !== delNum));
      }
    };
    const handleGlobalSaved = () => {
      fetchReports();
    };
    window.addEventListener('report-deleted', handleGlobalDelete);
    window.addEventListener('report-saved', handleGlobalSaved);
    window.addEventListener('report-updated', handleGlobalSaved);
    window.addEventListener('reports-updated', handleGlobalSaved);
    window.addEventListener('fuel-updated', handleGlobalSaved);
    window.addEventListener('two-phase-updated', handleGlobalSaved);
    window.addEventListener('road-progress-updated', handleGlobalSaved);
    window.addEventListener('storage', handleGlobalSaved);
    const autoInterval = setInterval(handleGlobalSaved, 8000);
    return () => {
      window.removeEventListener('report-deleted', handleGlobalDelete);
      window.removeEventListener('report-saved', handleGlobalSaved);
      window.removeEventListener('report-updated', handleGlobalSaved);
      window.removeEventListener('reports-updated', handleGlobalSaved);
      window.removeEventListener('fuel-updated', handleGlobalSaved);
      window.removeEventListener('two-phase-updated', handleGlobalSaved);
      window.removeEventListener('road-progress-updated', handleGlobalSaved);
      window.removeEventListener('storage', handleGlobalSaved);
      clearInterval(autoInterval);
    };
  }, []);

  // Filtering Logic
  const filteredReports = reports.filter((r) => {
    // 1. Personal Archive Filter (Each engineer sees ONLY their own reports)
    if (archiveMode === 'personal') {
      if (!isReportOwnedByEngineer(r, currentUser)) {
        return false;
      }
    } else {
      // General Archive: STRICT ACCESS CONTROL (مدير المشروع وم. صالح فقط)
      if (!canAccessGeneral) return false;

      // Engineer filter in General Archive
      if (filterEngineer !== 'all') {
        const engObj = OFFICIAL_ENGINEERS_FILTER_LIST.find(e => e.id === filterEngineer);
        const dummyEngineer = {
          username: filterEngineer,
          name: engObj?.name || filterEngineer,
          role: filterEngineer === 'fuel_officer' ? 'مسؤول الوقود' : ''
        };
        if (!isReportOwnedByEngineer(r, dummyEngineer)) {
          return false;
        }
      }
    }

    // 2. Status filter
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;

    // 3. Two-Phase report visibility restriction (General Archive restricts to PM & Saleh, but creator always sees their own report)
    if (!canAccessTwoPhaseReport(currentUser)) {
      const isCreatorOrOwner = isReportOwnedByEngineer(r, currentUser);
      if (!isCreatorOrOwner && (r.isTwoPhaseProgressReport || r.reportType === 'تقرير إنجاز المرحلتين' || r.reportCategory === 'two_phase' || r.title?.includes('المرحلتين'))) {
        return false;
      }
    }

    // 4. Type filter
    if (typeFilter !== 'all') {
      if (typeFilter === 'الموقف التنفيذي') {
        if (!r.isExecutiveProgressReport && r.reportType !== 'الموقف التنفيذي' && !String(r.title || '').includes('تنفيذي') && r.reportCategory !== 'executive') return false;
      } else if (typeFilter === 'تقرير إنجاز المرحلتين') {
        if (!r.isTwoPhaseProgressReport && r.reportType !== 'تقرير إنجاز المرحلتين' && !r.title?.includes('المرحلتين')) return false;
      } else if (typeFilter === 'تقرير كميات الوقود اليومية') {
        if (!r.isFuelReport && r.reportType !== 'تقرير كميات الوقود اليومية' && r.title !== 'تقرير كميات الوقود اليومية') return false;
      } else if (typeFilter === 'تقرير الأعمال المستهدفة') {
        if (!r.isTargetedWorksReport && r.reportType !== 'تقرير الأعمال المستهدفة') return false;
      } else if (r.reportType !== typeFilter) {
        return false;
      }
    }

    // 5. Date range filter
    if (startDate && r.date && r.date.split('T')[0] < startDate) return false;
    if (endDate && r.date && r.date.split('T')[0] > endDate) return false;

    // 6. Search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const combined = `${r.reportNumber || ''} ${r.materialName || ''} ${r.reportType || ''} ${r.uploadedBy || ''} ${r.engineer || ''} ${r.sectorDirector || ''} ${r.notes || ''} ${r.sector || ''}`.toLowerCase();
      if (!combined.includes(q)) return false;
    }

    return true;
  });

  // Summary Metrics calculation
  const totalReportsCount = filteredReports.length;
  const approvedCount = filteredReports.filter(r => r.status === 'approved').length;
  const pendingCount = filteredReports.filter(r => r.status === 'pending_review').length;
  
  const totalRoadMeters = filteredReports.reduce((acc, r) => acc + (Number(r.roadMeters) || Number(r.salesAmount) || 0), 0);
  const totalFuelDispensed = filteredReports.reduce((acc, r) => acc + (Number(r.fuelAmount) || Number(r.totalDispatchedLiters) || 0), 0);

  // Export to Excel
  const handleExportExcel = () => {
    const isGen = archiveMode === 'general';
    const data = filteredReports.map((r, idx) => ({
      'م': idx + 1,
      'رقم التقرير': r.reportNumber || `#REP-${r.id}`,
      'التاريخ': r.date ? r.date.split('T')[0] : '',
      'المرحلة': (r.sector || '').includes('الثانية') ? 'المرحلة الثانية' : 'المرحلة الأولى',
      'نوع التقرير': r.reportType || 'شامل',
      'بيان الأعمال المنفذة (كل بند وحده)': Array.isArray(r.items) && r.items.length > 0
        ? r.items.map(it => `${it.item || it.name}: ${it.length || 0} م.ط`).join(' | ')
        : Array.isArray(r.combinedItems) && r.combinedItems.length > 0
        ? r.combinedItems.filter(c => Number(c.todayMeters) > 0).map(c => `${c.name}: ${c.todayMeters} م.ط`).join(' | ')
        : (r.roadMeters ? `${r.roadMeters} م.ط` : '—'),
      'الوقود المنصرف (لتر)': Number(r.fuelAmount || r.totalDispatchedLiters) || 0,
      'المشرف / المهندس المُعد': r.uploadedBy || r.engineer || r.sectorDirector || '',
      'حالة الاعتماد': r.status === 'approved' ? 'معتمد رسمياً' : r.status === 'rejected' ? 'مطلوب تعديل' : 'قيد المراجعة',
      'المعتمد بواسطة': r.approvedBy || '',
      'الملاحظات': r.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    const sheetTitle = isGen ? 'الأرشيف العام للمشروع' : `أرشيف تقارير ${currentUser?.name || 'المهندس'}`;
    const fileTitle = isGen 
      ? `الأرشيف_العام_لتقارير_المشروع_${new Date().toISOString().split('T')[0]}.xlsx`
      : `أرشيف_تقارير_${currentUser?.name || 'المهندس'}_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.utils.book_append_sheet(wb, ws, sheetTitle);
    XLSX.writeFile(wb, fileTitle);
  };

  // Delete Report confirmation handler
  const confirmDeleteReport = async () => {
    if (!reportToDelete) return;
    setIsDeleting(true);
    const targetId = String(reportToDelete.id || '');
    const targetNum = String(reportToDelete.reportNumber || '');

    try {
      const deleteIdentifier = targetId || targetNum;
      if (deleteIdentifier) {
        await fastFetch(`/api/reports/${deleteIdentifier}`, { method: 'DELETE' }).catch(() => {});
      }

      if (targetId) await deleteReportFromIndexedDB(targetId);
      if (targetNum) await deleteReportFromIndexedDB(targetNum);

      // 1. Clear dedicated section storage if this was a section document
      try {
        if (reportToDelete.isFuelReport || reportToDelete.reportType === 'تقرير كميات الوقود اليومية') {
          localStorage.removeItem('fuel_daily_report_data');
        }
        if (reportToDelete.isRoadProgressReport || reportToDelete.reportType === 'تقرير أعمال الطريق اليومي') {
          localStorage.removeItem('road_daily_report_data');
        }
        if (reportToDelete.isExecutiveProgressReport || reportToDelete.reportType === 'الموقف التنفيذي' || reportToDelete.reportCategory === 'executive') {
          localStorage.removeItem('executive_progress_data');
        }
        if (reportToDelete.isTwoPhaseProgressReport || reportToDelete.reportType === 'تقرير إنجاز المرحلتين') {
          localStorage.removeItem('two_phase_report_data');
        }
        if (reportToDelete.isTargetedWorksReport || reportToDelete.reportType === 'تقرير الأعمال المستهدفة') {
          localStorage.removeItem('targeted_works_report_data');
        }
      } catch (secErr) {
        console.warn('Error clearing section storage on delete:', secErr);
      }

      // 2. Remove from local_reports using both identity match and ID/number
      try {
        const local = JSON.parse(localStorage.getItem('local_reports') || '[]');
        const updatedLocal = local.filter(r => {
          if (!r) return false;
          if (areReportsIdentical(r, reportToDelete)) return false;
          const rId = String(r.id || '');
          const rNum = String(r.reportNumber || '');
          return rId !== targetId && rNum !== targetNum && (targetNum ? rId !== targetNum : true) && (targetId ? rNum !== targetId : true);
        });
        localStorage.setItem('local_reports', JSON.stringify(updatedLocal));
      } catch (storageErr) {
        console.error('LocalStorage error updating local_reports:', storageErr);
      }

      // 3. Record in deleted_report_ids
      try {
        const deleted = JSON.parse(localStorage.getItem('deleted_report_ids') || '[]');
        if (targetId && !deleted.includes(targetId)) deleted.push(targetId);
        if (targetNum && !deleted.includes(targetNum)) deleted.push(targetNum);
        localStorage.setItem('deleted_report_ids', JSON.stringify(deleted));
      } catch (delErr) {
        console.error('LocalStorage error updating deleted_report_ids:', delErr);
      }

      // 4. Update UI state
      setReports(prev => prev.filter(r => {
        if (!r) return false;
        if (areReportsIdentical(r, reportToDelete)) return false;
        const rId = String(r.id || '');
        const rNum = String(r.reportNumber || '');
        if (targetId && rId === targetId) return false;
        if (targetNum && rNum === targetNum) return false;
        if (targetNum && rId === targetNum) return false;
        if (targetId && rNum === targetId) return false;
        return true;
      }));

      window.dispatchEvent(new CustomEvent('report-deleted', { detail: { id: targetId, reportNumber: targetNum } }));
      setReportToDelete(null);
    } catch (e) {
      console.error('Error during report deletion:', e);
      alert('حدث خطأ أثناء الحذف.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAllReports = async () => {
    setIsClearingAll(true);
    try {
      await fastFetch('/api/reports/clear-all', { method: 'DELETE' });
      
      const allIds = reports.map(r => String(r.id || r.reportNumber)).filter(Boolean);
      try {
        const deleted = JSON.parse(localStorage.getItem('deleted_report_ids') || '[]');
        const updated = Array.from(new Set([...deleted, ...allIds]));
        localStorage.setItem('deleted_report_ids', JSON.stringify(updated));
        localStorage.setItem('local_reports', JSON.stringify([]));
        localStorage.removeItem('two_phase_report_data');
        localStorage.removeItem('road_daily_report_data');
        localStorage.removeItem('fuel_daily_report_data');
        localStorage.removeItem('targeted_works_report_data');
        localStorage.removeItem('executive_progress_data');
      } catch (_) {}

      setReports([]);
      setIsClearAllModalOpen(false);
      window.dispatchEvent(new CustomEvent('reports-updated'));
      window.dispatchEvent(new CustomEvent('report-deleted'));
      setForwardSuccessMessage('تم تفريغ وحذف كافة التقارير بنجاح من الأرشيف والسيرفر المركزي!');
      setTimeout(() => setForwardSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error clearing all reports:', err);
      alert('حدث خطأ أثناء إفراغ الأرشيف.');
    } finally {
      setIsClearingAll(false);
    }
  };

  const myPersonalReportsCount = reports.filter(r => isReportOwnedByEngineer(r, currentUser)).length;

  return (
    <div className="view-content" style={{ maxWidth: '1380px', margin: '0 auto', paddingBottom: '3.5rem' }}>
      
      {/* Referral Success Alert */}
      {forwardSuccessMessage && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          padding: '0.85rem 1.25rem',
          borderRadius: '10px',
          fontWeight: 800,
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <CheckCircle2 size={18} color="#22c55e" />
          <span>{forwardSuccessMessage}</span>
        </div>
      )}

      {/* 1. Mode Switcher (Visible ONLY to Project Manager and Eng. Saleh) */}
      {canAccessGeneral && (
        <div style={{
          display: 'flex',
          gap: '8px',
          background: '#f1f5f9',
          padding: '6px',
          borderRadius: '12px',
          marginBottom: '1rem',
          width: 'fit-content',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <button
            type="button"
            onClick={() => setArchiveMode('general')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 900,
              fontSize: '0.86rem',
              cursor: 'pointer',
              background: archiveMode === 'general' ? '#1e3a8a' : 'transparent',
              color: archiveMode === 'general' ? '#ffffff' : '#475569',
              border: 'none',
              boxShadow: archiveMode === 'general' ? '0 2px 8px rgba(30,58,138,0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <FolderArchive size={16} />
            <span>الأرشيف العام لكافة تقارير المشروع</span>
            <span style={{
              background: archiveMode === 'general' ? '#2563eb' : '#cbd5e1',
              color: '#ffffff',
              fontSize: '0.72rem',
              padding: '1px 7px',
              borderRadius: '10px'
            }}>
              {reports.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setArchiveMode('personal')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 900,
              fontSize: '0.86rem',
              cursor: 'pointer',
              background: archiveMode === 'personal' ? '#1e3a8a' : 'transparent',
              color: archiveMode === 'personal' ? '#ffffff' : '#475569',
              border: 'none',
              boxShadow: archiveMode === 'personal' ? '0 2px 8px rgba(30,58,138,0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <User size={16} />
            <span>أرشيف تقاريري الشخصية</span>
            <span style={{
              background: archiveMode === 'personal' ? '#2563eb' : '#cbd5e1',
              color: '#ffffff',
              fontSize: '0.72rem',
              padding: '1px 7px',
              borderRadius: '10px'
            }}>
              {myPersonalReportsCount}
            </span>
          </button>
        </div>
      )}

      {/* 2. Header Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.35rem 1.85rem',
        marginBottom: '1.25rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: archiveMode === 'general' ? 'linear-gradient(135deg, #1e3a8a, #2563eb)' : 'linear-gradient(135deg, #059669, #10b981)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: archiveMode === 'general' ? '0 4px 12px rgba(37,99,235,0.3)' : '0 4px 12px rgba(16,185,129,0.3)'
            }}>
              {archiveMode === 'general' ? <FolderArchive size={26} /> : <FileText size={26} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  {archiveMode === 'general' 
                    ? 'الأرشيف العام لكافة تقارير المشروع (الإشراف العام)' 
                    : `الأرشيف الخاص بي — ${currentUser?.name || 'المهندس المشرف'}`
                  }
                </h2>
                <span style={{
                  background: archiveMode === 'general' ? '#dbeafe' : '#dcfce7',
                  color: archiveMode === 'general' ? '#1e40af' : '#15803d',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {archiveMode === 'general' ? <ShieldCheck size={13} /> : <User size={13} />}
                  <span>
                    {archiveMode === 'general' 
                      ? 'صلاحية خاصة: مدير المشروع ومسؤول الجودة م. صالح' 
                      : `الأرشيف الخاص (مفعل ونشط) — ${currentUser?.name || ''}`
                    }
                  </span>
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                {archiveMode === 'general'
                  ? 'السجل الشامل الموحد لجميع التقارير الميدانية واليومية المعتمدة الصادرة عن كافة المهندسين بالمشروع'
                  : `السجل المستقل والخاص بالتقارير المعتمدة الصادرة عنك شخصياً (${currentUser?.name || ''}) والمحفوظة باسمك`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              padding: '0.65rem 1.4rem',
              borderRadius: '10px',
              fontWeight: 900,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <Plus size={17} />
            <span>إنشاء تقرير جديد ✍️</span>
          </button>

          <button
            onClick={handleExportExcel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#f8fafc',
              color: '#166534',
              border: '1px solid #bbf7d0',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet size={17} color="#16a34a" />
            <span>تصدير Excel</span>
          </button>

          {(canAccessGeneral || isDevUser(currentUser)) && reports.length > 0 && (
            <button
              onClick={() => setIsClearAllModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#fff1f2',
                color: '#e11d48',
                border: '1px solid #fecdd3',
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="إفراغ الأرشيف ومسح كافة التقارير التجريبية نهائياً من كافة الأجهزة"
            >
              <Trash2 size={16} color="#e11d48" />
              <span>إفراغ الأرشيف 🗑️</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. KPI Summary Badges for Archive */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.85rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.9rem 1.15rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 800 }}>
            {archiveMode === 'general' ? 'إجمالي التقارير بالأرشيف العام' : 'تقاريري المسجلة بالأرشيف'}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', marginTop: '0.2rem' }}>
            {totalReportsCount} <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>تقرير</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '0.9rem 1.15rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.76rem', color: '#166534', fontWeight: 800 }}>تقارير معتمدة رسمياً</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#16a34a', marginTop: '0.2rem' }}>
            {approvedCount} <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d' }}>معتمد</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #fde68a', borderRadius: '12px', padding: '0.9rem 1.15rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.76rem', color: '#b45309', fontWeight: 800 }}>قيد مراجعة الاعتماد</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#d97706', marginTop: '0.2rem' }}>
            {pendingCount} <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e' }}>بالانتظار</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #fed7aa', borderRadius: '12px', padding: '0.9rem 1.15rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.76rem', color: '#9a3412', fontWeight: 800 }}>تقارير الأعمال والمسار</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ea580c', marginTop: '0.2rem' }}>
            {filteredReports.filter(r => !r.isFuelReport).length} <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c2410c' }}>تقرير ميداني</span>
          </div>
        </div>
      </div>

      {/* 4. Filters & Search Control Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '1rem 1.35rem',
        marginBottom: '1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.85rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={17} color="#94a3b8" style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder={archiveMode === 'general' ? "بحث برقم التقرير، المشرف، أو الملاحظات..." : "بحث في تقاريرك الشخصية..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 2.4rem 0.6rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Engineer Filter (Available ONLY in General Archive) */}
        {archiveMode === 'general' && canAccessGeneral && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Users size={14} />
              <span>المهندس:</span>
            </span>
            <select
              value={filterEngineer}
              onChange={(e) => setFilterEngineer(e.target.value)}
              style={{
                padding: '0.55rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #bfdbfe',
                fontSize: '0.84rem',
                fontWeight: 800,
                color: '#1e3a8a',
                background: '#eff6ff'
              }}
            >
              {OFFICIAL_ENGINEERS_FILTER_LIST.map(eng => (
                <option key={eng.id} value={eng.id}>
                  {eng.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Type Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>التصنيف:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700 }}
          >
            <option value="all">كافة التقارير</option>
            <option value="الموقف التنفيذي">الموقف التنفيذي (360 كم) 🏛️</option>
            {canAccessTwoPhaseReport(currentUser) && (
              <option value="تقرير إنجاز المرحلتين">تقرير إنجاز المرحلتين 📊</option>
            )}
            <option value="تقرير الأعمال المستهدفة">تقرير الأعمال والمعدات المستهدفة 🎯</option>
            <option value="تقرير كميات الوقود اليومية">تقرير كميات الوقود اليومية ⛽</option>
            <option value="تقرير أعمال الطريق اليومي">تقرير أعمال الطريق اليومي 🛣️</option>
            <option value="تقرير يومي شامل">تقرير يومي شامل</option>
            <option value="تقرير تقدم أعمال الرصف">تقرير أعمال الرصف</option>
            <option value="تقرير تزويد واستهلاك الوقود">تقرير الوقود الميداني</option>
          </select>
        </div>

        {/* Status Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>الحالة:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: 700 }}
          >
            <option value="all">جميع الحالات</option>
            <option value="approved">معتمد رسمياً</option>
            <option value="pending_review">قيد المراجعة</option>
            <option value="rejected">مطلوب تعديل</option>
          </select>
        </div>

        {/* Dates */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>من:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: '0.5rem 0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
          />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>إلى:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: '0.5rem 0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
          />
          {(startDate || endDate || searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || (archiveMode === 'general' && filterEngineer !== 'all')) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); setSearchTerm(''); setStatusFilter('all'); setTypeFilter('all'); setFilterEngineer('all'); }}
              style={{ background: '#fee2e2', border: 'none', color: '#b91c1c', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
            >
              إلغاء الفلترة
            </button>
          )}
        </div>
      </div>

      {/* 5. Reports Table */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        {isLoading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem auto', color: '#2563eb' }} />
            <div>جاري تحميل الأرشيف المعتمد...</div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <FileText size={48} style={{ margin: '0 auto 0.75rem auto', opacity: 0.35, color: archiveMode === 'general' ? '#2563eb' : '#059669' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e3a8a', fontSize: '1.15rem', fontWeight: 900 }}>
              {archiveMode === 'general' 
                ? 'لا توجد تقارير مطابقة لخيارات البحث في الأرشيف العام' 
                : `أرشيف تقاريرك الشخصية (${currentUser?.name || ''}) خالٍ حالياً`
              }
            </h3>
            <p style={{ margin: '0 auto 1.25rem', fontSize: '0.88rem', color: '#64748b', maxWidth: '440px', lineHeight: 1.6 }}>
              {archiveMode === 'general'
                ? 'يمكنك تغيير شروط الفلترة أو المهندس المحدد لاستعراض التقارير المطلوبة.'
                : 'لم يتم العثور على تقارير مسجلة خاصة بك حتى الآن. يمكنك النقر أدناه لإنشاء تقرير جديد وسيتم ربطه بأرشيفك الشخصي فورياً.'
              }
            </p>
            {archiveMode === 'personal' && (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
                }}
              >
                إنشاء تقرير ميداني جديد الآن ✍️
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.9rem 1.1rem', fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>رقم التقرير</th>
                  <th style={{ padding: '0.9rem 1.1rem', fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>التاريخ</th>
                  <th style={{ padding: '0.9rem 1.1rem', fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>الموقع / القطاع</th>
                  <th style={{ padding: '0.9rem 1.1rem', fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>بيان ونوع التقرير</th>
                  <th style={{ padding: '0.9rem 1.1rem', fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>
                    {archiveMode === 'general' ? 'المشرف / المهندس المُعد' : 'إعداد المهندس'}
                  </th>
                  <th style={{ padding: '0.9rem 1.1rem', fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>الوقود (لتر)</th>
                  <th style={{ padding: '0.9rem 1.1rem', fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>بيان الأعمال المنفذة (كل بند مستقلاً)</th>
                  <th style={{ padding: '0.9rem 1.1rem', fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>حالة الاعتماد</th>
                  <th style={{ padding: '0.9rem 1.1rem', fontSize: '0.82rem', fontWeight: 800, color: '#475569', textAlign: 'center' }}>الإجراءات والطباعة</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((r) => {
                  const isPending = r.status === 'pending_review';
                  const author = r.uploadedBy || r.engineer || r.sectorDirector || r.author || 'المشرف الميداني';

                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', background: isPending ? '#fffdf7' : '#ffffff' }}>
                      {/* Report Number */}
                      <td style={{ padding: '0.9rem 1.1rem' }}>
                        <span style={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          background: '#f1f5f9',
                          color: '#0f172a',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          direction: 'ltr',
                          display: 'inline-block'
                        }}>
                          {r.reportNumber || `#REP-${r.id}`}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '0.9rem 1.1rem', fontSize: '0.84rem', color: '#475569' }}>
                        {r.date ? new Date(r.date).toLocaleDateString('ar-LY') : (r.dateFormatted || '—')}
                      </td>

                      {/* Location & Sector */}
                      <td style={{ padding: '0.9rem 1.1rem' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#1e40af' }}>
                          {r.sector || (r.isTwoPhaseProgressReport ? 'المرحلتين (الأولى والثانية)' : 'مشروع طريق أوباري - غات')}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          {r.companyName || 'جهاز تنفيذ مشروعات المواصلات'}
                        </div>
                      </td>

                      {/* Title & Statement */}
                      <td style={{ padding: '0.9rem 1.1rem' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a' }}>
                          {r.materialName || r.reportType || 'تقرير يومي شامل'}
                        </div>
                        {r.notes && (
                          <div style={{ fontSize: '0.74rem', color: '#64748b', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {r.notes}
                          </div>
                        )}
                      </td>

                      {/* Author / Engineer */}
                      <td style={{ padding: '0.9rem 1.1rem' }}>
                        <span style={{
                          background: archiveMode === 'general' ? '#eff6ff' : '#f0fdf4',
                          color: archiveMode === 'general' ? '#1e40af' : '#166534',
                          border: archiveMode === 'general' ? '1px solid #bfdbfe' : '1px solid #bbf7d0',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <User size={12} />
                          <span>{author}</span>
                        </span>
                      </td>

                      {/* Fuel Amount (Liters) */}
                      <td style={{ padding: '0.9rem 1.1rem' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#b45309' }}>
                          {Number(r.fuelAmount || r.totalDispatchedLiters || 0) > 0 ? (
                            <span>{Number(r.fuelAmount || r.totalDispatchedLiters).toLocaleString()} لتر</span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </div>
                      </td>

                      {/* Executed Items (Each item calculated independently - no combined sum) */}
                      <td style={{ padding: '0.9rem 1.1rem' }}>
                        {(r.isExecutiveProgressReport || r.reportType === 'الموقف التنفيذي' || r.reportCategory === 'executive' || String(r.title || '').includes('تنفيذي')) ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.78rem' }}>
                            <strong style={{ color: '#0284c7' }}>إنجاز مالي: {r.overallFinancialPercentage || (r.calculations?.basicPercentage) || '71.11'}%</strong>
                            <span style={{ color: '#475569', fontSize: '0.72rem' }}>منفذ: {Number(r.totalExecutedValue || r.calculations?.grandExecutedSum || 638329685.45).toLocaleString()} د.ل</span>
                          </div>
                        ) : Array.isArray(r.items) && r.items.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.78rem' }}>
                            {r.items.map((it, idx) => (
                              <div key={idx} style={{ whiteSpace: 'nowrap' }}>
                                <span style={{ color: '#475569', fontWeight: 700 }}>{it.item || it.name}: </span>
                                <strong style={{ color: '#16a34a' }}>{Number(it.length || 0).toLocaleString()} م.ط</strong>
                              </div>
                            ))}
                          </div>
                        ) : Array.isArray(r.combinedItems) && r.combinedItems.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.78rem' }}>
                            {r.combinedItems.filter(c => Number(c.todayMeters) > 0).map((c, idx) => (
                              <div key={idx} style={{ whiteSpace: 'nowrap' }}>
                                <span style={{ color: '#475569', fontWeight: 700 }}>{c.name}: </span>
                                <strong style={{ color: '#16a34a' }}>{Number(c.todayMeters).toLocaleString()} م.ط</strong>
                              </div>
                            ))}
                          </div>
                        ) : Number(r.roadMeters || r.salesAmount || 0) > 0 ? (
                          <span style={{ fontWeight: 800, color: '#16a34a' }}>{Number(r.roadMeters || r.salesAmount).toLocaleString()} م.ط</span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>

                      {/* Approval Status */}
                      <td style={{ padding: '0.9rem 1.1rem' }}>
                        {r.status === 'approved' ? (
                          <span style={{
                            background: '#dcfce7',
                            color: '#15803d',
                            padding: '3px 9px',
                            borderRadius: '12px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <CheckCircle2 size={13} />
                            <span>معتمد</span>
                          </span>
                        ) : r.status === 'rejected' ? (
                          <span style={{
                            background: '#fee2e2',
                            color: '#b91c1c',
                            padding: '3px 9px',
                            borderRadius: '12px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <AlertTriangle size={13} />
                            <span>مطلوب تعديل</span>
                          </span>
                        ) : (
                          <span style={{
                            background: '#fef3c7',
                            color: '#b45309',
                            padding: '3px 9px',
                            borderRadius: '12px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Clock size={13} />
                            <span>قيد المراجعة</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.9rem 1.1rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          {/* Official Formal Report View & Print */}
                          <button
                            type="button"
                            onClick={() => setSelectedReportForPrint(r)}
                            style={{
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              padding: '5px 9px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.74rem',
                              fontWeight: 800
                            }}
                            title="عرض التقرير بالنموذج الرسمي المعتمد وطباعته"
                          >
                            <FileText size={13} />
                            <span>النموذج الرسمي</span>
                          </button>

                          {/* Forward / Refer Report Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setForwardModalReport(r);
                              setForwardRecipient('all');
                              setForwardNote('');
                            }}
                            style={{
                              background: '#f0f9ff',
                              border: '1px solid #bae6fd',
                              color: '#0284c7',
                              padding: '5px 9px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.74rem',
                              fontWeight: 800
                            }}
                            title="إحالة التقرير رسمياً عبر البريد والمراسلات"
                          >
                            <Send size={13} />
                            <span>إحالة</span>
                          </button>

                          {/* Edit Report */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(r)}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              color: '#d97706',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.74rem',
                              fontWeight: 800
                            }}
                            title="تعديل بيانات التقرير"
                          >
                            <Edit2 size={13} />
                          </button>

                          {/* Delete Report */}
                          <button
                            type="button"
                            onClick={() => setReportToDelete(r)}
                            style={{
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.74rem',
                              fontWeight: 800
                            }}
                            title="حذف التقرير"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Referral / Forward Report Modal */}
      {forwardModalReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.25rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            padding: '1.5rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            direction: 'rtl'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Send size={20} color="#0284c7" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
                    إحالة تقرير رسمي عبر المراسلات
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                    رقم التقرير: [{forwardModalReport.reportNumber || forwardModalReport.id}]
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForwardModalReport(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  الجهة المحال إليها (المسؤول / المهندس):
                </label>
                <select
                  value={forwardRecipient}
                  onChange={(e) => setForwardRecipient(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    background: '#f8fafc',
                    color: '#0f172a'
                  }}
                >
                  {getOfficialForwardList().map((u, idx) => (
                    <option key={idx} value={u.username}>
                      {u.name} — ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  نص التوجيهات / الملاحظات المرفقة مع الإحالة (اختياري):
                </label>
                <textarea
                  rows={3}
                  value={forwardNote}
                  onChange={(e) => setForwardNote(e.target.value)}
                  placeholder="نحيل إليكم التقرير المعتمد للإحاطة والمتابعة الهندسية واتخاذ ما يلزم..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ background: '#f0f9ff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #bae6fd', fontSize: '0.8rem', color: '#0369a1' }}>
                ℹ️ سيتم إرسال هذا التقرير كرسالة إشرافية رسمية تظهر فوراً في صندوق المراسلات للطرف المحال إليه مع ربط التقرير الأصلي.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setForwardModalReport(null)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.6rem 1.2rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={isForwarding}
                  onClick={handleConfirmForward}
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.6rem 1.4rem',
                    fontWeight: 900,
                    fontSize: '0.88rem',
                    cursor: isForwarding ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  {isForwarding ? <RefreshCw className="spin-slow" size={16} /> : <Send size={16} />}
                  <span>{isForwarding ? 'جاري الإحالة...' : 'تأكيد وإرسال الإحالة'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Modal */}
      {reportToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.25rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '460px',
            padding: '1.6rem',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            direction: 'rtl'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              تأكيد حذف التقرير من الأرشيف
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
              هل أنت متأكد من حذف التقرير رقم <strong>[{reportToDelete.reportNumber || reportToDelete.id}]</strong> نهائياً من الأرشيف؟ لا يمكن التراجع عن هذه العملية.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteReport}
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '8px',
                  fontWeight: 900,
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
                }}
              >
                {isDeleting ? 'جاري الحذف...' : 'نعم، تأكيد الحذف'}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setReportToDelete(null)}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '8px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7.1 Clear All Confirmation Modal */}
      {isClearAllModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.25rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            padding: '1.8rem',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            direction: 'rtl'
          }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto' }}>
              <Trash2 size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.6rem 0' }}>
              تأكيد إفراغ الأرشيف ومسح كافة التقارير
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
              سيتم مسح كافة التقارير الموجودة في الأرشيف ({reports.length} تقرير) نهائياً من <strong>السيرفر المركزي ومن كافة الأجهزة والهواتف المتصلة</strong>.
              <br />
              <span style={{ color: '#dc2626', fontWeight: 800 }}>⚠️ لا يمكن التراجع عن هذا الإجراء إطلاقاً!</span>
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem' }}>
              <button
                type="button"
                disabled={isClearingAll}
                onClick={handleClearAllReports}
                style={{
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem 1.6rem',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  cursor: isClearingAll ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)'
                }}
              >
                {isClearingAll ? 'جاري إفراغ الأرشيف...' : 'نعم، مسح كافة التقارير نهائياً'}
              </button>
              <button
                type="button"
                disabled={isClearingAll}
                onClick={() => setIsClearAllModalOpen(false)}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '0.75rem 1.4rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                إلغاء وتراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Edit Report Modal */}
      {editingReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.25rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            padding: '1.6rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            direction: 'rtl'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: '0 0 1rem 0' }}>
              تعديل بيانات التقرير: [{editingReport.reportNumber || editingReport.id}]
            </h3>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '3px' }}>رقم التقرير:</label>
                  <input
                    type="text"
                    value={editFormData.reportNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, reportNumber: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '3px' }}>التاريخ:</label>
                  <input
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '3px' }}>الملاحظات:</label>
                <textarea
                  rows={3}
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '0.6rem 1.4rem', borderRadius: '8px', fontWeight: 900, cursor: isSavingEdit ? 'not-allowed' : 'pointer' }}
                >
                  {isSavingEdit ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Standalone Create Report Modal */}
      {isCreateModalOpen && (
        <CreateReportModal
          isOpen={isCreateModalOpen}
          currentUser={currentUser}
          onClose={() => setIsCreateModalOpen(false)}
          onNavigateTab={onNavigateTab}
          onReportCreated={() => fetchReports()}
          onPrintReport={(rep) => setSelectedReportForPrint(rep)}
        />
      )}

      {/* 10. Official Print Modal */}
      {selectedReportForPrint && (
        <OfficialPrintModal
          isOpen={!!selectedReportForPrint}
          report={selectedReportForPrint}
          currentUser={currentUser}
          onClose={() => setSelectedReportForPrint(null)}
          onForwardReport={(rep) => {
            setSelectedReportForPrint(null);
            setForwardModalReport(rep);
            setForwardRecipient('all');
            setForwardNote('');
          }}
        />
      )}

    </div>
  );
};
