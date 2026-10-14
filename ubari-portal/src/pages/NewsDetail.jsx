import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { getImageAsset } from '../utils/assets';
import { useProjectData } from '../context/ProjectDataContext';

export default function NewsDetail() {
  const { id } = useParams();
  const { news } = useProjectData();
  const article = news.find((n) => String(n.id) === String(id));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {!article ? (
        <div className="mx-auto max-w-3xl px-5 py-40 text-center">
          <h1 className="font-display text-3xl font-bold">الخبر غير موجود</h1>
          <Link
            to="/news"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gold hover:underline"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة للأخبار</span>
          </Link>
        </div>
      ) : (
        <article className="mx-auto max-w-3xl px-5 pt-32 pb-24 md:px-8 md:pt-40">
          {/* Back link */}
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-gold"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة إلى الأخبار والتقارير</span>
          </Link>

          {/* Kicker & Date */}
          <p className="kicker mt-8">
            {article.category === 'report' ? 'تقرير دوري' : 'خبر'} —{' '}
            <span dir="ltr">
              {new Date(article.publishedAt).toLocaleDateString('ar-LY', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </p>

          {/* Title */}
          <h1 className="mt-4 font-display text-4xl font-bold leading-snug md:text-5xl md:leading-snug">
            {article.title}
          </h1>

          {/* Featured Image */}
          <div className="mt-10 overflow-hidden rounded-3xl shadow-xl">
            <img
              src={getImageAsset(article.imageKey)}
              alt={article.title}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>

          {/* Article Body */}
          <div className="mt-12 space-y-7 text-lg leading-9 text-foreground/85 font-light">
            {article.content
              .split('\n')
              .filter(Boolean)
              .map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
          </div>
        </article>
      )}

      <SiteFooter />
    </div>
  );
}
