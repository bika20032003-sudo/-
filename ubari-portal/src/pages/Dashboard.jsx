import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  ListChecks, 
  LayoutDashboard, 
  Newspaper, 
  Plus, 
  Pencil, 
  Trash2, 
  House, 
  LogOut,
  X,
  CheckCircle2
} from 'lucide-react';
import { ASSETS, AVAILABLE_IMAGE_KEYS } from '../utils/assets';
import { useProjectData } from '../context/ProjectDataContext';

export default function Dashboard() {
  const { 
    stats, 
    stages, 
    news, 
    overview, 
    currentUser, 
    logout,
    updateStage, 
    updateStat, 
    addNews, 
    updateNews, 
    deleteNews 
  } = useProjectData();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('news');
  const [toastMessage, setToastMessage] = useState('');

  // News Modal State
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [newsForm, setNewsForm] = useState({
    id: null,
    title: '',
    excerpt: '',
    content: '',
    category: 'news',
    imageKey: 'works-paving'
  });

  // Stage Modal State
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [stageForm, setStageForm] = useState(null);

  // Stat Modal State
  const [statModalOpen, setStatModalOpen] = useState(false);
  const [statForm, setStatForm] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveNews = (e) => {
    e.preventDefault();
    if (!newsForm.title.trim() || !newsForm.content.trim()) return;

    if (newsForm.id) {
      updateNews(newsForm);
      showToast('تم تحديث الخبر بنجاح');
    } else {
      addNews(newsForm);
      showToast('تمت إضافة الخبر بنجاح');
    }
    setNewsModalOpen(false);
  };

  const handleSaveStage = (e) => {
    e.preventDefault();
    if (!stageForm) return;
    updateStage(stageForm);
    showToast('تم تحديث بيانات المرحلة بنجاح');
    setStageModalOpen(false);
  };

  const handleSaveStat = (e) => {
    e.preventDefault();
    if (!statForm) return;
    updateStat(statForm);
    showToast('تم تحديث الإحصائية بنجاح');
    setStatModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs font-semibold text-background shadow-2xl animate-in fade-in-0 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-3">
            <span className="block h-10 w-10 overflow-hidden rounded-full bg-white shadow ring-1 ring-black/10">
              <img
                src={ASSETS.logo}
                alt="شعار الجهاز"
                className="h-full w-full object-cover"
              />
            </span>
            <div className="leading-tight">
              <p className="font-display text-lg font-bold text-gold">
                لوحة تحكم مدير المشروع
              </p>
              <p className="text-[11px] tracking-[0.15em] text-muted-foreground">
                طريق ﻱ – غات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground md:block">
              {currentUser?.name || 'مدير المشروع'}
            </span>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs font-medium hover:border-gold hover:text-gold transition-colors"
            >
              <House className="h-3.5 w-3.5" />
              <span>البوابة الرئيسية</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        {/* KPI Summary Cards */}
        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <p className="font-display text-2xl font-bold" dir="ltr">
                  {overview.avgProgress}%
                </p>
                <p className="text-xs text-muted-foreground">الإنجاز الكلي</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <ListChecks className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="font-display text-2xl font-bold" dir="ltr">
                  {overview.completedStages} / {overview.totalStages}
                </p>
                <p className="text-xs text-muted-foreground">مراحل مكتملة</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <LayoutDashboard className="h-8 w-8 text-amber-600" />
              <div>
                <p className="font-display text-2xl font-bold" dir="ltr">
                  {overview.inProgressStages}
                </p>
                <p className="text-xs text-muted-foreground">مراحل قيد التنفيذ</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <Newspaper className="h-8 w-8 text-primary" />
              <div>
                <p className="font-display text-2xl font-bold" dir="ltr">
                  {overview.newsCount}
                </p>
                <p className="text-xs text-muted-foreground">أخبار وتقارير منشورة</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="mb-8 flex gap-2 border-b border-border pb-4">
          <button
            onClick={() => setActiveTab('news')}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === 'news'
                ? 'bg-foreground text-background shadow'
                : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            <Newspaper className="h-4 w-4" />
            <span>الأخبار والتقارير</span>
          </button>

          <button
            onClick={() => setActiveTab('stages')}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === 'stages'
                ? 'bg-foreground text-background shadow'
                : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            <ListChecks className="h-4 w-4" />
            <span>مراحل الإنجاز</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === 'stats'
                ? 'bg-foreground text-background shadow'
                : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>إحصائيات البوابة</span>
          </button>
        </div>

        {/* Tab 1: News */}
        {activeTab === 'news' && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between pb-6 border-b border-border">
              <h2 className="font-display text-xl font-bold">
                الأخبار والتقارير المنشورة
              </h2>
              <button
                onClick={() => {
                  setNewsForm({
                    id: null,
                    title: '',
                    excerpt: '',
                    content: '',
                    category: 'news',
                    imageKey: 'works-paving'
                  });
                  setNewsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-xs font-medium text-background hover:opacity-90 shadow"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>إضافة خبر / تقرير</span>
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {news.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground text-sm">
                  لا توجد أخبار منشورة بعد.
                </p>
              ) : (
                news.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-4 hover:border-gold/50 transition-colors"
                  >
                    <div className="min-w-0 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            item.category === 'report'
                              ? 'bg-amber-500/10 text-amber-700'
                              : 'bg-emerald-500/10 text-emerald-700'
                          }`}
                        >
                          {item.category === 'report' ? 'تقرير دوري' : 'خبر'}
                        </span>
                        <time className="text-[11px] text-muted-foreground" dir="ltr">
                          {item.publishedAt}
                        </time>
                      </div>
                      <p className="mt-1 font-bold text-sm truncate">{item.title}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setNewsForm(item);
                          setNewsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-gold hover:text-gold transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>تعديل</span>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('هل أنت متأكد من حذف هذا الخبر؟')) {
                            deleteNews(item.id);
                            showToast('تم حذف الخبر');
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Stages */}
        {activeTab === 'stages' && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-display text-xl font-bold pb-6 border-b border-border">
              مراحل المشروع ونسب الإنجاز
            </h2>
            <div className="mt-6 space-y-4">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-4 hover:border-gold/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm">{stage.name}</p>
                    {stage.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                        {stage.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-2 max-w-xs flex-1 overflow-hidden rounded-full bg-secondary" dir="ltr">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${stage.percentage}%`,
                            backgroundColor: '#a97b3f'
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-primary" dir="ltr">
                        {stage.percentage}%
                      </span>
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] text-muted-foreground">
                        {stage.status === 'completed'
                          ? 'مكتمل'
                          : stage.status === 'in_progress'
                          ? 'قيد التنفيذ'
                          : 'لم يبدأ'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setStageForm(stage);
                      setStageModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-gold hover:text-gold transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>تعديل</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Stats */}
        {activeTab === 'stats' && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-display text-xl font-bold pb-6 border-b border-border">
              إحصائيات شريط البوابة الرئيسية
            </h2>
            <div className="mt-6 space-y-4">
              {stats.map((stat) => (
                <div
                  key={stat.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-4 hover:border-gold/50 transition-colors"
                >
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="font-display text-xl font-bold text-primary">
                      {stat.value}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setStatForm(stat);
                      setStatModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-gold hover:text-gold transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>تعديل</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal 1: News Add/Edit */}
      {newsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in-0">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-display text-lg font-bold">
                {newsForm.id ? 'تعديل خبر' : 'إضافة خبر / تقرير جديد'}
              </h3>
              <button
                onClick={() => setNewsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNews} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">العنوان</label>
                <input
                  type="text"
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  required
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  ملخص قصير (يظهر في البطاقات)
                </label>
                <textarea
                  rows={2}
                  value={newsForm.excerpt}
                  onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">النص الكامل</label>
                <textarea
                  rows={5}
                  value={newsForm.content}
                  onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                  required
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">النوع</label>
                  <select
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
                  >
                    <option value="news">خبر</option>
                    <option value="report">تقرير دوري</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">الصورة المرفقة</label>
                  <select
                    value={newsForm.imageKey}
                    onChange={(e) => setNewsForm({ ...newsForm, imageKey: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
                  >
                    {AVAILABLE_IMAGE_KEYS.map((img) => (
                      <option key={img.key} value={img.key}>
                        {img.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setNewsModalOpen(false)}
                  className="rounded-full border border-border px-5 py-2 text-xs font-medium hover:bg-secondary"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-foreground px-6 py-2 text-xs font-medium text-background hover:opacity-90 shadow"
                >
                  {newsForm.id ? 'حفظ التعديلات' : 'نشر'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Stage Edit */}
      {stageModalOpen && stageForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in-0">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-display text-lg font-bold">تعديل مرحلة</h3>
              <button
                onClick={() => setStageModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStage} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">اسم المرحلة</label>
                <input
                  type="text"
                  value={stageForm.name}
                  onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })}
                  required
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">الوصف</label>
                <textarea
                  rows={2}
                  value={stageForm.description}
                  onChange={(e) => setStageForm({ ...stageForm, description: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">نسبة الإنجاز (0 - 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={stageForm.percentage}
                    onChange={(e) =>
                      setStageForm({
                        ...stageForm,
                        percentage: Math.max(0, Math.min(100, Number(e.target.value) || 0))
                      })
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">الحالة</label>
                  <select
                    value={stageForm.status}
                    onChange={(e) => setStageForm({ ...stageForm, status: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
                  >
                    <option value="completed">مكتمل</option>
                    <option value="in_progress">قيد التنفيذ</option>
                    <option value="pending">لم يبدأ</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setStageModalOpen(false)}
                  className="rounded-full border border-border px-5 py-2 text-xs font-medium hover:bg-secondary"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-foreground px-6 py-2 text-xs font-medium text-background hover:opacity-90 shadow"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Stat Edit */}
      {statModalOpen && statForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in-0">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-display text-lg font-bold">تعديل إحصائية</h3>
              <button
                onClick={() => setStatModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStat} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">المسمى</label>
                <input
                  type="text"
                  value={statForm.label}
                  onChange={(e) => setStatForm({ ...statForm, label: e.target.value })}
                  required
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">القيمة</label>
                <input
                  type="text"
                  value={statForm.value}
                  onChange={(e) => setStatForm({ ...statForm, value: e.target.value })}
                  required
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setStatModalOpen(false)}
                  className="rounded-full border border-border px-5 py-2 text-xs font-medium hover:bg-secondary"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-foreground px-6 py-2 text-xs font-medium text-background hover:opacity-90 shadow"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
