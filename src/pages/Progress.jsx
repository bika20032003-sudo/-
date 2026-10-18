import React from 'react';
import { motion } from 'framer-motion';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { FadeIn, CountUp, EASING } from '../components/motion';
import { useProjectData } from '../context/ProjectDataContext';

export default function Progress() {
  const { stages, overview } = useProjectData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero Header */}
      <section className="mx-auto max-w-6xl px-5 pt-32 md:px-8 md:pt-40">
        <FadeIn>
          <p className="kicker text-center">مشروع طريق أوبارﻱ – غات</p>
          <h1 className="mt-5 text-center font-display text-5xl font-bold md:text-6xl">
            نسب الإنجاز والمراحل
          </h1>
        </FadeIn>

        {/* 3 Metrics KPI Grid */}
        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-y-8">
          <FadeIn delay={0}>
            <div className="text-center">
              <p className="font-display text-4xl font-bold md:text-5xl" dir="ltr">
                <CountUp text={`${overview.avgProgress}%`} />
              </p>
              <p className="mt-2 text-xs tracking-[0.15em] text-muted-foreground">
                الإنجاز الكلي
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.12}>
            <div className="text-center border-x border-border">
              <p className="font-display text-4xl font-bold md:text-5xl" dir="ltr">
                <CountUp text={String(overview.completedStages)} />
              </p>
              <p className="mt-2 text-xs tracking-[0.15em] text-muted-foreground">
                مراحل مكتملة
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.24}>
            <div className="text-center">
              <p className="font-display text-4xl font-bold md:text-5xl" dir="ltr">
                <CountUp text={String(overview.inProgressStages)} />
              </p>
              <p className="mt-2 text-xs tracking-[0.15em] text-muted-foreground">
                قيد التنفيذ
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Global Progress Bar */}
      <section className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-20">
        <FadeIn>
          <div className="flex items-center gap-5">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary" dir="ltr">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: '#a97b3f' }}
                initial={{ width: 0 }}
                whileInView={{ width: `${overview.avgProgress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, ease: EASING }}
              />
            </div>
            <span className="font-display text-2xl font-bold text-gold" dir="ltr">
              {overview.avgProgress}%
            </span>
          </div>
          <p className="mt-5 text-center text-sm leading-7 text-muted-foreground">
            تُحدَّث نسب الإنجاز دورياً من قبل مكتب المشروع بناءً على تقارير المتابعة الميدانية والمستخلصات المعتمدة.
          </p>
        </FadeIn>
      </section>

      {/* Detailed Stages List */}
      <section className="mx-auto max-w-4xl px-5 pb-28 md:px-8">
        <div>
          {stages.map((stage, idx) => (
            <FadeIn key={stage.id} delay={idx * 0.06} y={24}>
              <div className="hairline py-8 first:border-t-0">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="font-display text-2xl font-bold md:text-3xl">
                    {stage.name}
                  </h3>
                  <span className="text-[11px] tracking-[0.2em] text-muted-foreground">
                    {stage.status === 'completed'
                      ? 'مكتمل'
                      : stage.status === 'in_progress'
                      ? 'قيد التنفيذ'
                      : 'لم يبدأ'}
                  </span>
                </div>

                {stage.description && (
                  <p className="mt-3 max-w-xl leading-8 text-muted-foreground">
                    {stage.description}
                  </p>
                )}

                <div className="mt-5 flex items-center gap-5">
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
                  <span className="w-14 text-left font-display text-2xl font-bold text-gold" dir="ltr">
                    {stage.percentage}%
                  </span>
                </div>
              </div>
            </FadeIn>
          ))}
          <div className="hairline" />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
