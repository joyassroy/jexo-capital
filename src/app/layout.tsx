import type { Metadata, Viewport } from "next";
import "./globals.css";
import CustomerServiceModal from "@/components/common/CustomerServiceModal";

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
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#0b192c] flex justify-center items-center">
        {/* Mobile centered app viewport container */}
        <main className="mobile-container overflow-hidden min-h-screen relative flex flex-col justify-between">
          <div className="flex-1 w-full pb-16">{children}</div>
          <CustomerServiceModal />
        </main>
      </body>
    </html>
  );
}

