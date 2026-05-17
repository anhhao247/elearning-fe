import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { AuthInitializer } from "@/components/auth/auth-initializer";
import { QueryProvider } from "@/components/providers/query-provider";
import { AppLayoutWrapper } from "@/components/layout/app-layout-wrapper";
import { NotificationProvider } from "@/components/providers/notification-provider";
import { GoogleAnalytics } from '@next/third-parties/google';

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Learnly - Hệ thống học trực tuyến",
  description: "Nền tảng học trực tuyến hiện đại dành cho mọi người",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={cn("h-full", "antialiased", inter.variable, "font-sans")}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <QueryProvider>
          <AuthInitializer />
          <NotificationProvider>
            <AppLayoutWrapper>{children}</AppLayoutWrapper>
          </NotificationProvider>
          <Toaster />
        </QueryProvider>
      </body>
      <GoogleAnalytics gaId="G-PYTTX0T8RK" />
    </html>
  );
}
