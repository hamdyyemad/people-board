import "./globals.css";
import { geistSans, geistMono } from "@/frontend_lib/lib/fonts";
import { metadata } from "@/frontend_lib/lib/metadata";
import { ThemeProvider } from "@/frontend_lib/components/theme-provider";

// Re-export metadata for Next.js
export { metadata };

// Import debug utilities to activate console override
import "@/frontend_lib/utils/debug-init";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
