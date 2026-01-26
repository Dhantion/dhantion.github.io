import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RideProvider } from "./context/RideContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BilStop",
  description: "Modern Ride Sharing App",
  icons: {
    icon: '/bulogo.png',
    shortcut: '/bulogo.png',
    apple: '/bulogo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className}>
        <NotificationProvider>
          <AuthProvider>
            <RideProvider>
              {children}
            </RideProvider>
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
