import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { PortfolioProvider } from '@/contexts/portfolio-context';
import { ModelProvider } from '@/contexts/model-context';
import { MessageCountProvider } from "@/contexts/message-count-context";
import { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';

export const metadata: Metadata = {
  title: 'Punches',
  description: 'Think like Warren Buffett',
  icons: {
    icon: 'favicon.svg',
    shortcut: 'favicon.svg',
    apple: 'favicon.svg',
  },
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" suppressHydrationWarning>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID as string} />
      <head />
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          <ModelProvider>
            <PortfolioProvider>
              <MessageCountProvider>
                <div className="flex min-h-screen flex-col">
                  {children}
                </div>
                <Toaster />
              </MessageCountProvider>
            </PortfolioProvider>
          </ModelProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
