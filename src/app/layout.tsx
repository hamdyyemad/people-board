import "./globals.css";
import { geistSans, geistMono } from "@/frontend_lib/lib/fonts";
import { metadata } from "@/frontend_lib/lib/metadata";
import { ThemeProvider } from "@/frontend_lib/components/theme-provider";
import { LocaleProvider } from "@/frontend_lib/components/locale-provider";
import { getLocale } from "@/frontend_lib/lib/i18n";

// Re-export metadata for Next.js
export { metadata };

// Import debug utilities to activate console override
import "@/frontend_lib/utils/debug-init";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <LocaleProvider initialLocale={locale}>
          <ThemeProvider>{children}</ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
