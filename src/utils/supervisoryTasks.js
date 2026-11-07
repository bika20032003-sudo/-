/**
 * سجل المهام الإشرافية والتكليفات الميدانية لمدير المشروع
 * مشروع صيانة وتطوير طريق أوباري - غات (360 كم)
 */

export const DEFAULT_SUPERVISORY_TASKS = [
  {
    id: 'task-1',
    title: 'استلام طبقة الأساس الحبيبي بالمحطة 236+400 إلى 236+700',
    assignedToUsername: 'abrikaw',
    assignedToName: 'م. الصالحين بريكاو',
    assignedToRole: 'مشرف قطاع أ (المرحلة الأولى)',
    sector: 'المرحلة الأولى (المحطة 236)',
    priority: 'urgent',
    priorityLabel: 'عاجل وفوري',
    status: 'pending',
    statusLabel: 'قيد المتابعة',
    dueDate: '2026-11-08',
    details: 'إجراء اختبارات الكثافة الميدانية والمعملية وسماكة الطبقة واعتماد المحضر الميداني قبل السماح ببدء رش مادة MC0.',
    createdAt: '2026-11-06T10:00:00.000Z',
    createdBy: 'م. عبدالرحمن الأنصاري (مدير المشروع)'
  },
  {
    id: 'task-2',
    title: 'تأمين وصول شحنة وقود عاجلة إلى موقع 107 وخزانات الكسارات',
    assignedToUsername: 'salah_alarabi',
    assignedToName: 'م. صلاح العربي',
    assignedToRole: 'مشرف قطاع ب (المرحلة الثانية)',
    sector: 'موقع 107 والكسارات',
    priority: 'urgent',
    priorityLabel: 'عاجل جداً',
    status: 'pending',
    statusLabel: 'قيد المتابعة',
    dueDate: '2026-11-07',
    details: 'المخزون المتبقي 49 لتر فقط بالموقع و 19 لتر بالكسارات. يجب تنسيق تفريغ شحنة الديزل فورياً لتفادي توقف ماكينات التدوير والآليات الثقيلة.',
    createdAt: '2026-11-06T11:30:00.000Z',
    createdBy: 'م. عبدالرحمن الأنصاري (مدير المشروع)'
  },
  {
    id: 'task-3',
    title: 'معاينة الوادي وإعداد المذكرة الفنية للعبارة المنهارة (المحطة 165+000)',
    assignedToUsername: 'saleh_quality',
    assignedToName: 'م. صالح بن يحي',
    assignedToRole: 'مهندس ضبط الجودة والمختبر',
    sector: 'المرحلة الأولى (المحطة 165)',
    priority: 'high',
    priorityLabel: 'أولوية عالية',
    status: 'pending',
    statusLabel: 'قيد المتابعة',
    dueDate: '2026-11-09',
    details: 'فحص التربة والأعمال الخرسانية وتحديد الأبعاد الهيدروليكية للعبارة الصندوقية لإنهاء قطاع الـ 130 م.ط واستكمال نسبة إنجاز المرحلة 100%.',
    createdAt: '2026-11-05T14:00:00.000Z',
    createdBy: 'م. عبدالرحمن الأنصاري (مدير المشروع)'
  },
  {
    id: 'task-4',
    title: 'تجهيز فرقة الرصف لطرح طبقة الأسفلت 6 سم بالقطاع الجاهز (2,230 م.ط)',
    assignedToUsername: 'issa_altahir',
    assignedToName: 'م. عيسى الطاهر',
    assignedToRole: 'مشرف محطة الخلط والموقع',
    sector: 'المرحلة الثانية',
    priority: 'high',
    priorityLabel: 'أولوية عالية',
    status: 'pending',
    statusLabel: 'قيد المتابعة',
    dueDate: '2026-11-10',
    details: 'القطاع مرشوش بطبقة MC0 ومكتمل النظافة. يرجى معاينة جاهزية الخلاطة المركزية والفرادات والمداحل لبدء الطرح وضبط درجات الحرارة.',
    createdAt: '2026-11-05T09:15:00.000Z',
    createdBy: 'م. عبدالرحمن الأنصاري (مدير المشروع)'
  }
];

