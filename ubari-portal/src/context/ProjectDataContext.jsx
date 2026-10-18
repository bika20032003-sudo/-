import React, { createContext, useContext, useState, useEffect } from 'react';

const INITIAL_STATS = [
  { id: 1, statKey: 'length', label: 'طول الطريق', value: '350 كم', sortOrder: 1 },
  { id: 2, statKey: 'region', label: 'المنطقة', value: 'الجنوب الليبي', sortOrder: 2 },
  { id: 3, statKey: 'cities', label: 'يربط بين', value: 'أوباري – غات', sortOrder: 3 },
  { id: 4, statKey: 'executor', label: 'الجهة المنفذة', value: 'جهاز تنفيذ مشروعات المواصلات', sortOrder: 4 }
];

const INITIAL_STAGES = [
  {
    id: 1,
    name: 'أعمال المساحة والتسوية',
    description: 'الأعمال التمهيدية ومسح المسار وتسوية الأرضيات',
    percentage: 100,
    status: 'completed',
    sortOrder: 1
  },
  {
    id: 2,
    name: 'أعمال الردميات والقواعد الترابية',
    description: 'تشكيل جسم الطريق ودمك الطبقات الترابية',
    percentage: 78,
    status: 'in_progress',
    sortOrder: 2
  },
  {
    id: 3,
    name: 'أعمال الأساس والأساس المساعد',
    description: 'فرش ودمك طبقات الأساس الحصوية',
    percentage: 55,
    status: 'in_progress',
    sortOrder: 3
  },
  {
    id: 4,
    name: 'أعمال الرصف الأسفلتي',
    description: 'فرش الطبقات الأسفلتية الرابطة والسطحية',
    percentage: 32,
    status: 'in_progress',
    sortOrder: 4
  },
  {
    id: 5,
    name: 'العبّارات والمنشآت الصرفية',
    description: 'تنفيذ عبّارات تصريف مياه الأمطار والسيول',
    percentage: 40,
    status: 'in_progress',
    sortOrder: 5
  },
  {
    id: 6,
    name: 'التخطيط والإشارات المرورية',
    description: 'الدهانات واللوحات الإرشادية وعوامل السلامة',
    percentage: 0,
    status: 'pending',
    sortOrder: 6
  }
];

const INITIAL_NEWS = [
  {
    id: 1,
    title: 'استمرار أعمال الرصف الأسفلتي في القطاع الأول من المشروع',
    excerpt: 'تواصل فرق التنفيذ أعمال فرش الطبقة الأسفلتية السطحية في القطاع الأول من طريق أوباري – غات.',
    content: `تواصل فرق التنفيذ التابعة لجهاز تنفيذ مشروعات المواصلات أعمال فرش الطبقة الأسفلتية السطحية في القطاع الأول من مشروع طريق أوباري – غات، وسط متابعة مباشرة من مكتب المشروع للالتزام بالمواصفات الفنية المعتمدة.\n\nوتشمل الأعمال الجارية فرش الطبقة الرابطة والسطحية، إضافة إلى أعمال الدمك والاختبارات المخبرية المصاحبة لضمان جودة التنفيذ.\n\nكما تجري مراقبة جودة المواد وتوزيع الآليات الثقيلة على كامل المسار لضمان إنجاز الأعمال وفق الجداول الزمنية المتفق عليها دون أي تأخير.`,
    category: 'news',
    imageKey: 'works-paving',
    publishedAt: '2026-08-28'
  },
  {
    id: 2,
    title: 'التقرير الشهري لنسب الإنجاز — أغسطس 2026',
    excerpt: 'بلغت النسبة الكلية للإنجاز تقدماً ملحوظاً في أعمال الردميات والأساسات خلال الشهر الماضي.',
    content: `أصدر مكتب مشروع طريق أوباري – غات تقريره الشهري عن نسب الإنجاز لشهر أغسطس 2026، حيث سجلت أعمال الردميات والقواعد الترابية تقدماً ملحوظاً، فيما تواصلت أعمال العبّارات والمنشآت الصرفية وفق البرنامج الزمني المعتمد.\n\nويدعو مكتب المشروع الشركات المنفذة إلى مضاعفة الجهود خلال الفترة القادمة لتعويض أي تأخير في البنود المتأخرة وتكثيف فرق العمل والآليات.\n\nويؤكد التقرير أن وتيرة العمل تسير بتنسيق يومي بين الفرق الميدانية والاستشاري المشرف، مع إعطاء أولوية قصوى لمراعاة الظروف المناخية في الجنوب.`,
    category: 'report',
    imageKey: 'works-machinery',
    publishedAt: '2026-09-01'
  },
  {
    id: 3,
    title: 'جولة تفقدية لمسار الطريق للاطلاع على سير الأعمال',
    excerpt: 'فريق من إدارة الجهاز يجري جولة ميدانية على امتداد مسار المشروع للوقوف على نسب التنفيذ.',
    content: `أجرى فريق فني من إدارة جهاز تنفيذ مشروعات المواصلات جولة ميدانية على امتداد مسار طريق أوباري – غات، شملت مواقع أعمال الرصف والعبّارات والقواعد الترابية.\n\nواطلع الفريق خلال الجولة على نسب التنفيذ الفعلية ومعوقات العمل، ووجّه بمعالجتها بالتنسيق مع الشركات المنفذة والاستشاري المشرف على المشروع.\n\nوأشاد الفريق بجهود الكوادر الوطنية العاملة في بيئة صحراوية قاسية، مشدداً على ضرورة المحافظة على أعلى معايير السلامة والجودة الإنشائية.`,
    category: 'news',
    imageKey: 'road-aerial',
    publishedAt: '2026-08-15'
  }
];

