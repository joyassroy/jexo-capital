import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "Zexo Capital - Invest • Grow • Prosper",
  description: "Zexo Capital is a USA-based International Investment Platform.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('zexo_theme');
                if (t === 'light') {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch (e) {}

              try {
                var p = new URLSearchParams(window.location.search);
                var r = p.get('ref') || p.get('code') || p.get('invite') || p.get('referral') || p.get('invitation') || p.get('referralCode');
                if (r && r.trim()) {
                  var c = r.trim();
                  localStorage.setItem('jexo_referral_code', c);
                  sessionStorage.setItem('jexo_referral_code', c);
                  document.cookie = 'jexo_ref=' + encodeURIComponent(c) + '; path=/; max-age=2592000; SameSite=Lax';
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-[#0b192c] flex justify-center items-start transition-colors duration-300">
        <ThemeProvider>
          <LanguageProvider>
            <AppShell>{children}</AppShell>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
