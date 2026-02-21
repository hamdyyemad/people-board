import { geistSans, geistMono, metadata, getLocale } from "@/frontend_lib/lib";

import { ThemeProvider, LocaleProvider } from "@/frontend_lib/components/providers";
import { Head } from "@/frontend_lib/components/shared";

import "./globals.css";

// Re-export metadata for Next.js
export { metadata };

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <Head />
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <LocaleProvider initialLocale={locale}>
          <ThemeProvider>{children}</ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
