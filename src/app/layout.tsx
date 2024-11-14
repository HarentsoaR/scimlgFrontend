// app/layout.tsx
"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { NotificationProvider } from "@/context/NotificationContext";
import { I18nextProvider } from 'react-i18next'; // Import I18nextProvider
import i18n from "@/i18n";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NotificationProvider>
      <ToastProvider>
        {/* <I18nextProvider i18n={i18n}> Wrap children with I18nextProvider */}
          <html lang="en">
            <body className={inter.className}>{children}</body>
          </html>
        {/* </I18nextProvider> */}
      </ToastProvider>
    </NotificationProvider>
  );
}