const ProjectDataContext = createContext(null);

export function ProjectDataProvider({ children }) {
  // Load from localStorage or defaults
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('ubari_stats');
      return saved ? JSON.parse(saved) : INITIAL_STATS;
    } catch {
      return INITIAL_STATS;
    }
  });

  const [stages, setStages] = useState(() => {
    try {
      const saved = localStorage.getItem('ubari_stages');
      return saved ? JSON.parse(saved) : INITIAL_STAGES;
    } catch {
      return INITIAL_STAGES;
    }
  });

  const [news, setNews] = useState(() => {
    try {
      const saved = localStorage.getItem('ubari_news');
      return saved ? JSON.parse(saved) : INITIAL_NEWS;
    } catch {
      return INITIAL_NEWS;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ubari_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ubari_stats', JSON.stringify(stats));
    } catch {}
  }, [stats]);

  useEffect(() => {
    try {
      localStorage.setItem('ubari_stages', JSON.stringify(stages));
    } catch {}
  }, [stages]);

  useEffect(() => {
    try {
      localStorage.setItem('ubari_news', JSON.stringify(news));
    } catch {}
  }, [news]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('ubari_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('ubari_user');
      }
    } catch {}
  }, [currentUser]);

  // Overall calculations
  const totalStages = stages.length;
  const completedStages = stages.filter(s => s.status === 'completed').length;
  const inProgressStages = stages.filter(s => s.status === 'in_progress').length;
  const pendingStages = stages.filter(s => s.status === 'pending').length;
  const avgProgress = totalStages > 0 
    ? Math.round(stages.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0) / totalStages) 
    : 0;

  // Actions
  const updateStage = (updatedStage) => {
    setStages(prev => prev.map(s => s.id === updatedStage.id ? { ...s, ...updatedStage } : s));
  };

  const updateStat = (updatedStat) => {
    setStats(prev => prev.map(s => s.id === updatedStat.id ? { ...s, ...updatedStat } : s));
  };

  const addNews = (newsItem) => {
    const newItem = {
      ...newsItem,
      id: Date.now(),
      publishedAt: new Date().toISOString().split('T')[0]
    };
    setNews(prev => [newItem, ...prev]);
    return newItem;
  };

  const updateNews = (updatedItem) => {
    setNews(prev => prev.map(n => n.id === updatedItem.id ? { ...n, ...updatedItem } : n));
  };

  const deleteNews = (id) => {
    setNews(prev => prev.filter(n => n.id !== id));
  };

  const login = (role = 'admin') => {
    const user = {
      id: 'admin_1',
      name: 'مدير المشروع',
      email: 'manager@transport.gov.ly',
      role: 'admin'
    };
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const value = {
    stats,
    stages,
    news,
    currentUser,
    isAuthenticated: !!currentUser,
    overview: {
      avgProgress,
      totalStages,
      completedStages,
      inProgressStages,
      pendingStages,
      newsCount: news.length
    },
    updateStage,
    updateStat,
    addNews,
    updateNews,
    deleteNews,
    login,
    logout
  };

  return (
    <ProjectDataContext.Provider value={value}>
      {children}
    </ProjectDataContext.Provider>
  );
}

export function useProjectData() {
  const context = useContext(ProjectDataContext);
  if (!context) {
    throw new Error('useProjectData must be used within ProjectDataProvider');
  }
  return context;
}
