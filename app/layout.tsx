import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { getUser } from "@/lib/db/users";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import { PortfolioProvider } from '@/contexts/portfolio-context';
import { ModelProvider } from '@/contexts/model-context';
import { createClient } from '@/utils/supabase/server';
import { Metadata } from 'next';

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
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    return (
      <html lang="en">
        <head>
          <title>20Punches</title>
        </head>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ModelProvider>
              <PortfolioProvider>
                <div className="flex flex-col p-4 md:p-12 h-[100vh]">
                  {children}
                </div>
                <Toaster />
              </PortfolioProvider>
            </ModelProvider>
          </ThemeProvider>
        </body>
      </html>
    );
  }
  return (
    <html lang="en">
      <head>
        <title>20Punches</title>
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ModelProvider>
            <PortfolioProvider>
              <SidebarProvider defaultOpen={defaultOpen}>
                <AppSidebar />
                <SidebarInset>
                  <Header />
                  <main className="flex-1">
                    {children}
                  </main>
                </SidebarInset>
              </SidebarProvider>
              <Toaster />
            </PortfolioProvider>
          </ModelProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
