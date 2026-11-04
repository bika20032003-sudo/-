const fs = require('fs');

// 1. Update CreateFuelReportModal.jsx
let fuelModal = fs.readFileSync('src/components/CreateFuelReportModal.jsx', 'utf8');

const oldFuelSupervisors = `  const officialSupervisors = [
    { username: 'admin', name: 'م. عبدالرحمن الأنصاري', role: 'مدير المشروع' },
    { username: 'abrikaw', name: 'م. عبدالسلام ابريكاو', role: 'رئيس جهاز الإشراف' },
    { username: 'saleh_quality', name: 'م. صالح حماد', role: 'مسؤول الجودة' },
    { username: 'salah_alarabi', name: 'م. صلاح العربي', role: 'مهندس مشرف (المرحلة الأولى)' },
    { username: 'issa_altahir', name: 'م. عيسى الطاهر', role: 'مهندس مشرف (المرحلة الثانية)' },
  ];`;

const newFuelSupervisors = `  const officialSupervisors = [
    { username: 'project_manager', name: 'م. عبدالرحمن الأنصاري', role: 'مدير المشروع', title: 'مدير المشروع (جهاز الإشراف)' },
    { username: 'abrikaw', name: 'م. عبدالسلام ابريكاو', role: 'رئيس جهاز الإشراف', title: 'رئيس جهاز الإشراف والمتابعة' },
    { username: 'saleh_quality', name: 'م. صالح حماد', role: 'مسؤول الجودة', title: 'مسؤول ضبط ومراقبة الجودة الفنية' },
    { username: 'salah_alarabi', name: 'م. صلاح العربي', role: 'مهندس مشرف (المرحلة الأولى)', title: 'مهندس مشرف - المرحلة الأولى' },
    { username: 'issa_altahir', name: 'م. عيسى الطاهر', role: 'مهندس مشرف (المرحلة الثانية)', title: 'مهندس مشرف - المرحلة الثانية' },
  ];

  const getSupervisionTeamExcludingDev = () => {
    try {
      const custom = JSON.parse(localStorage.getItem('custom_users') || '[]');
      const filtered = custom.filter(u => {
        const r = (u.role || '').toLowerCase();
        const un = (u.username || '').toLowerCase();
        return !r.includes('تطوير') && un !== 'admin' && un !== 'dev';
      });
      return [...officialSupervisors, ...filtered];
    } catch (e) {
      return officialSupervisors;
    }
  };`;

if (fuelModal.includes(oldFuelSupervisors)) {
  fuelModal = fuelModal.replace(oldFuelSupervisors, newFuelSupervisors);
}

fuelModal = fuelModal.replace(
  `      if (sendAfter) {
        setShowForwardModal(true);
      }`,
  `      if (sendAfter) {
        const allTeam = getSupervisionTeamExcludingDev();
        for (const targetUser of allTeam) {
          const autoMsg = {
            id: Date.now() + Math.random(),
            fromUsername: currentUser?.username || 'fuel_officer',
            fromName: currentUser?.name || 'مسؤول الوقود والمحروقات',
            fromRole: currentUser?.title || currentUser?.role || 'إدارة الوقود',
            toUsername: targetUser.username,
            toName: targetUser.name,
            toRole: targetUser.role,
            type: 'إحالة تقرير وقود فوري',
            subject: \`إحالة تقرير كميات الوقود اليومية - \${dayName} \${formattedSlashDate}\`,
            content: \`نحيل إليكم رسمياً نسخة معتمدة من تقرير كميات الوقود اليومية (المصروف: \${totalDispatched.toLocaleString()} لتر - الوارد: \${totalReceived.toLocaleString()} لتر - المتبقي: \${totalRemaining.toLocaleString()} لتر) للإحاطة والمتابعة.\`,
            reportId: saved.id,
            reportNumber: saved.reportNumber,
            reportData: saved,
            createdAt: new Date().toISOString()
          };
          try {
            fastFetch('http://localhost:5000/api/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(autoMsg)
            }).catch(() => {});
          } catch (e) {}
          try {
            const locMsgs = JSON.parse(localStorage.getItem('system_messages') || '[]');
            locMsgs.unshift(autoMsg);
            localStorage.setItem('system_messages', JSON.stringify(locMsgs));
          } catch (e) {}
        }
        setStatusMessage({ 
          type: 'success', 
          text: \`تم حفظ التقرير وإرساله رسمياً لكافة أعضاء جهاز الإشراف (م. عبدالرحمن الأنصاري، م. عبدالسلام ابريكاو، م. صالح حماد، م. صلاح العربي، م. عيسى الطاهر) بنجاح!\` 
        });
      }`
);

fs.writeFileSync('src/components/CreateFuelReportModal.jsx', fuelModal, 'utf8');
console.log('✓ Updated CreateFuelReportModal broadcast logic');