export function getSupervisoryTasks() {
  if (typeof window === 'undefined') return DEFAULT_SUPERVISORY_TASKS;
  try {
    const raw = localStorage.getItem('system_supervisory_tasks');
    if (!raw) {
      localStorage.setItem('system_supervisory_tasks', JSON.stringify(DEFAULT_SUPERVISORY_TASKS));
      return DEFAULT_SUPERVISORY_TASKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SUPERVISORY_TASKS;
  } catch (_) {
    return DEFAULT_SUPERVISORY_TASKS;
  }
}

export function saveSupervisoryTask(taskData, currentUser) {
  if (typeof window === 'undefined') return null;
  try {
    const currentTasks = getSupervisoryTasks();
    const newTask = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      title: (taskData.title || '').trim(),
      assignedToUsername: taskData.assignedToUsername || 'abrikaw',
      assignedToName: taskData.assignedToName || 'م. الصالحين بريكاو',
      assignedToRole: taskData.assignedToRole || 'مشرف قطاع أ',
      sector: taskData.sector || 'طريق أوباري - غات (360 كم)',
      priority: taskData.priority || 'high',
      priorityLabel: taskData.priority === 'urgent' ? 'عاجل وفوري' : (taskData.priority === 'normal' ? 'متابعة دورية' : 'أولوية عالية'),
      status: 'pending',
      statusLabel: 'قيد المتابعة',
      dueDate: taskData.dueDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      details: taskData.details ? taskData.details.trim() : '',
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name ? `${currentUser.name} (${currentUser.title || 'مدير المشروع'})` : 'م. عبدالرحمن الأنصاري (مدير المشروع)'
    };

    const updated = [newTask, ...currentTasks];
    localStorage.setItem('system_supervisory_tasks', JSON.stringify(updated));

    // Also auto-dispatch official correspondence message into system_messages
    try {
      const existingMsgs = JSON.parse(localStorage.getItem('system_messages') || localStorage.getItem('local_messages') || '[]');
      const officialDispatchMsg = {
        id: 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        fromUsername: currentUser?.username || 'project_manager',
        fromName: currentUser?.name || 'م. عبدالرحمن الأنصاري (مدير المشروع)',
        fromRole: 'مدير المشروع - جهاز الإشراف والمتابعة',
        toUsername: newTask.assignedToUsername,
        toName: newTask.assignedToName,
        toRole: newTask.assignedToRole,
        subject: `تكليف بمهمة إشرافية: ${newTask.title}`,
        category: 'instruction',
        priority: newTask.priority === 'urgent' ? 'urgent' : 'high',
        body: `سعادة المهندس / ${newTask.assignedToName} المحترم،\n\nنود إحاطتكم بتكليفكم رسمياً بالمهمة الإشرافية الميدانية التالية:\n\n• عنوان المهمة: ${newTask.title}\n• الموقع / المحطة: ${newTask.sector}\n• مستوى الأولوية: ${newTask.priorityLabel}\n• تاريخ الإنجاز المستهدف: ${newTask.dueDate}\n\nنص التوجيهات والتفاصيل الفنية:\n${newTask.details || 'يرجى المتابعة الميدانية الدقيقة وموافاتنا بتقرير الإنجاز.'}\n\nمع فائق الاحترام والتقدير،\nمدير المشروع ومساعد جهاز الإشراف والمتابعة.`,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('ar-LY', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        time: new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }),
        read: false,
        attachments: []
      };
      const updatedMsgs = [officialDispatchMsg, ...existingMsgs];
      localStorage.setItem('system_messages', JSON.stringify(updatedMsgs));
      localStorage.setItem('local_messages', JSON.stringify(updatedMsgs));
      window.dispatchEvent(new CustomEvent('messages-updated'));
    } catch (e) {
      console.warn('Could not post dispatch message:', e);
    }

    window.dispatchEvent(new CustomEvent('supervisory-tasks-updated'));
    return newTask;
  } catch (err) {
    console.error('Error saving supervisory task:', err);
    return null;
  }
}

export function updateSupervisoryTaskStatus(taskId, newStatus, resolutionNotes = '') {
  if (typeof window === 'undefined') return false;
  try {
    const tasks = getSupervisoryTasks();
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          statusLabel: newStatus === 'completed' ? 'مكتملة ومنجزة' : 'قيد المتابعة',
          completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
          resolutionNotes: resolutionNotes || t.resolutionNotes || ''
        };
      }
      return t;
    });
    localStorage.setItem('system_supervisory_tasks', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('supervisory-tasks-updated'));
    return true;
  } catch (err) {
    console.error('Error updating task status:', err);
    return false;
  }
}

export function deleteSupervisoryTask(taskId) {
  if (typeof window === 'undefined') return false;
  try {
    const tasks = getSupervisoryTasks();
    const updated = tasks.filter(t => t.id !== taskId);
    localStorage.setItem('system_supervisory_tasks', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('supervisory-tasks-updated'));
    return true;
  } catch (err) {
    console.error('Error deleting task:', err);
    return false;
  }
}

export function generateSupervisoryTasksArticle() {
  const tasks = getSupervisoryTasks();
  const pending = tasks.filter(t => t.status === 'pending');
  const completed = tasks.filter(t => t.status === 'completed');

  let report = `📋 **تقرير وسجل المهام الإشرافية الميدانية (تكليفات وتوجيهات مدير المشروع):**\n`;
  report += `• **إجمالي التكليفات المسجلة:** \`${tasks.length}\` مهمة إشرافية\n`;
  report += `• **المهام الجارية قيد المتابعة:** \`${pending.length}\` مهمة\n`;
  report += `• **المهام المكتملة والمنجزة:** \`${completed.length}\` مهمة\n\n`;

  report += `### 📌 بيان المهام الإشرافية المفتوحة (قيد المتابعة):\n`;
  if (pending.length === 0) {
    report += `*لا توجد أي مهام معلقة حالياً، كافة التكليفات الإشرافية منجزة بالكامل.*\n`;
  } else {
    pending.forEach((t, idx) => {
      report += `${idx + 1}. **${t.title}**\n`;
      report += `   • المكلف: \`${t.assignedToName}\` (${t.assignedToRole})\n`;
      report += `   • الموقع: \`${t.sector}\` | الأولوية: \`${t.priorityLabel}\`\n`;
      report += `   • التاريخ المستهدف: \`${t.dueDate}\`\n`;
      if (t.details) report += `   • التوجيهات: ${t.details}\n`;
      report += `\n`;
    });
  }

  if (completed.length > 0) {
    report += `### ✅ أبرز المهام المنجزة مؤخراً:\n`;
    completed.slice(0, 3).forEach((t) => {
      report += `• **${t.title}** (أنجزها: ${t.assignedToName})\n`;
    });
  }

  report += `\n💡 *ملاحظة:* يمكن لمدير المشروع تقديم وتكليف مهام جديدة مباشرة عبر **تبويب مكتب مدير المشروع** في واجهة مساعد جهاز الإشراف.`;
  return report;
}
