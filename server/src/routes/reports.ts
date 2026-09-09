import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// رفع التقرير وحفظ البيانات في قاعدة البيانات مع التوجيه التلقائي الذكي للأقسام
router.post('/upload', async (req, res) => {
  try {
    const { 
      date, 
      crusherName, 
      materialName, 
      productionAmount, 
      salesAmount, 
      imageUrl, 
      notes,
      equipmentName,
      driverName,
      truckCode,
      destination,
      operatingHours,
      equipmentCode,
      status
    } = req.body;

    const amountNum = parseFloat(productionAmount) || 0;
    const reportDateObj = new Date(date || Date.now());
    let targetSectionKey = 'general';
    let targetSectionName = 'التقارير العامة';
    let targetDetails = '';

    // التحليل والتعرف التلقائي الذكي على نوع ومحتوى التقرير
    const combinedText = `${materialName || ''} ${notes || ''} ${crusherName || ''} ${equipmentName || ''} ${destination || ''}`.toLowerCase();

    // 1. فحص الكسارات والإنتاج
    if (combinedText.includes('كسار') || combinedText.includes('إنتاج') || combinedText.includes('تكسير') || combinedText.includes('مقلع')) {
      targetSectionKey = 'crushers';
      targetSectionName = 'قسم الكسارات ومعدلات الإنتاج';
      const sharshoorCalculated = Math.round(amountNum * 0.6);

      await prisma.crusherLog.create({
        data: {
          date: reportDateObj,
          name: crusherName || 'الكسارة الشمالية (القطعة A)',
          sector: (crusherName?.includes('B') || combinedText.includes('الوسط') || combinedText.includes('b')) ? 'القطعة B' : 'القطعة A',
          dailyProductionTons: amountNum,
          sharshoorTons: sharshoorCalculated,
          imageUrl: imageUrl || null,
          notes: notes ? `${notes} (مرحّل آلياً)` : 'مرحّل آلياً من رفع التقارير'
        }
      });
      targetDetails = `تم ترحيل ${amountNum} طن إنتاج يومي واحتساب ${sharshoorCalculated} طن حصة شرشور إلى قسم الكسارات.`;
    }

    // 2. فحص الوقود والسولار والصهاريج
    else if (combinedText.includes('وقود') || combinedText.includes('سولار') || combinedText.includes('ديزل') || combinedText.includes('بنزين') || combinedText.includes('لتر') || combinedText.includes('تزويد') || combinedText.includes('صهريج')) {
      targetSectionKey = 'fuel';
      targetSectionName = 'قسم إدارة الوقود والصهاريج';
      const randomTicket = `FUEL-${Date.now().toString().slice(-4)}`;

      await prisma.fuelDispatchLog.create({
        data: {
          ticketNumber: randomTicket,
          date: reportDateObj,
          equipmentName: equipmentName || crusherName || 'معدة ميدانية',
          liters: amountNum,
          driverName: driverName || 'علي الفرجاني',
          pumpOperator: 'مسؤول التزويد',
          tankSource: combinedText.includes('b') ? 'صهريج القطعة B' : 'صهريج القطعة A',
          meterBefore: 124500,
          meterAfter: 124500 + amountNum,
          imageUrl: imageUrl || null,
          notes: notes ? `${notes} (إذن صرف مرحّل آلياً)` : 'إذن صرف مرحّل آلياً'
        }
      });
      targetDetails = `تم إصدار إذن صرف وقود بقيمة ${amountNum} لتر برقم (${randomTicket}) في قسم الوقود مع الصورة المرفقة.`;
    }

    // 3. فحص الشرشور وبوالص الميزان
    else if (combinedText.includes('شرشور') || combinedText.includes('ركام') || combinedText.includes('بوليصة') || combinedText.includes('ميزان') || combinedText.includes('توريد') || combinedText.includes('خلط')) {
      targetSectionKey = 'sharshoor';
      targetSectionName = 'قسم أرصدة ومخزون الشرشور';

      await prisma.sharshoorLog.create({
        data: {
          date: reportDateObj,
          sector: combinedText.includes('b') ? 'القطعة B' : 'القطعة A',
          crusher: crusherName || 'الكسارة 1',
          amountTons: amountNum,
          truckCode: truckCode || 'TRK-01',
          destination: destination || 'موقع الخلط والتنفيذ',
          imageUrl: imageUrl || null,
          notes: notes ? `${notes} (بوليصة مرحلة آلياً)` : 'بوليصة مرحلة آلياً'
        }
      });
      targetDetails = `تم تسجيل شحنة توريد شرشور بكمية ${amountNum} طن في قسم الشرشور وتحديث الرصيد المتاح.`;
    }

    // 4. فحص المعدات والآليات
    else if (combinedText.includes('معد') || combinedText.includes('آلي') || combinedText.includes('حفار') || combinedText.includes('لودر') || combinedText.includes('فاردة') || combinedText.includes('شاحن') || combinedText.includes('قلاب') || combinedText.includes('صيانة') || combinedText.includes('تشغيل')) {
      targetSectionKey = 'equipment';
      targetSectionName = 'قسم إدارة المعدات والآليات';
      const eqCode = equipmentCode || `EQ-${Date.now().toString().slice(-4)}`;

      const existing = await prisma.equipment.findFirst({
        where: { name: { contains: equipmentName || crusherName || '' } }
      });

      if (existing) {
        await prisma.equipment.update({
          where: { id: existing.id },
          data: {
            dailyHours: parseFloat(operatingHours) || (existing.dailyHours + 8),
            status: status || 'operational',
            imageUrl: imageUrl || existing.imageUrl
          }
        });
      } else {
        await prisma.equipment.create({
          data: {
            code: eqCode,
            name: equipmentName || crusherName || 'معدة ميدانية جديدة',
            type: 'معدة ثقيلة',
            category: 'أسطول التشغيل',
            status: status || 'operational',
            dailyHours: parseFloat(operatingHours) || 8,
            location: combinedText.includes('b') ? 'القطعة B' : 'القطعة A',
            imageUrl: imageUrl || null,
            notes: notes
          }
        });
      }
      targetDetails = `تم توثيق ساعات تشغيل المعدة وتحديث الحالة في قسم المعدات.`;
    }

    // إذا لم يحدد، اعتبره تقرير تشغيلي عام
    else {
      targetSectionKey = 'daily-reports';
      targetSectionName = 'أرشيف وسجل التقارير اليومية';
      targetDetails = `تم حفظ وتوثيق التقرير الميداني بنجاح في أرشيف التقارير.`;
    }

    // حفظ التقرير العام في جدول DailyReport مع الصورة
    const report = await prisma.dailyReport.create({
      data: {
        date: reportDateObj,
        crusherName: crusherName || 'القطعة A',
        materialName: materialName || 'تقرير ميداني موثق',
        productionAmount: amountNum,
        salesAmount: parseFloat(salesAmount) || 0,
        imageUrl: imageUrl || null,
        notes: notes || ''
      }
    });

    // إنشاء تنبيه فوري
    await prisma.alert.create({
      data: {
        type: 'info',
        title: `تقرير جديد: ${materialName || 'تقرير ميداني'}`,
        message: `تم رفع التقرير وتوجيهه تلقائياً إلى [${targetSectionName}].`,
        isRead: false
      }
    });

    res.json({
      success: true,
      message: `تم التعرف على التقرير وترحيله آلياً إلى ${targetSectionName} بنجاح!`,
      targetSectionKey,
      targetSection: targetSectionName,
      targetDetails,
      report
    });
  } catch (error) {
    console.error('Error uploading and routing report:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء معالجة وترحيل التقرير' });
  }
});

// جلب كل التقارير
router.get('/', async (req, res) => {
  try {
    const reports = await prisma.dailyReport.findMany({
      orderBy: { date: 'desc' }
    });
    res.json({ success: true, reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب التقارير' });
  }
});

// تعديل تقرير يومي
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { materialName, crusherName, productionAmount, date, notes, imageUrl } = req.body;

    const updated = await prisma.dailyReport.update({
      where: { id },
      data: {
        ...(materialName ? { materialName } : {}),
        ...(crusherName ? { crusherName } : {}),
        ...(productionAmount !== undefined ? { productionAmount: parseFloat(productionAmount) || 0 } : {}),
        ...(date ? { date: new Date(date) } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(imageUrl ? { imageUrl } : {})
      }
    });

    res.json({ success: true, report: updated });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء تعديل التقرير' });
  }
});

// حذف تقرير يومي
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.dailyReport.delete({ where: { id } });
    res.json({ success: true, message: 'تم حذف التقرير بنجاح' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء حذف التقرير' });
  }
});

export default router;
