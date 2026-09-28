import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

// بيانات SEO
export const metadata: Metadata = {
  title: "منظومة إدارة المخازن | الهيئة الوطنية لخدمات نقل الدم",
  description: "منظومة إدارة مخازن الهيئة العامة لخدمات نقل الدم - ليبيا. إدارة الأصناف الطبية والمخزون وحركات المخزن.",
  keywords: "مخازن, إدارة مخزون, هيئة نقل الدم, ليبيا, مستلزمات طبية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" data-theme="light" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  if (saved === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
