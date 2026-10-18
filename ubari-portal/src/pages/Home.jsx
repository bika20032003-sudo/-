import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ChevronDown, 
  ArrowLeft, 
  Route, 
  Ruler, 
  Mountain, 
  Landmark 
} from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { FadeIn, CountUp, Tilt, Float, EASING } from '../components/motion';
import { ASSETS, getImageAsset } from '../utils/assets';
import { useProjectData } from '../context/ProjectDataContext';

const FEATURES = [
  {
    icon: Route,
    title: 'مسار استراتيجي',
    desc: 'يربط مدينتي ﻱ وغات ويخدم واحات الجنوب الغربي وحركة التجارة البينية.'
  },
  {
    icon: Ruler,
    title: 'مواصفات حديثة',
    desc: 'تصميم هندسي وفق أحدث المواصفات الفنية للطرق الصحراوية وطبقات رصف عالية الجودة.'
  },
  {
    icon: Mountain,
    title: 'ملاءمة البيئة الصحراوية',
    desc: 'حلول إنشائية تراعي طبيعة التربة والمناخ الصحراوي وتصريف مياه السيول.'
  },
  {
    icon: Landmark,
    title: 'إشراف حكومي مباشر',
    desc: 'متابعة ميدانية مستمرة من جهاز تنفيذ مشروعات المواصلات وتقارير إنجاز دورية.'
  }
];

