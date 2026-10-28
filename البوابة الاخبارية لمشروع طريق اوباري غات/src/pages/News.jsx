import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { FadeIn, EASING } from '../components/motion';
import { getImageAsset } from '../utils/assets';
import { useProjectData } from '../context/ProjectDataContext';

export default function News() {
  const { news } = useProjectData();
  const [filter, setFilter] = useState('all');

  const filteredNews = news.filter((item) => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Header */}
      <section className="mx-auto max-w-6xl px-5 pt-32 md:px-8 md:pt-40">
        <FadeIn>
          <p className="kicker text-center">مشروع طريق أوباري – غات</p>
          <h1 className="mt-5 text-center font-display text-5xl font-bold md:text-6xl">
            الأخبار والتقارير
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-center leading-8 text-muted-foreground">
            آخر أخبار المشروع والتقارير الدورية الصادرة عن مكتب إدارة المشروع
          </p>

          {/* Category Tabs */}
          <div className="mt-10 flex justify-center gap-2">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'news', label: 'الأخبار' },
              { id: 'report', label: 'التقارير الدورية' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`rounded-full px-5 py-2 text-xs font-medium transition-colors ${
                  filter === tab.id
                    ? 'bg-foreground text-background font-bold shadow-sm'
                    : 'border border-border text-muted-foreground hover:border-gold hover:text-gold'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* News Grid */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {filteredNews.map((item, idx) => (
            <FadeIn key={item.id} delay={(idx % 3) * 0.12}>
              <Link to={`/news/${item.id}`} className="group block">
                <article>
                  <div className="overflow-hidden rounded-2xl shadow-sm">
                    <motion.img
                      src={getImageAsset(item.imageKey)}
                      alt={item.title}
                      className="aspect-[4/3] w-full object-cover"
                      whileHover={{ scale: 1.07 }}
                      transition={{ duration: 0.7, ease: EASING }}
                    />
                  </div>
                  <p className="kicker mt-5">
                    {item.category === 'report' ? 'تقرير دوري' : 'خبر'} —{' '}
                    <span dir="ltr">
                      {new Date(item.publishedAt).toLocaleDateString('ar-LY', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-bold leading-snug transition-colors group-hover:text-gold">
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="mt-3 line-clamp-2 text-sm leading-7 text-muted-foreground">
                      {item.excerpt}
                    </p>
                  )}
                </article>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
