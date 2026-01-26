import type { Metadata } from "next";
import { Bricolage_Grotesque, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { ReferralTracker } from "@/components/referral-tracker";
import { Suspense } from "react";

const display = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "TSX Studio | Neon Terminal Luxury Animation Studio",
  description: "The premium production studio for TSX/TCX animations. Paste, preview, and manage your motion projects with elite precision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${display.variable} ${body.variable} font-body antialiased min-h-screen relative`}>
        <div className="scanline" />
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <div className="relative z-10">
              <Suspense fallback={null}>
                <ReferralTracker />
              </Suspense>
              {children}
            </div>
            <Toaster position="top-right" theme="dark" closeButton />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