export default function Home() {
  const { stats, stages, news, overview } = useProjectData();
  const heroRef = useRef(null);
  const aboutRef = useRef(null);

  // Hero parallax effects
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  const heroY = useTransform(heroProgress, [0, 1], ['0%', '22%']);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.12]);
  const heroOpacity = useTransform(heroProgress, [0, 0.5], [1, 0]);
  const heroContentY = useTransform(heroProgress, [0, 0.5], [0, -60]);

  // About media parallax
  const { scrollYProgress: aboutScrollProgress } = useScroll({
    target: aboutRef,
    offset: ['start end', 'end start']
  });
  const parallaxImg1 = useTransform(aboutScrollProgress, [0, 1], [50, -50]);
  const parallaxImg2 = useTransform(aboutScrollProgress, [0, 1], [110, -30]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* 1. Hero Section */}
      <section ref={heroRef} className="relative h-[100svh] overflow-hidden">
        {/* Parallax Background Image */}
        <motion.div
          style={{ y: heroY, scale: heroScale }}
          className="absolute inset-0"
        >
          <img
            src={ASSETS.hero}
            alt="طريق ﻱ – غات"
            className="h-full w-full object-cover"
          />
        </motion.div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30" />

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroContentY }}
          className="absolute inset-x-0 bottom-0 z-10 px-5 pb-24 text-center md:pb-32"
        >
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: EASING }}
            className="text-[11px] font-medium uppercase tracking-[0.35em] text-white/75"
          >
            جهاز تنفيذ مشروعات المواصلات — ليبيا
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.5, ease: EASING }}
            className="mt-5 font-display text-6xl font-bold leading-[1.15] text-white md:text-8xl"
          >
            طريق ﻱ — غات
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.75, ease: EASING }}
            className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/80 md:text-lg"
          >
            شريان الجنوب الليبي — محور بري حديث يربط المدن والواحات الجنوبية
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.95, ease: EASING }}
            className="mt-9 flex flex-wrap justify-center gap-4"
          >
            <Link
              to="/progress"
              className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-transform hover:scale-105 shadow-lg"
            >
              نسب الإنجاز — {overview.avgProgress}%
            </Link>
            <a
              href="#about"
              className="rounded-full border border-white/50 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              عن المشروع
            </a>
          </motion.div>
        </motion.div>

        {/* Bouncing Chevron */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/70"
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </section>

      {/* 2. Key Metrics Section */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid grid-cols-2 gap-y-12 md:grid-cols-4">
          {stats.map((stat, idx) => (
            <FadeIn key={stat.id || stat.statKey} delay={idx * 0.12}>
              <div className="text-center md:border-e md:border-border md:last:border-e-0 px-2">
                <p className="font-display text-3xl font-bold text-foreground md:text-4xl">
                  <CountUp text={stat.value} />
                </p>
                <p className="mt-3 text-xs tracking-[0.15em] text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* 3. About Section */}
      <section id="about" className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
          <FadeIn>
            <p className="kicker text-center">نبذة عن المشروع</p>
            <h2 className="mx-auto mt-5 max-w-3xl text-center font-display text-4xl font-bold leading-snug md:text-5xl md:leading-snug">
              طريق يختصر المسافات ويصل الجنوب ببعضه
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-center leading-8 text-muted-foreground">
              يُعد مشروع طريق ﻱ – غات من المشاريع الاستراتيجية في المنطقة الجنوبية، حيث يوفر محوراً برياً حديثاً يخدم الحركة التجارية والتنقل اليومي للمواطنين، بإشراف جهاز تنفيذ مشروعات المواصلات ومتابعة ميدانية مستمرة وتقارير إنجاز دورية تُنشر عبر هذه البوابة.
            </p>
          </FadeIn>

          {/* Dual Parallax Photo Figures */}
          <div ref={aboutRef} className="mt-16 grid gap-6 md:grid-cols-2">
            <motion.figure
              style={{ y: parallaxImg1 }}
              className="overflow-hidden rounded-3xl shadow-xl shadow-black/5"
            >
              <motion.img
                src={ASSETS['road-aerial']}
                alt="مقاطع منجزة من الطريق"
                className="aspect-[4/3] w-full object-cover"
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 0.8, ease: EASING }}
              />
            </motion.figure>

            <motion.figure
              style={{ y: parallaxImg2 }}
              className="overflow-hidden rounded-3xl shadow-xl shadow-black/5"
            >
              <motion.img
                src={ASSETS['works-machinery']}
                alt="الآليات وأعمال الردميات"
                className="aspect-[4/3] w-full object-cover"
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 0.8, ease: EASING }}
              />
            </motion.figure>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
        <FadeIn>
          <p className="kicker text-center">خصائص المشروع</p>
          <h2 className="mt-5 text-center font-display text-4xl font-bold md:text-5xl">
            مشروع بمواصفات عالمية
          </h2>
        </FadeIn>

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
          {/* Left Column: Image with 3D Tilt Badge */}
          <FadeIn className="relative">
            <div className="overflow-hidden rounded-3xl shadow-2xl shadow-black/10">
              <motion.img
                src={ASSETS['works-paving']}
                alt="أعمال الرصف الأسفلتي"
                className="aspect-[4/3] w-full object-cover"
                initial={{ scale: 1.15 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: EASING }}
              />
            </div>

            <Float className="absolute -bottom-8 right-6 md:right-10" duration={5}>
              <Tilt>
                <div className="rounded-2xl border border-border bg-white/95 p-5 shadow-2xl backdrop-blur-sm">
                  <p className="font-display text-3xl font-bold text-gold" dir="ltr">
                    {overview.avgProgress}%
                  </p>
                  <p className="mt-1 text-xs tracking-wide text-muted-foreground">
                    نسبة الإنجاز الكلية
                  </p>
                  <div className="mt-3 h-1 w-32 overflow-hidden rounded-full bg-secondary" dir="ltr">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: '#a97b3f' }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${overview.avgProgress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.4, ease: EASING, delay: 0.3 }}
                    />
                  </div>
                </div>
              </Tilt>
            </Float>
          </FadeIn>

          {/* Right Column: Features List */}
          <div className="space-y-8">
            {FEATURES.map((feature, idx) => (
              <FadeIn key={feature.title} delay={idx * 0.1}>
                <div className="group flex items-start gap-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-card transition-colors group-hover:border-gold">
                    <feature.icon className="h-5 w-5 text-gold" />
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-bold">
                      {feature.title}
                    </h3>
                    <p className="mt-2 max-w-md leading-7 text-muted-foreground">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Stages & Progress Section */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
          <FadeIn>
            <p className="kicker text-center">متابعة التنفيذ</p>
            <h2 className="mt-5 text-center font-display text-4xl font-bold md:text-5xl">
              مراحل المشروع ونسب الإنجاز
            </h2>
          </FadeIn>

          <div className="mt-16">
            {stages.map((stage, idx) => (
              <FadeIn key={stage.id} delay={idx * 0.06} y={24}>
                <div className="hairline py-7 first:border-t-0 md:flex md:items-center md:justify-between md:gap-10">
                  <div className="md:max-w-md">
                    <h3 className="font-display text-2xl font-bold">
                      {stage.name}
                    </h3>
                    {stage.description && (
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {stage.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-5 md:mt-0 md:w-72 md:shrink-0">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary" dir="ltr">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: '#a97b3f' }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${stage.percentage}%` }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 1.2, ease: EASING, delay: 0.15 }}
                      />
                    </div>
                    <span className="w-12 text-left font-display text-xl font-bold text-gold" dir="ltr">
                      {stage.percentage}%
                    </span>
                  </div>

                  <span className="mt-3 inline-block text-[11px] tracking-[0.2em] text-muted-foreground md:mt-0 md:w-20 md:text-left">
                    {stage.status === 'completed'
                      ? 'مكتمل'
                      : stage.status === 'in_progress'
                      ? 'قيد التنفيذ'
                      : 'لم يبدأ'}
                  </span>
                </div>
              </FadeIn>
            ))}
            <div className="hairline" />
          </div>

          <FadeIn className="mt-12 text-center">
            <Link
              to="/progress"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-7 py-3 text-sm font-medium transition-colors hover:border-gold hover:text-gold"
            >
              <span>التفاصيل الكاملة</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* 6. Latest News & Reports Section */}
      <section className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
        <FadeIn>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="kicker">آخر المستجدات</p>
              <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
                الأخبار والتقارير
              </h2>
            </div>
            <Link
              to="/news"
              className="inline-flex items-center gap-2 text-sm font-medium text-gold hover:underline"
            >
              <span>جميع الأخبار</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </FadeIn>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {news.slice(0, 3).map((item, idx) => (
            <FadeIn key={item.id} delay={idx * 0.12}>
              <Link to={`/news/${item.id}`} className="group block">
                <article>
                  <div className="overflow-hidden rounded-2xl">
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
