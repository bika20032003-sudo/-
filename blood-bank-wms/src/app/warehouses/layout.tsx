// تخطيط مشترك للصفحات الداخلية
import Sidebar from '@/components/layout/Sidebar';
export default function InnerLayout({ children }: { children: React.ReactNode }) {
  return <div className="app-layout"><Sidebar /><div className="main-content">{children}</div></div>;
}
