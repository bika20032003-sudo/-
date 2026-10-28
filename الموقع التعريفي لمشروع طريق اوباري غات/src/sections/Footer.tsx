import { assetUrl } from '@/lib/utils';

export default function Footer() {
  return (
    <footer id="footer" className="relative border-t border-[var(--bone)]/10 bg-[var(--ink)] px-6 py-14 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 md:flex-row md:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={assetUrl('images/logo.webp')}
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.endsWith('.png')) {
                target.src = assetUrl('images/logo.png');
              }
            }}
            alt="شعار الجهاز"
            width="64"
            height="64"
            loading="lazy"
            decoding="async"
            className="h-16 w-16 object-contain"
          />
          <div>
            <p className="font-display text-lg text-[var(--bone)]">جهاز تنفيذ مشروعات الموصلات</p>
            <p className="text-xs font-light text-[var(--mute)]">إدارة مشروعات الطرق الرئيسية — ليبيا</p>
          </div>
        </div>

        <div className="text-center md:text-left">
          <p className="text-xs font-light leading-relaxed text-[var(--mute)]">
            مشروع صيانة وتطوير طريق أوباري – غات
            <br />
            ضمن خطة «عودة الحياة» — حكومة الوحدة الوطنية
          </p>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center gap-3 border-t border-[var(--bone)]/10 pt-6 md:flex-row md:justify-between">
        <p className="text-[10px] font-light text-[var(--mute)]">
          الأرقام والمحطات وفق الإعلانات الرسمية المنشورة عن المشروع
        </p>
        <p className="num-latin text-[10px] text-[var(--mute)]">© 2026</p>
      </div>
    </footer>
  );
}
