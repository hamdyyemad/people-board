import "./globals.css";
import { geistSans, geistMono } from "@/frontend_lib/lib/fonts";
import { metadata } from "@/frontend_lib/lib/metadata";
import HRDashboardLayout from "./shared/hr-dashboard-layout";

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
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <HRDashboardLayout>{children}</HRDashboardLayout>
      </body>
    </html>
  );
}
