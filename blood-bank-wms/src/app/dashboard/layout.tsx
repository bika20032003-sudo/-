// تخطيط لوحة التحكم - مشترك بين جميع الصفحات الداخلية
// منظومة إدارة مخازن الهيئة العامة لخدمات نقل الدم
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-layout">
      {/* القائمة الجانبية */}
      <Sidebar />
      
      {/* المحتوى الرئيسي */}
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}
