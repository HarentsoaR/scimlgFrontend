
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";


const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ToastProvider>
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
    </ToastProvider>
  );
}
