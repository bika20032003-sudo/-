import React from 'react';
import { Link } from 'react-router-dom';
import { ASSETS } from '../utils/assets';

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Col 1: Brand & About */}
          <div>
            <div className="flex items-center gap-3">
              <span className="block h-12 w-12 overflow-hidden rounded-full bg-white shadow-md ring-1 ring-black/10">
                <img
                  src={ASSETS.logo}
                  alt="شعار الجهاز"
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="font-display text-xl font-bold text-gold">
                جهاز تنفيذ مشروعات المواصلات
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-7 text-muted-foreground">
              البوابة الإلكترونية الرسمية لمشروع طريق أوباري – غات، لمتابعة مراحل التنفيذ ونسب الإنجاز والأخبار والتقارير الدورية الصادرة عن إدارة المشروع.
            </p>
          </div>

          {/* Col 2: Links */}
          <div>
            <h4 className="kicker mb-5">روابط</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-foreground/75 transition-colors hover:text-gold"
                >
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link
                  to="/progress"
                  className="text-foreground/75 transition-colors hover:text-gold"
                >
                  نسب الإنجاز والمراحل
                </Link>
              </li>
              <li>
                <Link
                  to="/news"
                  className="text-foreground/75 transition-colors hover:text-gold"
                >
                  الأخبار والتقارير
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-foreground/75 transition-colors hover:text-gold"
                >
                  دخول مدير المشروع
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Project info */}
          <div>
            <h4 className="kicker mb-5">المشروع</h4>
            <ul className="space-y-3 text-sm text-foreground/75">
              <li>طريق أوباري – غات</li>
              <li>المنطقة الجنوبية — ليبيا</li>
              <li>جهاز تنفيذ مشروعات المواصلات</li>
            </ul>
          </div>
        </div>

        {/* Bottom Hairline */}
        <div className="hairline mt-14 pt-6 text-center text-xs text-muted-foreground">
          جميع الحقوق محفوظة © {currentYear} — جهاز تنفيذ مشروعات المواصلات
        </div>
      </div>
    </footer>
  );
}
